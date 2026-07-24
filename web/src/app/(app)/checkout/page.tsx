import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireOrganization, isComplimentaryCheckout } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import {
  getProduct,
  formatPrice,
  resolveCheckoutPriceCents,
  FOUNDING_PROMO_CODE,
} from "@/lib/products";
import { env, isMockPaymentMode } from "@/lib/env";

export const metadata: Metadata = { title: "Checkout" };

async function startStripeCheckout(formData: FormData) {
  "use server";
  const session = await requireOrganization();
  // Judges / demo orgs never go through live Stripe.
  if (isComplimentaryCheckout(session)) {
    redirect(`/checkout?product=${String(formData.get("product"))}`);
  }
  const product = getProduct(String(formData.get("product")));
  if (!product || !product.automated) redirect("/jobs/new");
  const promo = String(formData.get("promo") ?? "");
  const { priceCents, isFounding } = resolveCheckoutPriceCents(product, promo);

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: product.recurring ? "subscription" : "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: isFounding
              ? `BidPilot — ${product.name} (Founding customer)`
              : `BidPilot — ${product.name}`,
          },
          unit_amount: priceCents,
          ...(product.recurring ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      },
    ],
    metadata: {
      organization_id: session.organizationId,
      product_type: product.type,
      founding_promo: isFounding ? "true" : "false",
    },
    customer_email: session.user.email,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
  });
  redirect(checkout.url!);
}

async function createMockPaidJob(formData: FormData) {
  "use server";
  const session = await requireOrganization();
  const product = getProduct(String(formData.get("product")));
  if (!product || !product.automated) redirect("/jobs/new");

  // Allowed when Stripe is unset (dev) OR for complimentary judge/demo orgs.
  // Never records a revenue_transactions row.
  if (!isMockPaymentMode() && !isComplimentaryCheckout(session)) {
    redirect(`/checkout?product=${product.type}`);
  }

  const promo = String(formData.get("promo") ?? "");
  const { priceCents } = resolveCheckoutPriceCents(product, promo);
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: session.organizationId,
      product_type: product.type,
      status: "INTAKE_REQUIRED",
      price_paid_cents: priceCents,
      stripe_payment_id: `MOCK-${Date.now()}`,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to create job: ${error.message}`);
  redirect(`/jobs/${job.id}`);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; promo?: string }>;
}) {
  const session = await requireOrganization();
  const params = await searchParams;
  const product = getProduct(params.product ?? "");
  if (!product) redirect("/pricing");
  if (!product.automated) redirect("/jobs/new");

  const complimentary = isComplimentaryCheckout(session);
  const mockEnv = isMockPaymentMode();
  const freeCheckout = mockEnv || complimentary;
  const { priceCents, isFounding } = resolveCheckoutPriceCents(product, params.promo);

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Checkout</h1>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-slate-900">{product.name}</h2>
          <div className="text-right">
            {isFounding && (
              <div className="text-sm text-slate-400 line-through">
                {formatPrice(product.priceCents)}
              </div>
            )}
            <div className="text-2xl font-bold text-slate-900">
              {formatPrice(priceCents)}
              {product.recurring && <span className="text-sm font-normal text-slate-500">/mo</span>}
            </div>
          </div>
        </div>
        {isFounding && (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            Founding-customer price (first 5 RI firms) — locked for your next two packages.
          </p>
        )}
        <p className="mt-2 text-sm text-slate-600">{product.tagline}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          {product.deliverables.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              {d}
            </li>
          ))}
        </ul>

        {freeCheckout ? (
          <>
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              {complimentary ? (
                <>
                  <strong>XPRIZE judge / demo access:</strong> no charge. This
                  job is excluded from arms-length revenue reporting.
                </>
              ) : (
                <>
                  <strong>MOCK PAYMENT MODE:</strong> Stripe is not configured. No
                  charge will occur, and this purchase is excluded from revenue
                  reporting.
                </>
              )}
            </div>
            <form action={createMockPaidJob} className="mt-4">
              <input type="hidden" name="product" value={product.type} />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                {complimentary ? "Continue free (judge access)" : "Continue without payment (mock)"}
              </button>
            </form>
          </>
        ) : (
          <form action={startStripeCheckout} className="mt-6">
            <input type="hidden" name="product" value={product.type} />
            {isFounding && <input type="hidden" name="promo" value={FOUNDING_PROMO_CODE} />}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Pay {formatPrice(priceCents)} with Stripe
            </button>
          </form>
        )}
        <p className="mt-3 text-center text-xs text-slate-500">
          You approve all pricing, certifications, and final submissions.
          BidPilot does not guarantee contract awards.
        </p>
      </div>
    </div>
  );
}
