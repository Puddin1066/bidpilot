# Testing Instructions (for XPRIZE judges)

BidPilot is free for judges through the judging period (September 15, 2026).
No paywall blocks testing: with Stripe unconfigured in the judge environment,
checkout runs in a clearly labeled MOCK PAYMENT MODE that creates jobs without
charging, and mock purchases are excluded from revenue reporting.

## 1. Access

- Application URL: (deployed URL — see private submission notes)
- Judge credentials: (provided in the private submission notes)
- The judge account is scoped to a synthetic demonstration organization with a
  fictional company profile and a synthetic RFP. No customer-confidential data
  is accessible.

## 2. Suggested walkthrough (~10 minutes)

1. **Marketing** — visit `/`, `/pricing`, `/sample`, `/trust`, and `/xprize`.
   The XPRIZE page shows aggregate metrics computed live from the database.
2. **Log in** with the judge credentials.
3. **Company profile** (`/profile`) — review the seeded fictional profile and
   the evidence library. Note that only approved evidence can be cited in
   drafts.
4. **New job** (`/jobs/new`) — select the 48-Hour RFP Readiness Package and
   complete checkout (mock mode, no charge).
5. **Intake** — paste any RFP text or upload a PDF. Analysis starts
   immediately.
6. **Job workspace** — watch the job advance: parsing → eligibility →
   bid/no-bid decision (with nine factor scores) → your approval gate →
   compliance matrix → strategy → drafting → claim verification → compliance
   review → delivery.
7. **Audit log** — at the bottom of the job page, every Gemini call is logged
   with model, prompt version, tokens, cost, duration, and confidence. Runs
   without a production Gemini key are explicitly labeled MOCKED.
8. **Deliverables** — download the compliance matrix CSV, draft Markdown, and
   audit JSON.

## 3. Local setup (repository reviewers)

```bash
cd web
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key at minimum
npm run dev
```

Environment variables are documented in `web/.env.example` (no secrets
committed). Database migrations are in `web/supabase/migrations/` and apply in
filename order. The app degrades gracefully: without `GEMINI_API_KEY` it runs
in labeled MOCK AI MODE; without Stripe keys it runs in labeled MOCK PAYMENT
MODE.

## 4. Verification

We can produce payment records, expense records, user permissions, job
delivery evidence, and API usage evidence within two business days of any
verification request (see `/admin/xprize-readiness` exports).
