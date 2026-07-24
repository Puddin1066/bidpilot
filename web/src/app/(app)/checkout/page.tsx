import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getProduct, formatPrice } from "@/lib/products";
import { env, isMockPaymentMode } from "@/lib/env";

export const metadata: Metadata = { title: "Checkout" };

async function startStripeCheckout(formData: FormData) {
  "use server";
  const session = await requireOrganization();
  const product = getProduct(String(formData.get("product")));
  if (!product) redirect("/pricing");

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: product.recurring ? "subscription" : "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `BidPilot — ${product.name}` },
          unit_amount: product.priceCents,
          ...(product.recurring ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      },
    ],
    metadata: {
      organization_id: session.organizationId,
      product_type: product.type,
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

  // MOCK PAYMENT MODE: no charge occurs and no revenue transaction is
  // recorded, so mock checkouts can never appear in arms-length revenue.
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      organization_id: session.organizationId,
      product_type: product.type,
      status: "INTAKE_REQUIRED",
      price_paid_cents: product.priceCents,
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
  searchParams: Promise<{ product?: string }>;
}) {
  await requireOrganization();
  const params = await searchParams;
  const product = getProduct(params.product ?? "");
  if (!product) redirect("/pricing");
  if (!product.automated) redirect("/jobs/new");

  const mock = isMockPaymentMode();

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold text-slate-900 text-center">Checkout</h1>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-slate-900">{product.name}</h2>
          <div className="text-2xl font-bold text-slate-900">
            {formatPrice(product.priceCents)}
            {product.recurring && <span className="text-sm font-normal text-slate-500">/mo</span>}
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">{product.tagline}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          {product.deliverables.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              {d}
            </li>
          ))}
        </ul>

        {mock ? (
          <>
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              <strong>MOCK PAYMENT MODE:</strong> Stripe is not configured. No
              charge will occur, and this purchase is excluded from revenue
              reporting.
            </div>
            <form action={createMockPaidJob} className="mt-4">
              <input type="hidden" name="product" value={product.type} />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Continue without payment (mock)
              </button>
            </form>
          </>
        ) : (
          <form action={startStripeCheckout} className="mt-6">
            <input type="hidden" name="product" value={product.type} />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Pay {formatPrice(product.priceCents)} with Stripe
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
