# Devpost — Enter a Submission NOW (paste-ready)

**Hackathon:** https://xprize.devpost.com/  
**Start project:** after joining, use “Start project” / Enter a Submission  
**You can edit until Aug 17, 2026** — start today so fields are locked in early.

## Links to paste

| Field | Value |
|---|---|
| Project name | BidPilot |
| Tagline | AI-operated proposal department for small businesses chasing government & institutional RFPs |
| Category | Small Business Services |
| Website / demo URL | https://bidpilot-three.vercel.app |
| GitHub repo | https://github.com/Puddin1066/bidpilot (**now public**) |
| Sample report | https://bidpilot-three.vercel.app/sample |
| XPRIZE transparency | https://bidpilot-three.vercel.app/xprize |
| Testing instructions | `docs/testing-instructions.md` in repo |
| Judge login | `judge@bidpilot.demo` / password in `submission_specs_bidpilot/.private-judge-credentials.txt` |
| Video URL | *(record after first paying customer — script in `03_video_script.md`)* |
| Narrative | paste from `02_written_narrative.md` (update traction placeholders after first sales) |

## Built with

- Google Gemini API (`gemini-2.5-flash`)
- Next.js 15 / TypeScript
- Supabase (Auth, Postgres, Storage)
- Stripe Checkout
- Vercel (interim host; Cloud Run Dockerfile ready)

## Short description (for form “built with / what it does”)

BidPilot is a paid AI-operated proposal department. A customer uploads a live
solicitation; a deterministic pipeline of eight Gemini agents returns
eligibility, bid/no-bid, compliance matrix, strategy, and an evidence-grounded
first draft. Humans approve pricing, certifications, and final submission.
Every agent call is logged to an immutable audit table.

## Google Cloud / Gemini answers

See `04_form_answers.md`. Current production: Gemini API + Vercel hosting;
Cloud Run deploy path ready in `docs/deploy-cloud-run.md`.

## Financials (update as revenue lands)

- May / June 2026: $0 (pre-launch)
- July 2026: update after first arms-length Stripe payments
- Related-party / self-test purchases: disclose separately; do not count
- Expenses: Gemini API, Supabase, Vercel, Stripe fees, domain — export from
  `/admin/xprize-readiness` and fill Devpost P&L template

## Checklist before clicking Submit (can Start Project now)

- [x] Public repo with setup docs
- [x] Live production URL
- [x] Judge account + synthetic RFP
- [x] Narrative draft
- [x] Form answer drafts
- [ ] 3-minute video (blocked on polished production demo + preferably real revenue shot)
- [ ] Revenue evidence export (after first arms-length sale)
- [ ] Customer contacts / testimonials
- [ ] Start Devpost project today and save draft

## Action for you (5 minutes)

1. Open https://xprize.devpost.com/ and **Join hackathon** if not already.
2. **Start project** → paste the fields above → Save as draft.
3. Call Jeff Brant (401-278-9125) and RISBDC (401-874-7232) using `04-call-scripts.md`.
