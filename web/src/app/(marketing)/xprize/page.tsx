import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "XPRIZE transparency" };
export const revalidate = 300;

interface PublicMetrics {
  revenue_by_month: Record<
    string,
    { arms_length_cents: number | null; related_party_cents: number | null }
  >;
  total_expenses_cents: number;
  marketing_spend_cents: number;
  paying_organizations: number;
  jobs_completed: number;
  agent_decisions: number;
  gemini_production_calls: number;
  requirements_extracted: number;
  unsupported_claims_caught: number;
  human_review_minutes_total: number;
  small_businesses_served: number;
  contract_value_pursued_cents: number;
}

function dollars(cents: number | null | undefined): string {
  return `$${(((cents ?? 0) as number) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const AI_TASKS = [
  "Parse solicitations and extract every requirement with page citations",
  "Decide eligibility against approved company evidence",
  "Score and recommend bid/no-bid",
  "Build the compliance matrix",
  "Design response strategy and write evidence-grounded drafts",
  "Verify every material claim against evidence",
  "Audit the final package for compliance defects",
];

const HUMAN_TASKS = [
  "Approve pricing and legal certifications",
  "Sign binding representations",
  "Resolve low-confidence and high-risk exceptions",
  "Approve final submission",
];

export default async function XprizePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("xprize_public_metrics");
  const metrics: PublicMetrics | null = error ? null : (data as PublicMetrics);

  const months = ["2026-05", "2026-06", "2026-07", "2026-08"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center">
        Build with Gemini XPRIZE transparency
      </h1>
      <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
        BidPilot is an entrant in the Build with Gemini XPRIZE (Small Business
        Services category). This page shows how the business is operated by AI
        and reports aggregate metrics computed directly from production database
        events — never manually typed numbers.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">AI-operated tasks (Gemini)</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
            {AI_TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">Human-controlled tasks</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
            {HUMAN_TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>

      <h2 className="mt-14 text-2xl font-bold text-slate-900 text-center">
        Live aggregate metrics
      </h2>
      {!metrics ? (
        <p className="mt-4 text-center text-sm text-slate-500">
          Metrics are temporarily unavailable.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Paying organizations", String(metrics.paying_organizations)],
              ["Jobs completed", String(metrics.jobs_completed)],
              ["Small businesses served", String(metrics.small_businesses_served)],
              ["AI agent decisions", String(metrics.agent_decisions)],
              ["Gemini production calls", String(metrics.gemini_production_calls)],
              ["Requirements extracted", String(metrics.requirements_extracted)],
              ["Unsupported claims caught", String(metrics.unsupported_claims_caught)],
              ["Human review minutes", String(metrics.human_review_minutes_total)],
              ["Contract value pursued", dollars(metrics.contract_value_pursued_cents)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-5 text-center">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="mt-1 text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-12 text-lg font-bold text-slate-900 text-center">
            Revenue by month (net of refunds)
          </h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Arms-length revenue</th>
                  <th className="px-4 py-3 font-medium">Related-party revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {months.map((m) => {
                  const row = metrics.revenue_by_month?.[m];
                  return (
                    <tr key={m}>
                      <td className="px-4 py-3 font-medium text-slate-900">{m}</td>
                      <td className="px-4 py-3">{dollars(row?.arms_length_cents)}</td>
                      <td className="px-4 py-3">{dollars(row?.related_party_cents)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500 text-center">
            Arms-length third-party revenue is reported separately from
            related-party revenue per official competition rules. Total
            expenses to date: {dollars(metrics.total_expenses_cents)} · Marketing
            and customer-acquisition spend: {dollars(metrics.marketing_spend_cents)}.
          </p>
        </>
      )}

      <div className="mt-14 rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
        <h2 className="font-semibold text-slate-900">For judges</h2>
        <p className="mt-2">
          Judges receive free access through the end of the judging period
          (September 15, 2026), including a seeded judge account with a
          synthetic solicitation and fictional company profile. Testing
          instructions and credentials are provided in the private submission
          materials. No customer-confidential information is exposed to judge
          accounts or on this page.
        </p>
      </div>
    </div>
  );
}
