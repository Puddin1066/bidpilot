# Opportunity Sourcing

Manual review only — public bid boards, no scraping, no logins required for
viewing. Budget ~2 hours per weekly pull.

## Primary sources

### 1. Ocean State Procures (OSP) — Rhode Island state agencies
- Entry point: https://ridop.ri.gov → "Bidding Opportunities" icon → OSP Bid Board
- Public viewing requires no registration; the Bid Board lists current formal
  and informal solicitations with filters for agency, title, number, and date.
- Also check the "All Solicitations" landing page:
  https://ridop.ri.gov/vendor-resources/all-solicitations
- Note: vendors must register in OSP to *bid* — that's a useful outreach hook
  ("are you registered in OSP yet? It's required at submission").

### 2. RIVIP — RI municipalities, school districts, quasi-publics, higher ed
- Linked from the same All Solicitations page at ridop.ri.gov.
- External solicitations posted by cities/towns, school districts,
  quasi-public agencies (RIPTA, RIHousing, etc.), and universities.
- These are often the best BidPilot targets: smaller buyers, less
  standardized RFPs, more buried requirements, and bidders without proposal
  staff.

### 3. COMMBUYS — Massachusetts
- https://www.commbuys.com → Browse open bids (public, no login to view).
- Filter to service categories matching our verticals; prioritize
  opportunities within ~90 minutes of Providence for warm-market credibility.

### 4. Municipal websites (rotating spot-checks)
- Providence, Cranston, Warwick, Pawtucket, Newport purchasing pages.
- School districts and housing authorities post independently; check 3–4 per
  week on rotation.

## Selection criteria (aim for 10–15 per week)

Keep an opportunity if **all** of these hold:
- **Deadline 2–6 weeks out.** Under 2 weeks is too rushed to sell into;
  over 6 weeks has no urgency.
- **Professional services or supply+service scope** matching target verticals:
  IT/MSP, marketing/communications, workforce training, environmental and
  engineering consulting, scientific/technical consulting, small
  manufacturing/distribution, facilities services.
- **Contract value roughly $25k–$1M.** Big enough that a $199–$349 analysis is
  trivially justified; small enough that primes with proposal departments
  won't smother it.
- **At least one buried, concrete mandatory requirement** you can name in the
  email (insurance floor, vendor registration, license, mandatory pre-bid
  meeting/site visit, page limit, required form, past-performance minimum).
- **Open competition** (not sole-source, not pre-qualified-list-only).

## What to capture per opportunity

Fill one row in `tracker/opportunities.csv`:
- Solicitation number, title, buyer, portal/source URL
- Deadline and questions deadline
- Estimated value if stated
- The **hook requirement** (with page/section number) for the email
- Vertical and NAICS-ish category
- Status: NEW → PROSPECTED → OUTREACH_SENT → CONVERSATION → SOLD → CLOSED

## Time-saving tip

Read only these sections of each RFP on first pass: cover page, minimum
qualifications / mandatory requirements, evaluation criteria, submission
instructions, and attachments list. That's where hooks live. A full read
happens only after a customer pays.
