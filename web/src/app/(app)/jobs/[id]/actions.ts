"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline";

async function getOwnedJob(jobId: string) {
  const session = await requireOrganization();
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select("id, organization_id, solicitation_id, product_type, status")
    .eq("id", jobId)
    .eq("organization_id", session.organizationId)
    .single();
  if (error || !job) throw new Error("Job not found");
  return { session, supabase, job };
}

/** Intake: store solicitation text and/or PDF, then run the pipeline. */
export async function submitIntake(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { session, supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "INTAKE_REQUIRED" && job.status !== "REVISION_REQUESTED") {
    throw new Error("Job is not awaiting intake");
  }

  const rawText = String(formData.get("solicitation_text") ?? "").trim();
  const file = formData.get("solicitation_file") as File | null;
  const deadline = String(formData.get("deadline") ?? "").trim();
  if (!rawText && (!file || file.size === 0)) {
    throw new Error("Provide the solicitation as pasted text or a PDF upload.");
  }

  // Create the solicitation record.
  const { data: sol, error: solError } = await supabase
    .from("solicitations")
    .insert({
      organization_id: session.organizationId,
      deadline: deadline || null,
      structured_data: rawText ? { raw_text: rawText } : {},
    })
    .select("id")
    .single();
  if (solError) throw new Error(solError.message);

  // Store the uploaded file privately, if provided.
  if (file && file.size > 0) {
    if (file.size > 20 * 1024 * 1024) throw new Error("File exceeds the 20 MB limit.");
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      throw new Error("Only PDF and DOCX files are accepted.");
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const storagePath = `${session.organizationId}/${jobId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, bytes, { contentType: file.type });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { error: docError } = await supabase.from("documents").insert({
      organization_id: session.organizationId,
      job_id: jobId,
      document_type: "SOLICITATION",
      filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      sha256,
      processing_status: "UPLOADED",
    });
    if (docError) throw new Error(docError.message);
  }

  const { error: jobError } = await supabase
    .from("jobs")
    .update({ solicitation_id: sol.id, status: "DOCUMENTS_UPLOADED" })
    .eq("id", jobId);
  if (jobError) throw new Error(jobError.message);

  await runPipeline(supabase, jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** Customer answers clarification questions; answers become approved evidence. */
export async function submitClarifications(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { session, supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "CUSTOMER_CLARIFICATION") throw new Error("Job is not awaiting clarification");

  const answers = String(formData.get("answers") ?? "").trim();
  if (answers) {
    const { error } = await supabase.from("evidence_items").insert({
      organization_id: session.organizationId,
      evidence_type: "OTHER",
      content: `Customer confirmation (job ${jobId}): ${answers}`,
      approved: true,
    });
    if (error) throw new Error(error.message);
  }

  await supabase.from("jobs").update({ status: "BID_DECISION_READY" }).eq("id", jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** Customer approves continuing past the bid decision. */
export async function approveContinuation(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "BID_DECISION_READY") throw new Error("Job is not at the bid decision gate");

  await supabase.from("jobs").update({ status: "COMPLIANCE_MAPPING" }).eq("id", jobId);
  await runPipeline(supabase, jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** Customer overrides the bid recommendation with a written reason (logged). */
export async function overrideBidDecision(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const reason = String(formData.get("reason") ?? "").trim();
  const { supabase } = await getOwnedJob(jobId);
  if (!reason) return;

  const { data: decision } = await supabase
    .from("bid_decisions")
    .select("id")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (decision) {
    await supabase
      .from("bid_decisions")
      .update({ human_override: reason })
      .eq("id", decision.id);
  }
  revalidatePath(`/jobs/${jobId}`);
}

/** Human exception review resolution (customer or reviewer). */
export async function resolveException(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { session, supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "HUMAN_EXCEPTION_REVIEW") throw new Error("Job is not in exception review");

  const notes = String(formData.get("notes") ?? "").trim();
  const minutes = Number(formData.get("minutes") ?? 0);

  const { error } = await supabase.from("human_reviews").insert({
    job_id: jobId,
    review_type: "EXCEPTION",
    reviewer_user_id: session.user.id,
    decision: "APPROVED",
    notes: notes || null,
    minutes_spent: Number.isFinite(minutes) ? minutes : 0,
  });
  if (error) throw new Error(error.message);

  await supabase.from("jobs").update({ status: "READY_FOR_DELIVERY" }).eq("id", jobId);
  await runPipeline(supabase, jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** One revision request is allowed per job. */
export async function requestRevision(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { session, supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "DELIVERED") throw new Error("Only delivered jobs can be revised");

  const notes = String(formData.get("notes") ?? "").trim();
  const { count } = await supabase
    .from("human_reviews")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("review_type", "REVISION");
  if ((count ?? 0) >= 1) throw new Error("One revision request has already been used.");

  await supabase.from("human_reviews").insert({
    job_id: jobId,
    review_type: "REVISION",
    reviewer_user_id: session.user.id,
    decision: "ESCALATED",
    notes: notes || null,
  });
  // Revision reruns drafting onward with the customer's notes stored as evidence.
  if (notes) {
    await supabase.from("evidence_items").insert({
      organization_id: session.organizationId,
      evidence_type: "OTHER",
      content: `Revision guidance (job ${jobId}): ${notes}`,
      approved: true,
    });
  }
  await supabase.from("jobs").update({ status: "DRAFTING" }).eq("id", jobId);
  await runPipeline(supabase, jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** Accept delivery and close the job. */
export async function acceptDelivery(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { supabase, job } = await getOwnedJob(jobId);
  if (job.status !== "DELIVERED") throw new Error("Job is not delivered");
  await supabase.from("jobs").update({ status: "COMPLETED" }).eq("id", jobId);
  revalidatePath(`/jobs/${jobId}`);
}

/** Record the bid outcome (spec 6.12). */
export async function recordOutcome(formData: FormData): Promise<void> {
  const jobId = String(formData.get("job_id"));
  const { supabase } = await getOwnedJob(jobId);

  const submitted = formData.get("submitted") === "true";
  const won = String(formData.get("won") ?? "");
  const contractValue = String(formData.get("contract_value") ?? "").trim();
  const hoursSaved = String(formData.get("hours_saved") ?? "").trim();
  const feedback = String(formData.get("feedback") ?? "").trim();

  const { error } = await supabase.from("outcomes").insert({
    job_id: jobId,
    submitted,
    won: won === "" ? null : won === "true",
    contract_value_cents: contractValue ? Math.round(parseFloat(contractValue) * 100) : null,
    customer_hours_saved: hoursSaved ? parseFloat(hoursSaved) : null,
    feedback: feedback || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/jobs/${jobId}`);
}
