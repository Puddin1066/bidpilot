# Judge account seeding

Provisions a free demo workspace for XPRIZE judges: fictional company,
approved evidence library, and a `judge_accounts` row. Judges use **MOCK
PAYMENT MODE** (or a dedicated mock path) so their activity never enters
arms-length revenue.

## Prerequisites

1. Supabase project `bidpilot` is healthy.
2. All migrations in `web/supabase/migrations/` are applied.
3. `web/.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → `service_role`)

## Run

```bash
cd web
npm run seed:judge
```

Optional overrides:

```bash
JUDGE_EMAIL=judge@bidpilot.demo JUDGE_PASSWORD='your-long-password' npm run seed:judge
```

The script prints the password when it creates the user or when
`JUDGE_PASSWORD` is set. **Put that password only in private Devpost
submission notes** — never commit it.

## What judges get

| Item | Value |
|---|---|
| Email | `judge@bidpilot.demo` (default) |
| Organization | Harbor Path Training LLC (fictional), `is_demo=true` |
| Profile | Approved company profile matching the synthetic RFP |
| Evidence | 5 approved evidence items (insurance, past performance, etc.) |
| Expiry | 2026-09-30 |
| Demo RFP | `docs/demo/synthetic-rfp-ocean-state-training.md` |

## Walkthrough for the private submission notes

1. Application URL: _(paste Cloud Run / production URL)_
2. Login: `judge@bidpilot.demo` / _(password from seed output)_
3. Open `/profile` — review approved fictional profile + evidence.
4. Start a Readiness Package from `/pricing` → checkout (mock payment if
   Stripe is unset; no charge).
5. On the job intake page, paste or upload the synthetic RFP.
6. Watch the pipeline and the agent audit log at the bottom of the job page.

See also `docs/testing-instructions.md`.
