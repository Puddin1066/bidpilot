# Testing Instructions (for XPRIZE judges)

BidPilot is free for judges through the judging period (September 15, 2026).
Judge and demo organizations use **complimentary checkout** even when Stripe is
live — no charge occurs, and those jobs are never written to
`revenue_transactions`.

## 1. Access

- Application URL: https://bidpilot-three.vercel.app
  (Cloud Run production URL TBD after `gcloud auth login` — see `docs/deploy-cloud-run.md`)
- Judge credentials: `judge@bidpilot.demo` / (password in
  `submission_specs_bidpilot/.private-judge-credentials.txt` — gitignored;
  paste into private Devpost submission notes only)
- Repository: https://github.com/Puddin1066/bidpilot
  - Private; invite Devpost/Hacker Fund GitHub accounts before submission
    (email addresses alone cannot be collaborators — use their GitHub usernames, or
    temporarily make the repo public for judging).
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
5. **Intake** — paste the contents of
   `docs/demo/synthetic-rfp-ocean-state-training.md` **or upload that `.md`
   file** (PDF also accepted). Analysis starts immediately.
6. **Job workspace** — watch the job advance: parsing → eligibility →
   (optional clarification if evidence is incomplete) → bid/no-bid decision
   (with nine factor scores) → your approval gate → compliance matrix →
   strategy → drafting → claim verification → compliance review → delivery.
   The page auto-refreshes while processing; if analysis fails, use
   **Retry analysis**.
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
npm run seed:judge           # requires SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Environment variables are documented in `web/.env.example` (no secrets
committed). Database migrations are in `web/supabase/migrations/` and apply in
filename order. The app degrades gracefully: without `GEMINI_API_KEY` it runs
in labeled MOCK AI MODE; without Stripe keys it runs in labeled MOCK PAYMENT
MODE.

Cloud Run deploy: see `docs/deploy-cloud-run.md` and
`./scripts/deploy-cloud-run.sh`.

## 4. Verification

We can produce payment records, expense records, user permissions, job
delivery evidence, and API usage evidence within two business days of any
verification request (see `/admin/xprize-readiness` exports).
