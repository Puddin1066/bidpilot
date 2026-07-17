import Link from "next/link";
import type { Metadata } from "next";
import {
  mockParsedSolicitation,
  mockEligibility,
  mockBidDecision,
  mockComplianceMatrix,
  mockDraft,
  mockClaimVerification,
} from "@/lib/ai/mocks";

export const metadata: Metadata = { title: "Sample report" };

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

export default function SamplePage() {
  const parsed = mockParsedSolicitation;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        This sample uses a <strong>synthetic solicitation and a fictional company</strong>.
        No real buyer, customer, or confidential data appears on this page.
      </div>

      <h1 className="mt-8 text-3xl font-bold text-slate-900">
        Sample: 48-Hour RFP Readiness Package
      </h1>
      <p className="mt-2 text-slate-600 text-sm">
        {parsed.title} — {parsed.buyer} — #{parsed.solicitation_number}
      </p>

      {/* Parsed overview */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">1. Solicitation snapshot</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          {[
            ["Deadline", "August 8, 2026, 5:00 PM ET"],
            ["Questions due", "July 25, 2026"],
            ["Estimated value", parsed.estimated_value ?? "Not stated"],
            ["Contract term", parsed.contract_term ?? "Not stated"],
            ["Submission", parsed.submission_mechanism ?? "Not stated"],
            ["Pricing structure", parsed.pricing_structure ?? "Not stated"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-slate-200 p-4">
              <dt className="text-slate-500">{k}</dt>
              <dd className="mt-1 font-medium text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Eligibility */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">2. Eligibility decision</h2>
        <div className="mt-4 rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              {mockEligibility.decision.replaceAll("_", " ")}
            </span>
            <span className="text-sm text-slate-500">
              Confidence {(mockEligibility.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{mockEligibility.rationale}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {mockEligibility.conditional_requirements.map((r) => (
              <li key={r.requirement} className="flex gap-2 text-slate-700">
                <span className="text-amber-600">⚠</span>
                {r.requirement}{" "}
                <span className="text-slate-400 font-mono text-xs">p.{r.source_page}</span>
              </li>
            ))}
            {mockEligibility.satisfied_requirements.map((r) => (
              <li key={r.requirement} className="flex gap-2 text-slate-700">
                <span className="text-emerald-600">✓</span>
                {r.requirement}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bid decision */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">3. Bid/no-bid recommendation</h2>
        <div className="mt-4 rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {mockBidDecision.decision.replaceAll("_", " ")}
            </span>
            <span className="text-2xl font-bold text-slate-900">{mockBidDecision.score}/100</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{mockBidDecision.rationale}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {Object.entries(mockBidDecision.factor_scores).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-slate-600">{FACTOR_LABELS[key] ?? key}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-500">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance matrix */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">4. Compliance matrix (excerpt)</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Requirement</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Response section</th>
                <th className="px-3 py-2 font-medium">Evidence</th>
                <th className="px-3 py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockComplianceMatrix.rows.map((row) => (
                <tr key={row.requirement_code}>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {row.requirement_code}
                  </td>
                  <td className="px-3 py-2 text-slate-900">{row.requirement_text}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    p.{row.source.page} {row.source.section}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{row.planned_response_section}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.evidence_status === "AVAILABLE"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.evidence_status === "MISSING"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.evidence_status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{row.risk_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Draft excerpt */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">5. Evidence-grounded draft (excerpt)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Material claims cite evidence IDs inline. Missing facts are visible
          placeholders — never invented.
        </p>
        <div className="mt-4 space-y-4">
          {mockDraft.sections.slice(0, 2).map((s) => (
            <div key={s.section_name} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">{s.section_name}</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {s.content_markdown}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verification */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">6. Independent claim verification</h2>
        <div className="mt-4 space-y-3">
          {mockClaimVerification.claims.map((c) => (
            <div key={c.claim_text} className="rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    c.status === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {c.status}
                </span>
                <span className="text-slate-500 text-xs">
                  {c.section_name} · confidence {(c.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-slate-900">“{c.claim_text}”</p>
              {c.proposed_correction && (
                <p className="mt-1 text-amber-700 text-xs">→ {c.proposed_correction}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 rounded-xl bg-blue-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Get this for your live RFP</h2>
        <p className="mt-2 text-blue-100 text-sm">
          Upload your solicitation and receive the full package within 48 hours.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-white px-6 py-2.5 font-semibold text-blue-700 hover:bg-blue-50"
        >
          Choose a package
        </Link>
      </div>
    </div>
  );
}
