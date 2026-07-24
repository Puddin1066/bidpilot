import Link from "next/link";
import type { Metadata } from "next";
import { requireOrganization } from "@/lib/auth";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { isMockPaymentMode } from "@/lib/env";

export const metadata: Metadata = { title: "New job" };

export default async function NewJobPage() {
  await requireOrganization();
  const mockPay = isMockPaymentMode();
  const automated = PRODUCTS.filter((p) => p.automated);
  const upcoming = PRODUCTS.filter((p) => !p.automated);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Start a new job</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose a package. After checkout you&apos;ll upload the live solicitation.
        {mockPay && (
          <>
            {" "}
            <span className="font-medium text-amber-800">
              MOCK PAYMENT MODE is on — no charge; mock purchases are excluded from revenue.
            </span>
          </>
        )}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {automated.map((p) => (
          <div key={p.type} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">{p.name}</h2>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {formatPrice(p.priceCents)}
            </div>
            <p className="mt-2 text-sm text-slate-600 flex-1">{p.tagline}</p>
            <p className="mt-2 text-xs text-slate-500">Target delivery: {p.targetDelivery}</p>
            <p className="mt-1 text-xs font-medium text-emerald-700">AI pipeline included</p>
            <Link
              href={`/checkout?product=${p.type}`}
              className="mt-4 rounded-lg bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Select
            </Link>
          </div>
        ))}
      </div>

      {upcoming.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900">Coming next</h2>
          <p className="mt-1 text-sm text-slate-600">
            Listed for pricing transparency; the automated RFP pipeline is the
            live product today.
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((p) => (
              <div
                key={p.type}
                className="flex flex-col rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 opacity-80"
              >
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <div className="mt-1 text-xl font-bold text-slate-700">
                  {formatPrice(p.priceCents)}
                  {p.recurring && <span className="text-sm font-normal text-slate-500">/mo</span>}
                </div>
                <p className="mt-2 text-sm text-slate-600 flex-1">{p.tagline}</p>
                <span className="mt-4 rounded-lg border border-slate-300 py-2 text-center text-sm text-slate-500">
                  Not available in this release
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
