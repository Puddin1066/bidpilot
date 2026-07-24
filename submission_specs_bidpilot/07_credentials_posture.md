# Credentials posture (MOCK until product complete)

**Update (Jul 24, 2026):** Stripe **restricted live key** `bidpilot_stripe` is
configured locally and on Vercel as `STRIPE_SECRET_KEY`. Checkout Sessions work.
**Webhook signing secret is still pending** (restricted key lacks
`webhook_write` — create the endpoint in the Dashboard or edit the key).

| Secret | Current | Effect |
|---|---|---|
| `STRIPE_SECRET_KEY` | `rk_live_…` (bidpilot_stripe) | Live Checkout enabled |
| `STRIPE_WEBHOOK_SECRET` | empty | Jobs will **not** be created after payment until set |
| `GEMINI_API_KEY` | set in production | Live Gemini agents |
| `SUPABASE_*` | set | Database / auth / storage live |
| Cloud Run | config ready, not cut over | Interim host: Vercel |

## Finish Stripe (required before real sales)

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://bidpilot-three.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `charge.refunded`
4. Reveal **Signing secret** (`whsec_…`) and paste it (or add
   `STRIPE_WEBHOOK_SECRET` to `web/.env.local` + Vercel)
5. Redeploy

Optional: edit the `bidpilot_stripe` restricted key and enable
**Webhook Endpoints Write** so the agent can create endpoints via API.

## Rules that must not change when keys arrive

1. Never count `MOCK-*` payments as arms-length revenue.
2. After Stripe is live, keep a judge path free (preview env without Stripe, or
   mock path) through Sep 15, 2026.
3. Re-run `/admin/xprize-readiness` concentration checks before submission.
