# Evidence Pack — Assembly Instructions

Judges verify three things: Business Viability, AI-Native Operations, Category
Impact. Each evidence item below maps to one of those. **Rule zero: nothing
mocked ever enters evidence.** Mocked runs are `is_mocked=true`; mock checkouts
record no revenue — keep it that way.

## A. Revenue evidence (Business Viability)

1. **Stripe dashboard export** — once live keys are in, export the payments CSV
   for May 19–Aug 17, 2026 from the Stripe dashboard. Attach as-is; judges
   like unmodified processor records.
2. **Monthly breakdown** — `/admin/xprize-readiness` already computes revenue by
   month split arms-length vs related-party. Export CSV for May, June, July, August.
3. **P&L on Devpost's template** (linked in the email — download it now).
   Line items to include:
   - Revenue: by product type, arms-length only, related-party shown separately
   - COGS: Gemini API costs (sum `agent_runs.estimated_cost_cents` for real runs),
     Supabase plan, hosting, Stripe fees
   - Opex: marketing/customer-acquisition spend (**required even if $0**),
     domain, email (Resend), any contractor cost
4. **Classification discipline** — every transaction must be tagged
   ARMS_LENGTH vs related-party at capture. Any customer who is a friend,
   family member, or pre-existing relationship goes in the related-party bucket.
5. **Concentration check** — before submitting, verify no customer > 40% of
   arms-length revenue on the readiness dashboard.
6. **Corporate ID** — if entering as an organization, have the EIN/registration
   ready; decide entity status this week, not deadline week.

## B. Product evidence (AI-Native Operations)

1. **Agent execution logs** — export `agent_runs` CSV filtered to
   `is_mocked=false` and linked to paid jobs. Columns already captured: agent,
   model, prompt version, tokens in/out, cost, duration, confidence, status,
   `gemini_response_id`, timestamp.
2. **Continuity, not a demo spike** — evidence should span weeks. Deploy ASAP so
   the log timeline shows sustained daily operation through August. A burst of
   runs on Aug 16 reads as staged.
3. **Dashboard screenshots** — capture dated full-page screenshots of `/xprize`
   and `/admin/xprize-readiness` weekly starting now; store in
   `submission_specs_bidpilot/screenshots/` (create when first capture lands).
4. **API usage records** — Google AI Studio / Cloud console usage page
   screenshot showing Gemini API traffic over the period, matching our logs.
5. **Per-job audit JSON** — include 1–2 full audit exports from real delivered
   jobs (redact anything customer-confidential, or use jobs where the customer
   granted permission).

## C. Customer evidence (Viability + Category Impact)

1. **Contact info** — name, email, phone for real customers, stored in the
   restricted verification table with permission flags (migration 0002 schema).
   Supplied privately in the submission, never publicly.
2. **Permission first** — before quoting anyone, record explicit permission to
   share the testimonial and/or identifying info. Ask at delivery time — the
   moment of a delivered draft is the best ask.
3. **Testimonial collection script** (send with each delivery):
   > "Would you be willing to share 2–3 sentences on what BidPilot did for you
   > and what it would have cost you to do this another way? We're competing in
   > an AI business competition and real customer words carry the most weight.
   > We'd only share it with your permission."
4. **Impact metrics per customer** — solicitations processed, contract value
   pursued, estimated hours saved (conservative), whether they bid when they
   otherwise wouldn't have. These feed the Category Impact answer.

## D. Verification readiness (2-business-day rule)

Do one **dry run in early August**: simulate a verification request and produce,
within a day, the full package from `/admin/xprize-readiness`:
payment records, expense records, user permissions, job delivery evidence, and
API usage evidence. Fix any export gaps found.
