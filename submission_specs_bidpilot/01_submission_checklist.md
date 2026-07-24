# Master Submission Checklist

Status legend: `[x]` done · `[~]` partially done / infrastructure exists · `[ ]` not started.
Statuses reflect the repo as of **Jul 17, 2026**. Update as work lands.

## 1. Core eligibility (Stage One pass/fail)

- [~] **Business operated by AI agents.** The pipeline (8 Gemini agents, deterministic
  state machine in `web/src/lib/pipeline.ts`) makes eligibility, bid/no-bid, and
  quality-routing decisions autonomously. Needs: real production runs (Gemini key is
  set, but jobs must flow end-to-end in a deployed environment).
- [~] **At least one Google Cloud product.** Gemini API + Cloud Run config ready
  (`web/Dockerfile`, `scripts/deploy-cloud-run.sh`, `docs/deploy-cloud-run.md`).
  **ACTION:** run `gcloud auth login`, then `./scripts/deploy-cloud-run.sh <PROJECT_ID>`.
- [x] **Gemini API for at least one LLM call.** `gemini-2.5-flash` via `@google/genai`
  in `web/src/lib/ai/gemini.ts`; every call logged to `agent_runs`.
- [x] **Category selected.** Small Business Services (per README and spec).
- [~] **Project new after May 19, 2026.** Commits exist only Jul 16–17; `docs/build-timeline.md`
  links features to dated commits. Keep committing incrementally — a 2-commit history
  looks worse than a real one.

## 2. Deployment and access (blocking nearly everything else)

- [~] **Deploy to production.** Live now on Vercel:
  https://bidpilot-three.vercel.app (interim). Cloud Run Dockerfile + deploy
  script ready for the Google Cloud product requirement — blocked only on
  `gcloud auth login`, then `./scripts/deploy-cloud-run.sh <PROJECT_ID>`.
- [ ] **Live Stripe keys** in production — **intentionally deferred**. Product
  ships in labeled MOCK PAYMENT MODE until credentials are provided after
  product completion. Mock purchases never enter arms-length revenue.
- [x] **Seed judge account.** Done Jul 24: `judge@bidpilot.demo`, demo org,
  approved profile, 5 evidence items, `judge_accounts` row. Credentials in
  `submission_specs_bidpilot/.private-judge-credentials.txt` (gitignored).
  Synthetic RFP: `docs/demo/synthetic-rfp-ocean-state-training.md`.
- [ ] **App stays up through Sep 15, 2026** (judging period) with buffer.

## 3. Devpost form artifacts

- [~] **GitHub repo link.** https://github.com/Puddin1066/bidpilot (private,
  pushed Jul 24). **ACTION:** invite Devpost/Hacker Fund **GitHub usernames**
  (email addresses alone cannot be collaborators), or make the repo public for
  judging. Confirm usernames in Discord/FAQ.
- [ ] **3-minute video** — script in `03_video_script.md`. Record in production (not
  mock mode) using the synthetic RFP. Host public on YouTube/Vimeo. **Upload early**
  (processing can take hours).
- [~] **Written narrative (500–1000 words)** — draft in `02_written_narrative.md`.
  Blocked on real revenue/user numbers.
- [ ] **Start the Devpost form now** to see all questions verbatim; drafts in
  `04_form_answers.md`.

## 4. Financial evidence

- [ ] **Real arms-length revenue.** Currently $0 (Stripe in mock mode). This is the
  single highest-leverage item — Business Viability is the first judging criterion.
  Execute `marketing_outreach/` playbook immediately after deploy.
- [~] **Monthly breakdown May–Aug 2026.** `revenue_transactions` table +
  `/admin/xprize-readiness` dashboard already compute this. May/Jun will be $0 —
  that's fine; report honestly.
- [ ] **Stripe dashboard export or bank statement** at submission time.
- [ ] **P&L using Devpost's template** (link in the email). Include ALL expenses even
  if $0: Gemini API costs (tracked per-run in `agent_runs.estimated_cost_cents`),
  Supabase, hosting, Stripe fees, marketing/customer-acquisition spend, domain.
- [ ] **Corporate ID** if entered as an organization — decide entity status now.
- [~] **Related-party revenue separated** — schema supports it; classify every
  transaction correctly as it happens.
- [ ] **No single customer > 40% of revenue** — monitor on the readiness dashboard;
  this constrains pricing mix (one $999 package needs ~$1,500 more from others).

## 5. Product evidence (AI live in production)

- [~] **Agent execution logs** — `agent_runs` audit table (model, prompt version,
  tokens, cost, confidence, `gemini_response_id`) + CSV exports. **ACTION:** ensure
  submitted evidence contains only `is_mocked=false` runs from real paid jobs.
- [ ] **Continuous operation evidence** — logs must span weeks, not one demo day.
  Deploy early so July/August show sustained activity.
- [~] **Dashboard screenshots** — `/xprize` public page and `/admin/xprize-readiness`.
  Capture dated screenshots weekly from now until submission.

## 6. Customer evidence

- [ ] **Real customer contacts** (name, email, phone) with stored sharing permission
  (schema per spec §0.9 exists in migration 0002).
- [ ] **Testimonials/feedback** with explicit permission to share.
- [ ] **Users acquired + paying users counts** for the form.

## 7. Final pre-submission pass (target: Aug 14, buffer before Aug 17)

- [ ] Video is public, under 3:00, link pasted and working in an incognito window.
- [ ] Narrative pasted; word count 500–1000.
- [ ] All form questions answered (see `04_form_answers.md`).
- [ ] Repo access verified from a non-collaborator account or shared with judge emails.
- [ ] Judge credentials tested end-to-end from a clean browser.
- [ ] Revenue/expense/user exports generated and attached.
- [ ] `docs/testing-instructions.md` placeholders replaced.
- [ ] Two-business-day verification package dry run (`/admin/xprize-readiness` exports).
