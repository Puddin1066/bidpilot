# Email Templates

Rules for every send:
- One-to-one, from a personal address (e.g., `jjr@…`), plain text, no images.
- Truthful subject naming their real opportunity. Real signature with mailing
  address. Honor opt-outs immediately.
- Under 150 words. The buried requirement *is* the pitch — resist explaining
  the product.
- Fill every `{placeholder}` from `tracker/prospects.csv`. Never send with a
  placeholder left in.

---

## Template 1 — Initial outreach

**Subject:** `{buyer}` `{solicitation_short_title}` — closes `{deadline}`

```text
Hi {first_name},

{buyer} just posted "{solicitation_title}" ({solicitation_number}) —
responses due {deadline}. Given {company}'s work in {their_service_area},
you'd be a plausible bidder.

One thing that trips firms up on this one: {hook_requirement_sentence}
(page {page_ref} of the RFP). Miss it and the bid is non-responsive no
matter how good the proposal is.

I run BidPilot — we turn an RFP like this into a full compliance matrix,
a bid/no-bid analysis, and a grounded first draft within 48 hours, for a
flat $199–$349. If we miss a mandatory requirement, it's free.

Worth a 15-minute look at this one? Happy to send a sample report first.

{your_name}
BidPilot — {landing_page_url}
{mailing_address}
Reply "no thanks" and I won't email again.
```

**Hook requirement examples** (the sentence pattern):
- "it requires $2M aggregate general liability *plus* a separate $1M
  professional liability rider"
- "bidders must attend the mandatory pre-bid site visit on {date} — no
  walk-ons, RSVP required"
- "you must be fully registered in Ocean State Procures (W-9 uploaded)
  before award, and soft registration alone isn't enough to submit"
- "the technical narrative is capped at 10 pages and Attachment C must be
  signed in two places"

---

## Template 2 — Follow-up 1 (3 days later, no reply)

**Subject:** Re: `{buyer}` `{solicitation_short_title}` — closes `{deadline}`

```text
Hi {first_name},

Quick follow-up — questions for {solicitation_number} are due
{questions_deadline}, so the clock matters this week.

If you're already on it, one free tip: {second_requirement_or_tip}.

If you'd rather see what we produce before deciding: {sample_url} is a
full sample readiness package for a similar RFP.

{your_name}
```

## Template 3 — Follow-up 2 / breakup (3 days after that)

**Subject:** last note on `{solicitation_number}`

```text
Hi {first_name},

Last note from me on this one. If {company} passes on
{solicitation_short_title}, no worries — but if state/municipal work is on
your radar at all, I'll flag the next {vertical} solicitation that fits
you. Just reply "keep me posted."

Either way, good luck this quarter.

{your_name}
```

---

## Reply handling

| Reply | Response (within 4 business hours) |
|---|---|
| "Tell me more" / questions | Send sample link + 2–3 call slots. Goal: 15-min call, not email thread. |
| "How much / how does it work" | One paragraph: price, 48h turnaround, refund guarantee, checkout link. Offer the call. |
| "We're already bidding this" | "Perfect — the $199 readiness package is exactly for firms already bidding: it's a second set of eyes on every mandatory requirement." |
| "Not this one" | Offer monitoring: "Want me to flag the next one that fits? No charge to be on the list." Log as NURTURE. |
| "Who are you / is this AI?" | Be direct: founder, RI-based, AI-assisted analysis with human-verifiable citations to the RFP text. Never dodge. |
| Opt-out (any phrasing) | Mark DO_NOT_CONTACT in tracker, never email again. |

## Pre-send checklist (every email)

- [ ] Deadline verified on the portal *today* (addenda change dates)
- [ ] Hook requirement quotes the actual RFP with a real page/section number
- [ ] Their service area accurately described (30 seconds on their site)
- [ ] Correct first name, company spelling
- [ ] Logged in `tracker/prospects.csv` with today's date
