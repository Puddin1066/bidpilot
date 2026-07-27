# Day 0 — Launch & Revenue (next 24 hours)

**Live URL:** https://bidpilotri.com  
**Founding checkout (use in every email):**  
https://bidpilotri.com/checkout?product=READINESS_PACKAGE&promo=founding  
→ **$199** readiness package (list $349)

Product is already deployed with live Stripe + Gemini. The remaining bottleneck is **sales cycle hours you control today**, not more engineering.

## Non-negotiable truth

Arms-length revenue requires a **non-demo** customer account paying through **live Stripe**. Do not buy from Roundhouse / `is_demo` orgs — those check out free and do not count.

## Hour-by-hour (today)

| When | Do this | Done? |
|---|---|---|
| Now (15 min) | Confirm Stripe Dashboard → Webhooks → endpoint `https://bidpilotri.com/api/stripe/webhook` is active; events: `checkout.session.completed`, `charge.refunded`. Restricted key (`rk_live_…`) must allow Checkout Session create. | |
| Now (10 min) | Smoke-test: create a **new** throwaway personal email account (not Roundhouse), sign up on production, start founding checkout, abandon at Stripe card page. Confirm you land on Stripe hosted checkout (not mock banner). | |
| Next 90 min | **Call** RI APEX (Jeff Brant 401-278-9125 / jeffrey.brant@commerceri.com) and RISBDC (401-874-7232 / susandavis@uri.edu). Scripts in `04-call-scripts.md`. Ask for 2 warm intros today. | |
| Next 3 hours | Send the 12 emails in `day0-send-queue.md` (copy-paste ready). Log each send in `tracker/prospects.csv`. | |
| Afternoon | Call every prospect without email (phones already in tracker). Voicemail counts. | |
| Evening | Reply to every open/reply within 1 hour. Book 15-min calls for tomorrow morning. | |
| Tomorrow AM | Close the first founding checkout on a live call if needed (share screen → founding link). Deliver within 48h. | |

## Urgency ranking (deadlines from tracker)

1. **NBC Asset Mgmt RFQ 406.00 — opens Jul 28** (4 days) — engineering consultants
2. **DOA Tobacco Settlement audit — due Jul 29** (5 days) — RI CPA firms
3. **DLT Occ Health clinic — due Aug 6** — occupational health providers
4. **RIC Campus Shuttle — due Aug 7** — bus/charter (questions already closed; still sell readiness)
5. **RIDOT + Narragansett generators — Aug 5–13** — two-for-one electrical emails

Irrigation pre-bid (Jul 21) is **gone** — do not lead with that hook anymore.

## What not to do today

- Custom domain, Resend polish, PlaceboRx NIH demo, more product features
- Mock checkouts “to practice” counted as revenue
- Broad LinkedIn blasts without a named live solicitation

## Stripe checklist (you must click these)

1. Stripe → Developers → Webhooks → Add endpoint  
   URL: `https://bidpilotri.com/api/stripe/webhook`  
   Secret must match Vercel `STRIPE_WEBHOOK_SECRET`
2. If Checkout create fails with permission errors, replace `rk_live_…` with a standard `sk_live_…` secret key (or widen restricted-key permissions for Checkout Sessions + Products)
3. After first real payment: confirm job appears on dashboard **and** a `revenue_transactions` row exists with mock=false
