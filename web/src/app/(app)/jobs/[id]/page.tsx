import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProduct, formatPrice } from "@/lib/products";
import StatusBadge from "@/components/StatusBadge";
import type { EligibilityResult } from "@/lib/schemas/agents";
import {
  submitIntake,
  submitClarifications,
  approveContinuation,
  overrideBidDecision,
  resolveException,
  requestRevision,
  acceptDelivery,
  recordOutcome,
  retryPipeline,
} from "./actions";
import PipelineAutoRefresh from "@/components/PipelineAutoRefresh";

export const maxDuration = 300;

const FACTOR_LABELS: Record<string, string> = {
  service_fit: "Service fit (20%)",
  past_performance_fit: "Past performance (15%)",
  contract_value_attractiveness: "Contract value (15%)",
  estimated_win_probability: "Win likelihood (15%)",
  proposal_effort: "Proposal effort (10%)",
  deadline_feasibility: "Deadline feasibility (10%)",
  competitive_intensity: "Competitive intensity (5%)",
  strategic_value: "Strategic value (5%)",
  delivery_capacity: "Delivery capacity (5%)",
};

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireOrganization();
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, solicitations(*)")
    .eq("id", id)
    .eq("organization_id", session.organizationId)
    .maybeSingle();
  if (!job) notFound();

  const product = getProduct(job.product_type);

  const [
    { data: bidDecision },
    { data: requirements },
    { data: draftSections },
    { data: agentRuns },
    { data: outcome },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("bid_decisions")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("requirements").select("*").eq("job_id", id).order("requirement_code"),
    supabase
      .from("draft_sections")
      .select("*, claim_evidence_links(*)")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("agent_runs")
      .select("id, agent_name, model_name, prompt_version, status, is_mocked, confidence, token_input, token_output, estimated_cost_cents, duration_ms, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("outcomes").select("*").eq("job_id", id).order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("human_reviews").select("*").eq("job_id", id).order("created_at", { ascending: true }),
  ]);

  const sol = job.solicitations as {
    title: string | null;
    buyer: string | null;
    solicitation_number: string | null;
    deadline: string | null;
    structured_data: Record<string, unknown> | null;
  } | null;

  const eligibility = (bidDecision?.factor_scores as { eligibility?: EligibilityResult } | null)
    ?.eligibility;
  const factorScores = Object.entries(
    (bidDecision?.factor_scores ?? {}) as Record<string, unknown>
  ).filter(([k, v]) => k !== "eligibility" && typeof v === "number") as Array<[string, number]>;

  const flaggedClaims = (draftSections ?? []).flatMap((s) =>
    ((s.claim_evidence_links ?? []) as Array<{
      id: string;
      claim_text: string;
      verification_status: string;
      confidence: number | null;
    }>).map((c) => ({ ...c, section_name: s.section_name }))
  );

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
        ← Dashboard
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{product?.name ?? job.product_type}</h1>
        <StatusBadge status={job.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {sol?.title ? `${sol.title} — ${sol.buyer ?? ""}` : "Solicitation not uploaded yet"}
        {" · "}Paid {formatPrice(job.price_paid_cents)}
        {job.stripe_payment_id?.startsWith("MOCK-") && (
          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
            MOCK PAYMENT
          </span>
        )}
      </p>

      {/* INTAKE */}
      {(job.status === "INTAKE_REQUIRED") && (
        <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-slate-900">Upload your solicitation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste the solicitation text and/or upload a PDF or Markdown/TXT file.
            Analysis starts immediately after submission and may take a few minutes.
            Judges: use{" "}
            <code className="rounded bg-white px-1 text-xs">docs/demo/synthetic-rfp-ocean-state-training.md</code>.
          </p>
          <form action={submitIntake} className="mt-4 space-y-4">
            <input type="hidden" name="job_id" value={job.id} />
            <div>
              <label htmlFor="solicitation_text" className="block text-sm font-medium text-slate-700">
                Solicitation text (paste)
              </label>
              <textarea
                id="solicitation_text"
                name="solicitation_text"
                rows={8}
                placeholder="Paste the full RFP text here…"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="solicitation_file" className="block text-sm font-medium text-slate-700">
                  Or upload PDF / Markdown / TXT (max 20 MB)
                </label>
                <input
                  id="solicitation_file"
                  name="solicitation_file"
                  type="file"
                  accept=".pdf,.md,.txt,text/plain,text/markdown"
                  className="mt-1 w-full text-sm"
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">
                  Submission deadline (if known)
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Submit and start analysis
            </button>
          </form>
        </section>
      )}

      {/* PIPELINE FAILURE / RETRY */}
      {(job.status === "PIPELINE_FAILED" || job.status === "PARSING") && (
        <section className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-slate-900">
            {job.status === "PARSING" ? "Analysis still running or interrupted" : "Analysis failed"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            You can retry without re-uploading. Check the agent audit log below for details.
          </p>
          <form action={retryPipeline} className="mt-4">
            <input type="hidden" name="job_id" value={job.id} />
            <button
              type="submit"
              className="rounded-lg bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-800"
            >
              Retry analysis
            </button>
          </form>
        </section>
      )}

      {/* CLARIFICATION */}
      {job.status === "CUSTOMER_CLARIFICATION" && eligibility && (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-slate-900">We need a few confirmations</h2>
          <p className="mt-1 text-sm text-slate-600">
            The eligibility agent could not verify these requirements from your
            approved evidence. Nothing is ever assumed satisfied.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {eligibility.conditional_requirements.map((r) => (
              <li key={r.requirement} className="flex gap-2">
                <span className="text-amber-600">⚠</span>
                {r.requirement}
                {r.source_page && (
                  <span className="text-slate-400 font-mono text-xs">p.{r.source_page}</span>
                )}
              </li>
            ))}
          </ul>
          <form action={submitClarifications} className="mt-4 space-y-3">
            <input type="hidden" name="job_id" value={job.id} />
            <textarea
              name="answers"
              rows={4}
              required
              placeholder="Answer each item above (e.g. 'We carry $2M professional liability insurance with Acme Insurance; active state vendor registration #12345')."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Submit confirmations
            </button>
          </form>
        </section>
      )}

      {/* BID DECISION */}
      {bidDecision && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Bid/no-bid decision</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {String(bidDecision.decision).replaceAll("_", " ")}
            </span>
            <span className="text-2xl font-bold text-slate-900">{bidDecision.score}/100</span>
            <span className="text-sm text-slate-500">
              confidence {((bidDecision.confidence ?? 0) * 100).toFixed(0)}%
            </span>
          </div>
          {eligibility && (
            <p className="mt-2 text-sm">
              <span className="font-medium text-slate-700">Eligibility: </span>
              <span
                className={
                  eligibility.decision === "INELIGIBLE" ? "text-red-700" : "text-slate-600"
                }
              >
                {eligibility.decision.replaceAll("_", " ")} — {eligibility.rationale}
              </span>
            </p>
          )}
          <p className="mt-2 text-sm text-slate-600">{bidDecision.rationale}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {factorScores.map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-slate-600">{FACTOR_LABELS[key] ?? key}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
                </div>
                <span className="w-8 text-right text-slate-500">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This score is decision support, not a calibrated probability of award.
          </p>
          {bidDecision.human_override && (
            <p className="mt-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-800">
              <strong>Your override:</strong> {bidDecision.human_override}
            </p>
          )}

          {job.status === "BID_DECISION_READY" && (
            <div className="mt-5 border-t border-slate-100 pt-4 space-y-4">
              <form action={approveContinuation}>
                <input type="hidden" name="job_id" value={job.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {job.product_type === "BID_NO_BID"
                    ? "Continue to compliance matrix"
                    : "Continue to compliance mapping and drafting"}
                </button>
                <p className="mt-1 text-xs text-slate-500">
                  This runs the remaining pipeline stages and may take a few minutes.
                </p>
              </form>
              {!bidDecision.human_override && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-600">
                    Disagree with the recommendation? Record an override.
                  </summary>
                  <form action={overrideBidDecision} className="mt-2 flex gap-2">
                    <input type="hidden" name="job_id" value={job.id} />
                    <input
                      name="reason"
                      required
                      placeholder="Written reason for the override"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      Log override
                    </button>
                  </form>
                </details>
              )}
            </div>
          )}
        </section>
      )}

      {/* REQUIREMENTS */}
      {(requirements ?? []).length > 0 && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">
              Compliance matrix ({requirements!.length} requirements)
            </h2>
            <a
              href={`/api/jobs/${job.id}/export/compliance`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              Download CSV
            </a>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Requirement</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Mandatory</th>
                  <th className="px-3 py-2 font-medium">Evidence</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements!.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{r.requirement_code}</td>
                    <td className="px-3 py-2 text-slate-900">{r.requirement_text}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                      {r.source_page ? `p.${r.source_page}` : ""} {r.source_section ?? ""}
                    </td>
                    <td className="px-3 py-2">{r.mandatory ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          r.evidence_status === "AVAILABLE" || r.evidence_status === "CUSTOMER_CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : r.evidence_status === "MISSING"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.evidence_status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* DRAFT */}
      {(draftSections ?? []).length > 0 && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Proposal draft</h2>
            <a
              href={`/api/jobs/${job.id}/export/draft`}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
            >
              Download Markdown
            </a>
          </div>
          <div className="mt-4 space-y-4">
            {draftSections!.map((s) => (
              <details key={s.id} className="rounded-lg border border-slate-200 p-4" open>
                <summary className="cursor-pointer font-medium text-slate-900">
                  {s.section_name}
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {s.content_markdown}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* VERIFICATION */}
      {flaggedClaims.length > 0 && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Claim verification ({flaggedClaims.length} claims checked)
          </h2>
          <div className="mt-4 space-y-2">
            {flaggedClaims.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm border-b border-slate-100 pb-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    c.verification_status === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : c.verification_status === "UNSUPPORTED" || c.verification_status === "CONTRADICTORY"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {c.verification_status}
                </span>
                <span className="text-slate-700">“{c.claim_text}”</span>
                <span className="text-xs text-slate-400">({c.section_name})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXCEPTION REVIEW */}
      {job.status === "HUMAN_EXCEPTION_REVIEW" && (
        <section className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-slate-900">Human review required</h2>
          <p className="mt-1 text-sm text-slate-600">
            The quality review found unsupported claims or compliance defects
            (see above). Review the flagged items, then approve the package for
            delivery. Your review is logged with time spent.
          </p>
          <form action={resolveException} className="mt-4 space-y-3">
            <input type="hidden" name="job_id" value={job.id} />
            <textarea
              name="notes"
              rows={3}
              placeholder="Review notes (what you checked, what you corrected)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3">
              <input
                name="minutes"
                type="number"
                min={0}
                placeholder="Minutes spent"
                className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Approve for delivery
              </button>
            </div>
          </form>
        </section>
      )}

      {/* DELIVERED */}
      {["DELIVERED", "COMPLETED"].includes(job.status) && (
        <section className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="font-semibold text-slate-900">Deliverables</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {(requirements ?? []).length > 0 && (
              <a
                href={`/api/jobs/${job.id}/export/compliance`}
                className="rounded-lg bg-white border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
              >
                Compliance matrix (CSV)
              </a>
            )}
            {(draftSections ?? []).length > 0 && (
              <a
                href={`/api/jobs/${job.id}/export/draft`}
                className="rounded-lg bg-white border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
              >
                Proposal draft (Markdown)
              </a>
            )}
            <a
              href={`/api/jobs/${job.id}/export/audit`}
              className="rounded-lg bg-white border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
            >
              Audit log (JSON)
            </a>
          </div>

          {job.status === "DELIVERED" && (
            <div className="mt-5 border-t border-emerald-100 pt-4 flex flex-wrap gap-6">
              <form action={acceptDelivery}>
                <input type="hidden" name="job_id" value={job.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Accept delivery
                </button>
              </form>
              {!(reviews ?? []).some((r) => r.review_type === "REVISION") && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-600">
                    Request your one included revision
                  </summary>
                  <form action={requestRevision} className="mt-2 flex gap-2">
                    <input type="hidden" name="job_id" value={job.id} />
                    <input
                      name="notes"
                      required
                      placeholder="What should change?"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      Request revision
                    </button>
                  </form>
                </details>
              )}
            </div>
          )}
        </section>
      )}

      {/* OUTCOME */}
      {job.status === "COMPLETED" && !outcome && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Record the outcome</h2>
          <p className="mt-1 text-sm text-slate-600">
            This helps improve future decision support and documents impact.
          </p>
          <form action={recordOutcome} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="job_id" value={job.id} />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="submitted" value="true" /> We submitted the bid
            </label>
            <select name="won" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Outcome pending</option>
              <option value="true">Won</option>
              <option value="false">Lost</option>
            </select>
            <input
              name="contract_value"
              type="number"
              step="0.01"
              placeholder="Contract value ($)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="hours_saved"
              type="number"
              step="0.5"
              placeholder="Estimated hours saved"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              name="feedback"
              rows={2}
              placeholder="Feedback on the deliverable (optional)"
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Save outcome
            </button>
          </form>
        </section>
      )}
      {outcome && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-900">Outcome</h2>
          <p className="mt-2">
            {outcome.submitted ? "Bid submitted." : "Bid not submitted."}{" "}
            {outcome.won === true && "Contract won."}
            {outcome.won === false && "Contract lost."}
            {outcome.won === null && "Award pending."}
            {outcome.customer_hours_saved && ` ~${outcome.customer_hours_saved} hours saved.`}
          </p>
          {outcome.feedback && <p className="mt-1 italic text-slate-600">“{outcome.feedback}”</p>}
        </section>
      )}

      {/* AUDIT LOG */}
      {(agentRuns ?? []).length > 0 && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">AI audit log</h2>
          <p className="mt-1 text-xs text-slate-500">
            Every agent execution is recorded immutably: model, prompt version,
            tokens, cost, and confidence. Mocked runs are clearly labeled.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Agent</th>
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Tokens in/out</th>
                  <th className="px-3 py-2 font-medium">Cost</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                  <th className="px-3 py-2 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentRuns!.map((run) => (
                  <tr key={run.id}>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">{run.agent_name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {run.is_mocked ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
                          MOCKED
                        </span>
                      ) : (
                        run.model_name
                      )}
                    </td>
                    <td className="px-3 py-2">{run.status}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {run.token_input}/{run.token_output}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {run.estimated_cost_cents > 0 ? `${run.estimated_cost_cents}¢` : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {run.duration_ms > 0 ? `${(run.duration_ms / 1000).toFixed(1)}s` : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {run.confidence != null ? `${(run.confidence * 100).toFixed(0)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pipeline running hint */}
      <PipelineAutoRefresh
        active={["PARSING", "ELIGIBILITY_REVIEW", "COMPLIANCE_MAPPING", "DRAFTING", "QUALITY_REVIEW", "DOCUMENTS_UPLOADED"].includes(
          job.status
        )}
      />
      {["PARSING", "ELIGIBILITY_REVIEW", "COMPLIANCE_MAPPING", "DRAFTING", "QUALITY_REVIEW", "DOCUMENTS_UPLOADED"].includes(
        job.status
      ) && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          The pipeline is processing this stage. This page refreshes automatically.
          {job.status === "PARSING" && (
            <span className="mt-2 block text-slate-500">
              If this stays on Parsing for several minutes, use Retry analysis above.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
