# 3-Minute Demo Video — Script and Shot List

Hard limit: **2:59**. Judges will not watch past 3:00. Target 2:50 to leave margin.
Host public on YouTube or Vimeo; upload at least 48h before the deadline
(processing can take hours). No music unless licensed; no third-party
trademarks (use the synthetic RFP, not a real agency's); no customer-confidential data.

## Production requirements

- Record against the **deployed production app** with the real Gemini key —
  no MOCK banners may be visible anywhere in the video.
- Use the seeded synthetic RFP + fictional company profile (spec Prompt 14),
  so nothing confidential appears.
- Pre-run a duplicate job to completion beforehand so the long agent stages can
  be shown as a time-cut ("moments later") without dead air.
- 1080p minimum, browser at 100% zoom, close other tabs, hide bookmarks bar.
- Voiceover: calm, specific, numbers-forward. Write nothing you can't evidence.

## Script

### 0:00–0:20 — Problem and the paid offer (shot: landing page, then pricing page)

> "Small businesses leave billions in contracts on the table because responding
> to an RFP takes a proposal department they don't have. BidPilot is that
> department — operated by AI. Customers pay $149 to $999 per package, and
> within 48 hours get a bid decision, compliance matrix, and a source-grounded
> first draft."

### 0:20–0:45 — Purchase and upload (shot: checkout → job intake, upload synthetic RFP PDF)

> "Here's a real job. The customer buys the 48-Hour Readiness Package through
> Stripe — payment is what starts the pipeline. They upload the solicitation,
> pick their company profile, and from this point the business runs itself."

### 0:45–1:15 — Gemini extraction and eligibility decision (shot: job workspace advancing; open the eligibility result)

> "A deterministic state machine now drives eight Gemini agents. The parser
> extracts every requirement from the PDF as validated, structured JSON. The
> eligibility agent then makes a real decision: does this customer meet each
> mandatory requirement? When it can't ground an answer, it doesn't guess —
> it routes back to the customer for clarification."

### 1:15–1:45 — Bid/no-bid and compliance matrix (shot: nine-factor bid score, then the matrix)

> "Next, the bid/no-bid agent scores the opportunity across nine factors and
> issues a recommendation with plain-language rationale — the customer approves
> the go decision, and AI takes over again: a full compliance matrix mapping
> every requirement to where it will be answered."

### 1:45–2:15 — Grounded drafting and independent verification (shot: draft with [EV:id] citations, then verifier flags)

> "The drafting agent writes only from evidence the customer approved — every
> claim carries a citation tag, and anything unknown becomes an explicit
> 'confirmation required' placeholder. Then a separate verification agent
> audits the draft and flags any unsupported claim. If quality fails, the AI
> itself escalates to a human exception queue. Humans approve only what they
> legally must: pricing, certifications, final submission."

### 2:15–2:35 — Production logs (shot: job audit log, then /admin agent_runs export)

> "None of this is staged. Every Gemini call is written to an immutable audit
> table — model, prompt version, tokens, cost, confidence, decision. This is
> [N] production runs across [M] paid jobs since launch."

### 2:35–2:50 — Business results (shot: /xprize transparency page, revenue dashboard)

> "The results: [$X,XXX] in arms-length revenue from [N] paying customers,
> [$XX] average AI cost per job against [$XXX] average package price, computed
> live from the database — the same exports judges receive."

### 2:50–3:00 — Why it lasts (shot: pricing page or logo close)

> "Transactional revenue today, monitoring subscriptions compounding monthly,
> and margins that hold because the workforce is metered API calls. BidPilot —
> a proposal department every small business can afford."

## Checklist before publishing

- [ ] Duration under 3:00
- [ ] No MOCK AI / MOCK PAYMENT banners visible in any frame
- [ ] No real customer names, real agency trademarks, or confidential content
- [ ] Numbers in the script match the evidence exports exactly
- [ ] Public visibility confirmed in an incognito window
- [ ] Link pasted into Devpost form and clicked to verify
