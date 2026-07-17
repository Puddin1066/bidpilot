import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, formatPrice } from "@/lib/products";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  const fixedFee = PRODUCTS.filter((p) => !p.recurring);
  const subscriptions = PRODUCTS.filter((p) => p.recurring);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 text-center">
        Fixed-fee packages for live solicitations
      </h1>
      <p className="mt-3 text-center text-slate-600 max-w-2xl mx-auto">
        Buy a specific outcome tied to a specific RFP — no seats, no
        implementation project. Subscriptions come later, if you want them.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {fixedFee.map((p) => (
          <div
            key={p.type}
            className={`flex flex-col rounded-xl border p-6 ${
              p.type === "READINESS_PACKAGE"
                ? "border-blue-600 ring-1 ring-blue-600"
                : "border-slate-200"
            }`}
          >
            {p.type === "READINESS_PACKAGE" && (
              <span className="mb-2 self-start rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Most popular
              </span>
            )}
            <h2 className="font-semibold text-slate-900">{p.name}</h2>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {formatPrice(p.priceCents)}
            </div>
            <p className="mt-1 text-xs text-slate-500">Target delivery: {p.targetDelivery}</p>
            <p className="mt-3 text-sm text-slate-600">{p.tagline}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
              {p.deliverables.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  {d}
                </li>
              ))}
            </ul>
            <Link
              href={`/checkout?product=${p.type}`}
              className="mt-6 rounded-lg bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Buy {p.name}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold text-slate-900 text-center">
        Ongoing monitoring
      </h2>
      <div className="mt-6 mx-auto max-w-md">
        {subscriptions.map((p) => (
          <div key={p.type} className="rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900">{p.name}</h3>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {formatPrice(p.priceCents)}
              <span className="text-base font-normal text-slate-500">/month</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {p.deliverables.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-emerald-600">✓</span>
                  {d}
                </li>
              ))}
            </ul>
            <Link
              href={`/checkout?product=${p.type}`}
              className="mt-6 block rounded-lg border border-blue-600 py-2 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Start monitoring
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto">
        BidPilot prepares analysis and drafts; it does not guarantee contract
        awards, provide legal advice, or submit bids. You approve pricing,
        certifications, and final submission. Judges evaluating the Build with
        Gemini XPRIZE receive free access — see the XPRIZE page.
      </p>
    </div>
  );
}
