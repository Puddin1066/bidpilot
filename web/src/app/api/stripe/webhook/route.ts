import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/products";

export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const organizationId = session.metadata?.organization_id;
    const productType = session.metadata?.product_type;
    const product = productType ? getProduct(productType) : undefined;
    if (!organizationId || !product) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Idempotency: skip if this payment was already processed.
    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.subscription as string | null) ?? session.id;
    const { data: existing } = await admin
      .from("jobs")
      .select("id")
      .eq("stripe_payment_id", paymentId)
      .maybeSingle();
    if (existing) return NextResponse.json({ received: true, duplicate: true });

    const { data: job, error: jobError } = await admin
      .from("jobs")
      .insert({
        organization_id: organizationId,
        product_type: product.type,
        status: "INTAKE_REQUIRED",
        price_paid_cents: session.amount_total ?? product.priceCents,
        stripe_payment_id: paymentId,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    const now = new Date();
    const { error: revenueError } = await admin.from("revenue_transactions").insert({
      organization_id: organizationId,
      job_id: job.id,
      stripe_payment_id: paymentId,
      amount_cents: session.amount_total ?? product.priceCents,
      currency: (session.currency ?? "usd").toUpperCase(),
      // Recorded as ARMS_LENGTH by default; an admin reclassifies
      // related-party or pre-existing-customer purchases per XPRIZE rules.
      revenue_type: "ARMS_LENGTH",
      recognized_month: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`,
    });
    if (revenueError) {
      return NextResponse.json({ error: revenueError.message }, { status: 500 });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const paymentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
    if (paymentId) {
      const admin = createAdminClient();
      await admin
        .from("revenue_transactions")
        .update({ refunded_amount_cents: charge.amount_refunded })
        .eq("stripe_payment_id", paymentId);
    }
  }

  return NextResponse.json({ received: true });
}
