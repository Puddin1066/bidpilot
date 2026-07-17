import Link from "next/link";
import type { Metadata } from "next";
import { requireOrganization } from "@/lib/auth";
import { PRODUCTS, formatPrice } from "@/lib/products";

export const metadata: Metadata = { title: "New job" };

export default async function NewJobPage() {
  await requireOrganization();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Start a new job</h1>
      <p className="mt-2 text-sm text-slate-600">
        Choose a package. After payment you&apos;ll upload the live solicitation.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <div key={p.type} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">{p.name}</h2>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {formatPrice(p.priceCents)}
              {p.recurring && <span className="text-sm font-normal text-slate-500">/mo</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600 flex-1">{p.tagline}</p>
            <p className="mt-2 text-xs text-slate-500">Target delivery: {p.targetDelivery}</p>
            <Link
              href={`/checkout?product=${p.type}`}
              className="mt-4 rounded-lg bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Select
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
