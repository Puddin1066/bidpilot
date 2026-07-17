# Execution Timeline — Jul 17 to Aug 17, 2026

Principle: **revenue compounds with time, submission artifacts don't.** Deploy
and sell first; polish materials in parallel and finalize last. Target internal
completion **Aug 14** — never submit on deadline day.

## Week 1 — Jul 17–23: Deploy and open for business (everything else is blocked on this)

- [ ] Decide hosting: **Cloud Run** (recommended — also closes the Google Cloud
  product question) vs Vercel. Deploy production with full env vars, including
  `SUPABASE_SERVICE_ROLE_KEY` (currently unset — checkout→job is broken without it).
- [ ] Activate live Stripe keys in production; test one real $49 purchase end to
  end (self-purchase → refund; never count it as revenue).
- [ ] Ask in Devpost Discord: "Does the Gemini API alone satisfy the Google
  Cloud product requirement?" Record the answer.
- [ ] Start the Devpost submission form; copy every question verbatim into
  `04_form_answers.md`.
- [ ] Begin outreach from `marketing_outreach/` (RI opportunities are already
  sourced). Volume goal: first 20 contacts this week.
- [ ] Decide entity status (corporate ID question).
- [ ] Start weekly dated screenshots of `/xprize` and the readiness dashboard.

## Week 2 — Jul 24–30: First revenue and judge experience

- [ ] Land first arms-length paying customers (any tier; a $49 sale proves the loop).
- [ ] Seed the judge account: synthetic org, fictional profile, synthetic RFP,
  approved evidence; wire the judge path to mock-payment so judges aren't charged.
- [ ] Fill in `docs/testing-instructions.md` placeholders (URL, credentials).
- [ ] Verify GitHub remote is set and pushed; if private, share with
  testing@devpost.com and judging@hacker.fund now (not deadline week).
- [ ] Download Devpost's P&L template; start logging expenses weekly.
- [ ] Continue outreach; ask every delivered customer for a testimonial (script
  in `05_evidence_pack.md`).

## Week 3 — Jul 31–Aug 6: Video and narrative on real data

- [ ] Pre-record dry run of the demo, then record the 3-minute video against
  production per `03_video_script.md`. Upload to YouTube **unlisted** first to
  verify quality/processing; flip to public.
- [ ] Fill narrative placeholders with real July numbers; get word count into range.
- [ ] Verification dry run: produce the full evidence package within one day;
  fix export gaps.
- [ ] Keep selling — August revenue reported month-by-month, so August sales count.

## Week 4 — Aug 7–13: Assemble and freeze

- [ ] Final Stripe export, P&L, monthly breakdown, agent-run CSVs (real runs only).
- [ ] Final customer evidence: contacts + permissions + testimonials.
- [ ] Re-record only the video segments whose numbers changed (results shots),
  or update with final numbers if materially better.
- [ ] Complete every Devpost form field from `04_form_answers.md`.
- [ ] Concentration check: no customer > 40%.

## Aug 14 — Submit

- [ ] Run the full "final pre-submission pass" in `01_submission_checklist.md` §7.
- [ ] Submit. Devpost allows edits until Aug 17 — use the buffer only for
  updated revenue numbers, not first drafts.

## Aug 15–Sep 15 — Keep it running

- [ ] App stays deployed and free for judges through Sep 15 + buffer.
- [ ] Keep operating — verification requests can come any time; answer within
  two business days.
