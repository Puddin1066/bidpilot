# Credentials posture

**Update (Jul 24, 2026):** Stripe **restricted live key** `bidpilot_stripe` and
webhook signing secret are configured locally and on Vercel. Live Checkout is on.

| Secret | Current | Effect |
|---|---|---|
| `STRIPE_SECRET_KEY` | `rk_live_…` (bidpilot_stripe) | Live Checkout enabled |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Webhook `we_1TwlSoQg9yJEawqIfMSdu6cq` → `/api/stripe/webhook` |
| Webhook URL | `https://bidpilot-three.vercel.app/api/stripe/webhook` | `checkout.session.completed`, `charge.refunded` |
| `GEMINI_API_KEY` | set in production | Live Gemini agents |
| `SUPABASE_*` | set | Database / auth / storage live |
| Cloud Run | config ready, not cut over | Interim host: Vercel |

## Rules

1. Never count `MOCK-*` payments as arms-length revenue.
2. Keep a judge path free (preview without Stripe, or a separate mock env)
   through Sep 15, 2026.
3. Re-run `/admin/xprize-readiness` concentration checks before submission.
4. Do not commit secrets; rotate the restricted key if it was ever exposed in chat.