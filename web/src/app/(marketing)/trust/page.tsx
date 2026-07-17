import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trust & safety" };

const SECTIONS = [
  {
    title: "Grounded drafting, verified claims",
    items: [
      "Proposal drafts use only company evidence you have explicitly approved.",
      "An independent claim-verification agent checks every material sentence against evidence and flags anything unsupported, contradictory, or ambiguous.",
      "Missing facts become visible [CUSTOMER CONFIRMATION REQUIRED] placeholders. BidPilot never invents customers, results, credentials, staff, prices, or certifications.",
    ],
  },
  {
    title: "You keep control of binding decisions",
    items: [
      "Pricing, legal certifications, binding representations, and final submission always require your explicit approval.",
      "Bid/no-bid scores are decision support, not a calibrated probability of award.",
      "BidPilot does not provide legal advice and does not guarantee contract awards.",
    ],
  },
  {
    title: "Data protection",
    items: [
      "Files are encrypted in transit and at rest, stored privately with signed, expiring URLs.",
      "Organization-level tenant isolation is enforced at the database layer with row-level security.",
      "Your documents are never used to train AI models.",
      "Deletion requests are honored; source documents are retained only as long as needed to deliver and support your package.",
      "Past proposals are used as reusable content only after your confirmation.",
    ],
  },
  {
    title: "Auditability",
    items: [
      "Every AI decision is logged with model name, prompt version, timestamp, token usage, cost, and confidence.",
      "Human overrides and reviewer time are recorded.",
      "Demo and synthetic data are kept strictly separate from customer data and clearly labeled.",
    ],
  },
];

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center">Trust &amp; safety</h1>
      <p className="mt-3 text-center text-slate-600">
        BidPilot is built for a domain where a hallucinated qualification can
        cost you a contract. These are the controls we run on every job.
      </p>
      <div className="mt-12 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900">{s.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
