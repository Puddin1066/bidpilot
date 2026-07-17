import type { SupabaseClient } from "@supabase/supabase-js";
import {
  runSolicitationParser,
  runEligibilityAgent,
  runBidDecisionAgent,
  runComplianceMatrixAgent,
  runStrategyAgent,
  runDraftingAgent,
  runClaimVerificationAgent,
  runComplianceReviewAgent,
  type EvidenceInput,
} from "@/lib/ai/agents";
import {
  type ParsedSolicitation,
  type ComplianceMatrix,
  type DraftResult,
  type CompanyProfile,
} from "@/lib/schemas/agents";

/**
 * Deterministic job state machine (spec 5.2 / 10.1). Each call to advanceJob
 * performs exactly one workflow stage using Gemini for bounded tasks, records
 * results, and moves the job to its next status. Customer-gated states
 * (INTAKE_REQUIRED, CUSTOMER_CLARIFICATION, BID_DECISION_READY,
 * HUMAN_EXCEPTION_REVIEW) are advanced by explicit user actions, not here.
 */

export type PipelineOutcome = {
  previousStatus: string;
  newStatus: string;
  detail: string;
};

/** Statuses advanceJob can process autonomously. */
export const AUTO_STATUSES = [
  "DOCUMENTS_UPLOADED",
  "ELIGIBILITY_REVIEW",
  "COMPLIANCE_MAPPING",
  "DRAFTING",
  "QUALITY_REVIEW",
  "READY_FOR_DELIVERY",
] as const;

interface JobRow {
  id: string;
  organization_id: string;
  solicitation_id: string | null;
  product_type: string;
  status: string;
}

async function getJob(supabase: SupabaseClient, jobId: string): Promise<JobRow> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, organization_id, solicitation_id, product_type, status")
    .eq("id", jobId)
    .single();
  if (error) throw new Error(`Job not found: ${error.message}`);
  return data as JobRow;
}

async function setStatus(supabase: SupabaseClient, jobId: string, status: string) {
  const { error } = await supabase.from("jobs").update({ status }).eq("id", jobId);
  if (error) throw new Error(`Failed to set status: ${error.message}`);
}

async function getApprovedEvidence(
  supabase: SupabaseClient,
  organizationId: string
): Promise<EvidenceInput[]> {
  const { data } = await supabase
    .from("evidence_items")
    .select("id, evidence_type, content, source_page")
    .eq("organization_id", organizationId)
    .eq("approved", true);
  return (data ?? []) as EvidenceInput[];
}

async function getApprovedProfile(
  supabase: SupabaseClient,
  organizationId: string
): Promise<CompanyProfile | null> {
  const { data } = await supabase
    .from("company_profiles")
    .select("profile_json, status")
    .eq("organization_id", organizationId)
    .eq("status", "APPROVED")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.profile_json as CompanyProfile) ?? null;
}

async function getParsedSolicitation(
  supabase: SupabaseClient,
  solicitationId: string
): Promise<ParsedSolicitation> {
  const { data, error } = await supabase
    .from("solicitations")
    .select("structured_data")
    .eq("id", solicitationId)
    .single();
  if (error || !data?.structured_data) {
    throw new Error("Parsed solicitation not found — run parsing first.");
  }
  return data.structured_data as ParsedSolicitation;
}

export async function advanceJob(
  supabase: SupabaseClient,
  jobId: string
): Promise<PipelineOutcome> {
  const job = await getJob(supabase, jobId);

  switch (job.status) {
    case "DOCUMENTS_UPLOADED":
      return parseStage(supabase, job);
    case "ELIGIBILITY_REVIEW":
      return eligibilityStage(supabase, job);
    case "COMPLIANCE_MAPPING":
      return complianceStage(supabase, job);
    case "DRAFTING":
      return draftingStage(supabase, job);
    case "QUALITY_REVIEW":
      return qualityStage(supabase, job);
    case "READY_FOR_DELIVERY":
      return deliverStage(supabase, job);
    default:
      return {
        previousStatus: job.status,
        newStatus: job.status,
        detail: `Status ${job.status} requires a customer or reviewer action, not automatic advancement.`,
      };
  }
}

/** Run every automatic stage until the job reaches a gated or terminal state. */
export async function runPipeline(
  supabase: SupabaseClient,
  jobId: string
): Promise<PipelineOutcome[]> {
  const outcomes: PipelineOutcome[] = [];
  for (let i = 0; i < 10; i++) {
    const job = await getJob(supabase, jobId);
    if (!(AUTO_STATUSES as readonly string[]).includes(job.status)) break;
    outcomes.push(await advanceJob(supabase, jobId));
  }
  return outcomes;
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

async function parseStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  await setStatus(supabase, job.id, "PARSING");

  // Gather solicitation source: pasted text stored on the solicitation row
  // and/or uploaded PDF files sent to Gemini inline.
  const { data: sol, error } = await supabase
    .from("solicitations")
    .select("id, source_url, structured_data")
    .eq("id", job.solicitation_id!)
    .single();
  if (error) throw new Error(`Solicitation missing: ${error.message}`);

  const pastedText =
    (sol.structured_data as { raw_text?: string } | null)?.raw_text ?? "";

  const { data: docs } = await supabase
    .from("documents")
    .select("storage_path, mime_type")
    .eq("job_id", job.id)
    .eq("document_type", "SOLICITATION");

  const fileParts: Array<{ mimeType: string; dataBase64: string }> = [];
  for (const doc of docs ?? []) {
    if (doc.mime_type !== "application/pdf") continue;
    const { data: file } = await supabase.storage.from("documents").download(doc.storage_path);
    if (file) {
      fileParts.push({
        mimeType: doc.mime_type,
        dataBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      });
    }
  }

  const result = await runSolicitationParser(supabase, job.id, pastedText, fileParts);

  const parsed = result.output;
  const { error: updateError } = await supabase
    .from("solicitations")
    .update({
      title: parsed.title,
      buyer: parsed.buyer,
      solicitation_number: parsed.solicitation_number,
      deadline: parsed.deadline,
      structured_data: { ...parsed, raw_text: pastedText || undefined },
    })
    .eq("id", sol.id);
  if (updateError) throw new Error(updateError.message);

  await setStatus(supabase, job.id, "ELIGIBILITY_REVIEW");
  return {
    previousStatus: "DOCUMENTS_UPLOADED",
    newStatus: "ELIGIBILITY_REVIEW",
    detail: `Parsed solicitation "${parsed.title}" with ${parsed.mandatory_requirements.length} mandatory requirements.`,
  };
}

async function eligibilityStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  const parsed = await getParsedSolicitation(supabase, job.solicitation_id!);
  const [profile, evidence] = await Promise.all([
    getApprovedProfile(supabase, job.organization_id),
    getApprovedEvidence(supabase, job.organization_id),
  ]);

  const eligibility = await runEligibilityAgent(supabase, job.id, parsed, profile, evidence);

  const needsClarification =
    eligibility.output.decision === "CONDITIONALLY_ELIGIBLE" &&
    eligibility.output.conditional_requirements.some((r) => r.customer_status === "UNKNOWN");

  // Always produce the bid/no-bid decision so the customer sees both together
  // (spec 10.2: mandatory eligibility failures override confidence scoring).
  const bid = await runBidDecisionAgent(supabase, job.id, parsed, eligibility.output, profile);

  const { error } = await supabase.from("bid_decisions").insert({
    job_id: job.id,
    decision: bid.output.decision,
    score: bid.output.score,
    confidence: bid.output.confidence,
    factor_scores: {
      ...bid.output.factor_scores,
      eligibility: eligibility.output,
    },
    rationale: bid.output.rationale,
  });
  if (error) throw new Error(error.message);

  const newStatus = needsClarification ? "CUSTOMER_CLARIFICATION" : "BID_DECISION_READY";
  await setStatus(supabase, job.id, newStatus);
  return {
    previousStatus: "ELIGIBILITY_REVIEW",
    newStatus,
    detail: `Eligibility: ${eligibility.output.decision}. Bid recommendation: ${bid.output.decision} (score ${bid.output.score}).`,
  };
}

async function complianceStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  const parsed = await getParsedSolicitation(supabase, job.solicitation_id!);
  const evidence = await getApprovedEvidence(supabase, job.organization_id);

  const matrix = await runComplianceMatrixAgent(supabase, job.id, parsed, evidence);

  // Replace prior rows for idempotency on re-runs.
  await supabase.from("requirements").delete().eq("job_id", job.id);
  const rows = matrix.output.rows.map((r) => ({
    job_id: job.id,
    requirement_code: r.requirement_code,
    requirement_text: r.requirement_text,
    source_page: r.source.page,
    source_section: r.source.section ?? null,
    mandatory: r.mandatory,
    evaluation_weight: r.evaluation_weight ? parseFloat(r.evaluation_weight) || null : null,
    planned_response_section: r.planned_response_section,
    evidence_status: r.evidence_status,
    risk_level: r.risk_level,
  }));
  if (rows.length > 0) {
    const { error } = await supabase.from("requirements").insert(rows);
    if (error) throw new Error(error.message);
  }

  // Bid/No-Bid Report ends here; draft products continue to drafting.
  const newStatus = job.product_type === "BID_NO_BID" ? "READY_FOR_DELIVERY" : "DRAFTING";
  await setStatus(supabase, job.id, newStatus);
  return {
    previousStatus: "COMPLIANCE_MAPPING",
    newStatus,
    detail: `Compliance matrix built with ${rows.length} requirements.`,
  };
}

async function draftingStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  const parsed = await getParsedSolicitation(supabase, job.solicitation_id!);
  const [profile, evidence] = await Promise.all([
    getApprovedProfile(supabase, job.organization_id),
    getApprovedEvidence(supabase, job.organization_id),
  ]);

  const { data: reqRows } = await supabase
    .from("requirements")
    .select("requirement_code, requirement_text, mandatory, planned_response_section, evidence_status, risk_level, source_page, source_section")
    .eq("job_id", job.id);

  const matrix: ComplianceMatrix = {
    rows: (reqRows ?? []).map((r) => ({
      requirement_code: r.requirement_code,
      requirement_text: r.requirement_text,
      source: { document: "solicitation", page: r.source_page, section: r.source_section },
      mandatory: r.mandatory,
      evaluation_weight: null,
      planned_response_section: r.planned_response_section ?? "",
      evidence_needed: "",
      evidence_status: (r.evidence_status === "CUSTOMER_CONFIRMED"
        ? "AVAILABLE"
        : r.evidence_status) as "AVAILABLE" | "MISSING" | "UNVERIFIED",
      risk_level: r.risk_level as "LOW" | "MEDIUM" | "HIGH",
    })),
  };

  const strategy = await runStrategyAgent(supabase, job.id, parsed, matrix, profile, evidence);
  const draft = await runDraftingAgent(supabase, job.id, parsed, strategy.output, evidence);

  // Replace prior sections (and cascaded claim links) on revision re-runs.
  await supabase.from("draft_sections").delete().eq("job_id", job.id);
  const { error } = await supabase.from("draft_sections").insert(
    draft.output.sections.map((s) => ({
      job_id: job.id,
      section_name: s.section_name,
      content_markdown: s.content_markdown,
      version: 1,
      status: "DRAFT",
    }))
  );
  if (error) throw new Error(error.message);

  await setStatus(supabase, job.id, "QUALITY_REVIEW");
  return {
    previousStatus: "DRAFTING",
    newStatus: "QUALITY_REVIEW",
    detail: `Strategy designed and ${draft.output.sections.length} draft sections written.`,
  };
}

async function qualityStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  const parsed = await getParsedSolicitation(supabase, job.solicitation_id!);
  const evidence = await getApprovedEvidence(supabase, job.organization_id);

  const { data: sections, error: sectionsError } = await supabase
    .from("draft_sections")
    .select("id, section_name, content_markdown")
    .eq("job_id", job.id)
    .order("created_at", { ascending: true });
  if (sectionsError || !sections?.length) {
    throw new Error("No draft sections found for quality review.");
  }

  const draft: DraftResult = {
    sections: sections.map((s) => ({
      section_name: s.section_name,
      content_markdown: s.content_markdown,
    })),
  };

  const verification = await runClaimVerificationAgent(supabase, job.id, draft, evidence);

  const sectionIdByName = new Map(sections.map((s) => [s.section_name, s.id]));
  const links = verification.output.claims
    .filter((c) => sectionIdByName.has(c.section_name))
    .map((c) => ({
      draft_section_id: sectionIdByName.get(c.section_name)!,
      claim_text: c.claim_text,
      evidence_item_id: null, // agent evidence IDs are recorded in agent_runs output
      verification_status: c.status,
      confidence: c.confidence,
    }));
  if (links.length > 0) {
    const { error } = await supabase.from("claim_evidence_links").insert(links);
    if (error) throw new Error(error.message);
  }

  // Build a fresh matrix view for the reviewer from stored requirements.
  const { data: reqRows } = await supabase
    .from("requirements")
    .select("requirement_code, requirement_text, mandatory, planned_response_section, evidence_status, risk_level, source_page, source_section")
    .eq("job_id", job.id);
  const matrix: ComplianceMatrix = {
    rows: (reqRows ?? []).map((r) => ({
      requirement_code: r.requirement_code,
      requirement_text: r.requirement_text,
      source: { document: "solicitation", page: r.source_page, section: r.source_section },
      mandatory: r.mandatory,
      evaluation_weight: null,
      planned_response_section: r.planned_response_section ?? "",
      evidence_needed: "",
      evidence_status: (r.evidence_status === "CUSTOMER_CONFIRMED"
        ? "AVAILABLE"
        : r.evidence_status) as "AVAILABLE" | "MISSING" | "UNVERIFIED",
      risk_level: r.risk_level as "LOW" | "MEDIUM" | "HIGH",
    })),
  };

  const review = await runComplianceReviewAgent(
    supabase,
    job.id,
    parsed,
    matrix,
    draft,
    verification.output
  );

  const hasHighRisk =
    review.output.result === "FAIL" ||
    verification.output.claims.some(
      (c) => c.status === "UNSUPPORTED" || c.status === "CONTRADICTORY"
    ) ||
    (review.output.confidence ?? 1) < 0.5;

  const newStatus = hasHighRisk ? "HUMAN_EXCEPTION_REVIEW" : "READY_FOR_DELIVERY";
  await setStatus(supabase, job.id, newStatus);
  return {
    previousStatus: "QUALITY_REVIEW",
    newStatus,
    detail: `Verification: ${verification.output.claims.length} claims checked. Compliance review: ${review.output.result}.`,
  };
}

async function deliverStage(supabase: SupabaseClient, job: JobRow): Promise<PipelineOutcome> {
  const { error } = await supabase
    .from("jobs")
    .update({ status: "DELIVERED", delivered_at: new Date().toISOString() })
    .eq("id", job.id);
  if (error) throw new Error(error.message);

  return {
    previousStatus: "READY_FOR_DELIVERY",
    newStatus: "DELIVERED",
    detail: "Deliverables are available in the job workspace (compliance matrix CSV, draft Markdown, audit JSON).",
  };
}
