# Credentials posture (MOCK until product complete)

**Decision (Jul 24, 2026):** proceed with labeled mock keys. Real Stripe (and
any remaining Google Cloud) credentials will be supplied once the product is
completed.

| Secret | Current | Effect |
|---|---|---|
| `STRIPE_SECRET_KEY` | empty | **MOCK PAYMENT MODE** — checkout creates jobs with `MOCK-*` ids; no charge; no revenue row |
| `STRIPE_WEBHOOK_SECRET` | empty | Webhook unused until live Stripe |
| `GEMINI_API_KEY` | set in production | Live Gemini agents (not mocked) |
| `SUPABASE_*` | set | Database / auth / storage live |
| Cloud Run | config ready, not cut over | Interim host: Vercel |

## Rules that must not change when keys arrive

1. Never count `MOCK-*` payments as arms-length revenue.
2. Flip Stripe only by setting env vars — no code path change required.
3. After adding Stripe keys, keep a judge path free (or use a separate preview
   env without Stripe) through Sep 15, 2026.
4. Re-run `/admin/xprize-readiness` concentration checks before submission.
