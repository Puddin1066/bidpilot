# Marketing Outreach — Opportunity-Led Playbook

Goal: **30+ personalized outreach touches by Day 5**, producing **3+ sales
conversations** and **≥1 arms-length paying customer** in week 1.

The motion is opportunity-led: we never pitch "AI proposal software." We find a
live solicitation, identify vendors who could plausibly win it, and email them
about **their** opportunity — naming one buried mandatory requirement as proof
we've actually read it. The email is the product demo.

## The funnel (track every stage in `tracker/`)

```text
Opportunity discovered        (tracker/opportunities.csv)
→ Candidate vendors identified (tracker/prospects.csv)
→ Personalized outreach sent
→ Reply / landing-page visit
→ Sales conversation
→ Checkout started
→ Payment completed
→ Job delivered
→ Testimonial collected (with permission)
→ Repeat purchase
```

## Files in this folder

| File | Purpose |
|---|---|
| `01-opportunity-sourcing.md` | Where and how to pull live solicitations (OSP, RIVIP, COMMBUYS, municipal) |
| `02-vendor-mapping.md` | How to find 5–10 plausible vendors per solicitation |
| `03-email-templates.md` | Initial email, two follow-ups, reply handling, personalization checklist |
| `04-call-scripts.md` | RI APEX Accelerator and RISBDC referral calls; warm-prospect call script |
| `05-founding-customer-offer.md` | The founding-customer offer and the value math |
| `06-contact-directory.md` | Verified names, emails, and phones for APEX, SBDC, SBA, CWE, SCORE |
| `tracker/opportunities.csv` | Opportunity log (one row per solicitation) — seeded with 13 live opportunities pulled 2026-07-17 |
| `tracker/prospects.csv` | Prospect log (one row per vendor contact) — seeded with 25+ mapped vendors |
| `scripts/pull_opportunities.py` | Pulls live OSP + RIVIP solicitations into tracker-format CSV |

## Weekly cadence

| Day | Activity | Volume |
|---|---|---|
| Sat | Pull new solicitations from OSP + RIVIP + COMMBUYS + municipal sites | 10–15 opportunities |
| Sun | Map vendors, fill `prospects.csv`, personalize drafts | 50–100 prospects |
| Mon | Send wave 1; call RI APEX + RISBDC | 15–20 emails, 2 calls |
| Tue | Send wave 2; follow up on all opens/replies within 24h | 15–20 emails |
| Wed–Thu | Sales conversations; deliver concierge-style; collect testimonials | as booked |
| Fri | Update tracker stats; retro on which verticals replied; queue next week | — |

## Rules

1. **Every email names a real, live opportunity with a real deadline.** No
   generic blasts, ever.
2. **Name one specific buried requirement** (insurance floor, registration,
   page limit, mandatory form, site visit) with its page number. This is the
   credibility hook.
3. **CAN-SPAM basics:** truthful subject, real identity and mailing address in
   the footer, honor opt-outs immediately, one-to-one personalized email from
   a personal address.
4. **No scraping.** All portal review is manual, using public bid boards.
5. **Log every touch** in `tracker/prospects.csv` the moment it happens —
   funnel numbers drive next week's targeting and feed the XPRIZE evidence.
6. **Never promise contract awards.** We sell analysis, compliance, and a
   grounded draft — the refund guarantee covers missed mandatory requirements,
   nothing else.
