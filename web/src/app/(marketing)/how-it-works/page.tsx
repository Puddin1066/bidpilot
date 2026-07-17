import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works" };

const STAGES = [
  {
    stage: "1. Intake",
    who: "You",
    body: "Choose a package, pay, and complete a short company-profile wizard. Upload your capability statement, resumes, past projects, and the live solicitation (PDF or DOCX).",
  },
  {
    stage: "2. Parsing",
    who: "Gemini — Solicitation Parser Agent",
    body: "Extracts buyer, deadlines, evaluation criteria, mandatory requirements, forms, page limits, and attachments. Every extracted item carries a page-level source citation so you can verify it in seconds.",
  },
  {
    stage: "3. Eligibility",
    who: "Gemini — Eligibility Agent",
    body: "Compares mandatory requirements against your approved evidence. Returns ELIGIBLE, CONDITIONALLY ELIGIBLE, or INELIGIBLE. It never assumes an unknown qualification is satisfied.",
  },
  {
    stage: "4. Bid/no-bid",
    who: "Gemini — Bid/No-Bid Agent",
    body: "Scores service fit, past performance, contract value, win likelihood, effort, deadline feasibility, competition, strategic value, and capacity. Recommends pursue, pursue with conditions, pursue with partner, monitor, or decline. The score is decision support, not a calibrated award probability.",
  },
  {
    stage: "5. Compliance matrix",
    who: "Gemini — Compliance Matrix Agent",
    body: "Builds the full requirements matrix: source, mandatory status, planned response section, evidence needed, evidence status, and risk level. Exportable to CSV.",
  },
  {
    stage: "6. Strategy & drafting",
    who: "Gemini — Strategy and Drafting Agents",
    body: "Designs win themes and the response outline, then writes first-draft sections using only your approved evidence, cited inline. Missing facts become visible [CUSTOMER CONFIRMATION REQUIRED] placeholders — never invented.",
  },
  {
    stage: "7. Independent verification",
    who: "Gemini — Claim Verification and Compliance Review Agents",
    body: "A separate agent splits the draft into factual claims and verifies each against evidence. Another audits the package: every mandatory requirement answered, forms included, limits observed, contradictions flagged.",
  },
  {
    stage: "8. Human exception review",
    who: "Humans",
    body: "Low-confidence findings, unsupported claims, pricing, and legal certifications are escalated to human review. Reviewer time is tracked and published in our operations metrics.",
  },
  {
    stage: "9. Delivery",
    who: "BidPilot",
    body: "You receive the bid decision, compliance matrix, checklists, and draft in your dashboard, with one revision included. You approve and submit the final bid yourself.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center">How BidPilot works</h1>
      <p className="mt-3 text-center text-slate-600">
        A deterministic workflow where Gemini agents make routine production
        decisions and humans approve legally binding or low-confidence
        exceptions.
      </p>

      <div className="mt-12 space-y-4">
        {STAGES.map((s) => (
          <div key={s.stage} className="rounded-xl border border-slate-200 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-slate-900">{s.stage}</h2>
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  s.who === "You" || s.who === "Humans"
                    ? "bg-amber-50 text-amber-700"
                    : s.who === "BidPilot"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                {s.who}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/pricing"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Choose a package
        </Link>
      </div>
    </div>
  );
}
