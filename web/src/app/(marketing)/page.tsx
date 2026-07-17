import Link from "next/link";
import { PRODUCTS, formatPrice } from "@/lib/products";

const WORKFLOW_STEPS = [
  {
    title: "Upload the solicitation",
    body: "Drop in the RFP PDF plus any amendments and appendices. BidPilot validates readability and gets to work.",
  },
  {
    title: "Gemini extracts every requirement",
    body: "The parser agent pulls the buyer, deadline, evaluation criteria, forms, page limits, and every mandatory requirement — with page-level source citations.",
  },
  {
    title: "Eligibility and bid/no-bid decisions",
    body: "Separate agents check mandatory qualifications against your approved company evidence and score the opportunity across nine weighted factors.",
  },
  {
    title: "Evidence-grounded first draft",
    body: "The drafting agent writes only from your approved evidence, cites it inline, and inserts visible placeholders where a fact still needs your confirmation.",
  },
  {
    title: "Independent verification",
    body: "A separate claim-verification agent checks every material sentence, and a compliance-review agent audits the full package before delivery.",
  },
];

const FAQ = [
  {
    q: "Does BidPilot guarantee I win the contract?",
    a: "No. BidPilot does not promise contract awards. It reduces the cost and friction of deciding whether to bid and preparing a compliant, evidence-grounded first draft. Bid scores are decision support, not a calibrated probability of award.",
  },
  {
    q: "Will the AI invent qualifications my company doesn't have?",
    a: "No. Drafts use only company evidence you have explicitly approved. A separate verification agent flags any claim without supporting evidence, and unsupported claims are surfaced — never silently shipped.",
  },
  {
    q: "Does BidPilot submit the bid for me?",
    a: "No. You retain control of pricing, legal certifications, binding representations, and final submission. BidPilot prepares the package; you approve and submit it.",
  },
  {
    q: "What happens to my documents?",
    a: "Files are stored privately with organization-level isolation, are never used to train models, and can be deleted on request. See the Trust & safety page for details.",
  },
  {
    q: "How fast is delivery?",
    a: "Bid/no-bid reports target 4 hours, the readiness package 48 hours, and complete drafts 3–5 business days. Automated delivery is often faster.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
            An AI-operated proposal department for small businesses
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto">
            Turn a 100-page RFP into a bid decision and compliant first draft.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            BidPilot analyzes the solicitation, maps every requirement, grounds
            responses in your approved company evidence, and flags anything that
            still needs human confirmation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Analyze my RFP — from $149
            </Link>
            <Link
              href="/sample"
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              See a sample report
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            48-hour readiness package · No subscription required · You approve
            everything before submission
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          Small firms lose winnable contracts before they even start writing
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "30 hours per response",
              body: "Solicitations are long, mandatory requirements are buried across appendices, and nobody on the team can spare the time.",
            },
            {
              title: "Consultants cost thousands",
              body: "Proposal consultants and enterprise software are priced for companies with dedicated proposal departments.",
            },
            {
              title: "Generic AI hallucinates",
              body: "General-purpose chatbots invent credentials and miss mandatory requirements — a nonresponsive bid is an automatic loss.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            From upload to deliverable
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-5">
            {WORKFLOW_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-xl bg-white border border-slate-200 p-5">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 text-sm">{step.title}</h3>
                <p className="mt-2 text-xs text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Example compliance matrix */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          Every requirement, sourced and tracked
        </h2>
        <p className="mt-2 text-center text-slate-600 text-sm">
          Excerpt from a compliance matrix for a synthetic demonstration RFP.
        </p>
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Requirement</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Mandatory</th>
                <th className="px-4 py-3 font-medium">Evidence</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Active state vendor registration at submission", "p.8 §3.2", "Yes", "Missing", "High"],
                ["Professional liability insurance ≥ $1M", "p.9 §3.4", "Yes", "Missing", "High"],
                ["Two comparable engagements in 5 years", "p.9 §3.5", "Yes", "Available", "Low"],
                ["Technical proposal ≤ 20 pages", "p.10 §3.7", "Yes", "Available", "Low"],
                ["Signed non-collusion certification", "p.22 Att. B", "Yes", "Needs signature", "Medium"],
              ].map((row) => (
                <tr key={row[0]}>
                  <td className="px-4 py-3 text-slate-900">{row[0]}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row[3] === "Available"
                          ? "text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 text-xs"
                          : "text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 text-xs"
                      }
                    >
                      {row[3]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Fixed-fee packages tied to your live solicitation
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRODUCTS.filter((p) =>
              ["BID_NO_BID", "READINESS_PACKAGE", "COMPLETE_DRAFT"].includes(p.type)
            ).map((p) => (
              <div
                key={p.type}
                className={`rounded-xl border p-6 bg-white ${
                  p.type === "READINESS_PACKAGE"
                    ? "border-blue-600 ring-1 ring-blue-600"
                    : "border-slate-200"
                }`}
              >
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <div className="mt-2 text-3xl font-bold text-slate-900">
                  {formatPrice(p.priceCents)}
                </div>
                <p className="mt-1 text-xs text-slate-500">Target delivery: {p.targetDelivery}</p>
                <p className="mt-3 text-sm text-slate-600">{p.tagline}</p>
                <Link
                  href={`/checkout?product=${p.type}`}
                  className="mt-5 block rounded-lg bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/pricing" className="text-blue-600 hover:underline">
              See all packages including Opportunity Match ($49) and Monitoring ($99/mo)
            </Link>
          </p>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Built to be trusted</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Approved evidence only",
              body: "Drafts cite only company facts you have approved. Unsupported claims are flagged by an independent verification agent, never shipped silently.",
            },
            {
              title: "You stay in control",
              body: "Pricing, certifications, binding representations, and final submission always require your explicit approval.",
            },
            {
              title: "Private by default",
              body: "Organization-level isolation, private file storage, no training on your documents, and deletion on request.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="rounded-xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer font-semibold text-slate-900">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Have a live solicitation on your desk?
        </h2>
        <p className="mt-3 text-slate-600">
          Get a bid decision, compliance matrix, and grounded first draft within 48 hours.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Choose a package
        </Link>
      </section>
    </>
  );
}
