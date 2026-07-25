# Integration & workflow validation report

**Date:** 2026-07-25  
**Environment:** local `.env.local` + production https://bidpilot-three.vercel.app  
**Runner:** `web/scripts/validate-integrations.ts`  
**Result:** **PASS 29 · FAIL 0 · SKIP 1**

## Integrations

| Integration | Result | Notes |
|---|---|---|
| Production HTTP (`/`, `/pricing`, `/sample`, `/xprize`, `/login`, `/trust`) | PASS | All 200 |
| Gemini API (`gemini-2.5-flash`) | PASS | Live JSON response |
| Stripe restricted key Checkout | PASS | Created + expired live probe session (no charge) |
| Stripe webhook endpoint | PASS | `we_1TwlSo…` enabled for `checkout.session.completed`, `charge.refunded` |
| Stripe webhook route (prod) | PASS | Rejects unsigned body with 400 |
| Stripe webhook secret | PASS | Configured |
| Supabase Auth | PASS | Judge login |
| Supabase org / RLS | PASS | Demo org `is_demo=true`, role `judge` |
| Supabase evidence + profile | PASS | 5 approved evidence items; APPROVED profile |
| Supabase service-role | PASS | `agent_runs` readable |
| Supabase Storage | PASS | `documents`, `deliverables` buckets |
| Resend | SKIP | Optional; `RESEND_API_KEY` empty |

## BidPilot workflow (judge complimentary path)

| Step | Result | Evidence |
|---|---|---|
| Create paid job (MOCK / complimentary) | PASS | job `79e9f37f-…` |
| Upload synthetic RFP + parse | PASS | Deadline normalization applied |
| Auto pipeline → bid gate | PASS | `DOCUMENTS_UPLOADED` → `BID_DECISION_READY` |
| Approve bid → compliance/draft/verify/deliver | PASS | Continued to `DELIVERED` |
| Requirements matrix | PASS | **18** rows |
| Agent runs (Gemini) | PASS | **8** production runs |
| Bid decision | PASS | `PURSUE_WITH_CONDITIONS` score **77** |
| Draft sections | PASS | **8** sections |
| Terminal status | PASS | **DELIVERED** |

## Bug found & fixed during validation

Gemini returned deadline as `"August 8, 2026, 5:00 PM ET"`, which Postgres rejected as `timestamptz`, aborting the job at `PIPELINE_FAILED`.

**Fix:** `normalizeTimestamptz()` in `web/src/lib/pipeline.ts` converts human-readable dates to ISO (or null) before write.

## Not covered by this run

- Live card payment → webhook → job create (would create real charge; do as self-purchase→refund smoke test)
- Resend transactional email
- Cloud Run deploy
- Production UI click-through (API/DB path validated; browser walkthrough still recommended)

## Re-run

```bash
cd web
JUDGE_PASSWORD='…' npx --yes tsx scripts/validate-integrations.ts
```
