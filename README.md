# BidPilot

An AI-operated proposal department for small businesses pursuing government,
institutional, and commercial contracts. Built for the Build with Gemini
XPRIZE (Small Business Services category).

> Upload an RFP and receive a bid/no-bid recommendation, compliance matrix,
> missing-document list, proposal strategy, and source-grounded first draft
> within 48 hours.

## How it works

A deterministic state machine advances each paid job through bounded Gemini
agent calls (structured JSON outputs validated with Zod, retried with error
feedback):

```text
PAID → INTAKE_REQUIRED → DOCUMENTS_UPLOADED → PARSING → ELIGIBILITY_REVIEW
  → [CUSTOMER_CLARIFICATION] → BID_DECISION_READY (customer gate)
  → COMPLIANCE_MAPPING → DRAFTING → QUALITY_REVIEW
  → [HUMAN_EXCEPTION_REVIEW] → READY_FOR_DELIVERY → DELIVERED → COMPLETED
```

Agents: solicitation parser, eligibility, bid/no-bid, compliance matrix,
strategy, drafting, claim verification (independent), compliance review
(independent). Every run is stored in the immutable `agent_runs` audit table
with model, prompt version, tokens, cost, duration, and confidence.

Grounding rules: drafts cite only customer-approved evidence (`[EV:id]`),
missing facts become `[CUSTOMER CONFIRMATION REQUIRED]` placeholders, and an
independent verifier flags unsupported claims before delivery. Humans approve
pricing, certifications, and final submission.

## Stack

- Next.js 15 (App Router, TypeScript, Tailwind CSS 4) — `web/`
- Supabase — PostgreSQL with row-level security, Auth, private Storage
- Gemini API (`gemini-2.5-flash`) via `@google/genai`
- Stripe Checkout + webhooks for payments
- Resend for email (optional)

## Local setup

```bash
cd web
npm install
cp .env.example .env.local   # documented env vars, no secrets committed
npm run dev                  # http://localhost:3000
```

Migrations live in `web/supabase/migrations/` and apply in filename order
(Supabase CLI: `supabase db push`, or the Supabase MCP/SQL editor).

### Mock modes (clearly labeled, never counted as production evidence)

- **MOCK AI MODE** — active when `GEMINI_API_KEY` is unset. Agents return
  deterministic synthetic fixtures; runs are stored with `is_mocked=true` and
  status `MOCKED`, and the UI shows a persistent banner and per-run MOCKED
  badges.
- **MOCK PAYMENT MODE** — active when `STRIPE_SECRET_KEY` is unset. Checkout
  creates jobs without charging; no revenue transaction is recorded, so mock
  purchases can never appear in arms-length revenue.

## XPRIZE compliance

- `docs/preexisting-materials.md` — reused boilerplate/open-source disclosure
- `docs/third-party-inventory.md` — service licensing and data-rights inventory
- `docs/build-timeline.md` — features linked to dated commits
- `docs/testing-instructions.md` — judge access and walkthrough
- `/xprize` — public transparency page (aggregate metrics computed from
  database events)
- `/admin/xprize-readiness` — admin dashboard: submission countdown, Stage One
  checklist, revenue by month (arms-length vs related-party), expenses,
  entrant record, and one-click evidence CSV exports

BidPilot does not guarantee contract awards, provide legal advice, or submit
bids on customers' behalf.
