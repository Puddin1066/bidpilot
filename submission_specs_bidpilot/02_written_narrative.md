# Written Narrative (500–1000 words) — DRAFT

Replace every `[PLACEHOLDER: ...]` with real figures before submitting.
Current draft length (excluding placeholders/headers): ~850 words — inside the limit.
Recount after edits.

---

## BidPilot: an AI-operated proposal department for small businesses

Every year, U.S. federal agencies alone buy roughly $273 billion in goods and
services from small businesses — yet most small firms never bid. Not because
they can't do the work, but because responding to an RFP is a specialist job:
parsing hundreds of pages of requirements, judging eligibility, deciding
whether the bid is worth pursuing, mapping compliance clause by clause, and
producing a draft that a contracting officer will actually read. Firms without
a proposal department either pay consultants thousands of dollars per response
or walk away from revenue they were qualified to win.

BidPilot is that proposal department, operated by AI. A customer uploads a
solicitation, and within 48 hours receives a bid/no-bid recommendation, a full
compliance matrix, a missing-document checklist, a response strategy, and a
source-grounded first draft. Packages range from a $149 Bid/No-Bid Report to a
$999 Complete First-Draft Package, plus a $99/month monitoring subscription —
priced so a small business can buy a single decision before committing to a
full response.

### How the business runs day to day

BidPilot is not a chatbot with a human doing the real work behind it. When a
customer pays through Stripe, a deterministic state machine advances the job
through eight specialized Gemini agents (gemini-2.5-flash via the Gemini API):
a solicitation parser, an eligibility agent, a bid/no-bid agent, a compliance
matrix agent, a strategy agent, a drafting agent, and two independent
reviewers — a claim verifier and a compliance reviewer. Each agent returns
structured JSON validated against a schema, and failed validations are retried
with error feedback automatically.

The AI executes the key decisions: whether the customer meets mandatory
eligibility requirements, whether bidding is economically rational (scored
across nine factors), which requirements are mandatory, which pieces of
customer-approved evidence support each response section, which claims are
unsupported, and whether the finished package passes quality review or must be
escalated. When the independent verifier finds unsupported claims or
confidence drops below threshold, the system routes itself to an exception
queue — the AI decides when humans need to be involved.

Humans approve exactly what they legally must: pricing, certifications,
binding representations, and final submission. Our operating principle is that
AI operates routine production and commercial decisions; humans approve
legally binding or low-confidence exceptions. Every agent execution is written
to an immutable audit table recording the model, prompt version, token usage,
cost, duration, confidence, and decision produced — so "AI runs this business"
is not a claim, it is a queryable log. A public transparency page computes
aggregate operating metrics live from that database.

Trust is engineered in, not promised. Drafts may cite only evidence the
customer has approved in their company library; every claim carries an
evidence tag, and facts we cannot ground become explicit "customer
confirmation required" placeholders rather than plausible-sounding
fabrications. An independent verification agent — separate from the drafting
agent — checks every claim before delivery.

### Traction during the hackathon

[PLACEHOLDER: revenue summary — e.g. "Between launch on <date> and August X,
BidPilot generated $X,XXX in arms-length revenue from N paying customers
across M purchases, with $XXX in monthly recurring monitoring revenue.
Related-party revenue of $X is reported separately."]

[PLACEHOLDER: usage summary — e.g. "The agents executed N production runs
across M paid jobs, processing X solicitations totaling $XM in pursued
contract value, at an average AI cost of $X.XX per job against an average
package price of $XXX."]

[PLACEHOLDER: 1–2 sentence customer testimonial with permission, and customer
count by segment.]

### What humans do — and the jobs this creates

Beyond the founding team, BidPilot creates and enables work in two directions.
Inside the business, growth adds human roles the model deliberately preserves:
exception reviewers with procurement expertise who handle the escalation
queue, and customer success staff who help firms build their evidence
libraries — skilled part-time work suited to retired contracting officers and
proposal professionals. [PLACEHOLDER: adjust to reflect any actual
contractors engaged during the hackathon.]

Outside the business, the impact is the point of the category: every small
firm that wins a contract it would otherwise never have bid on hires people to
deliver it. Proposal capability has been a hiring gatekeeper — companies good
at their trade but not at paperwork stay small. By making a credible response
cost $349 instead of a $5,000 consulting engagement, BidPilot moves real
procurement dollars toward exactly the businesses that public contracting
programs are designed to reach.

### Why this lasts beyond 90 days

The unit economics are AI-native: cost per job is dominated by metered API
calls logged to the cent, so gross margin holds at small scale. The product is
transactional first — a small business can buy one $149 decision with no
implementation project — and recurring second, as monitoring subscriptions
compound. The proposal-management market is estimated at over $3 billion in
2026 and growing at roughly 12% annually, while our wedge — done-for-you
response packages for firms with no proposal staff — is underserved by
seat-based software priced for enterprises. Our five-year goal is to be the
default proposal department for small government and institutional
contractors. [PLACEHOLDER: one sentence on path to profitability with real
margin numbers from the hackathon period.]

---

## Notes for finalizing

- Word count target: 500–1000. Trim the market paragraph first if over.
- Judges read for three things — make sure each lands: **Business Viability**
  (traction section), **AI-Native Operations** (day-to-day section),
  **Category Impact** (jobs section).
- Do not include customer-confidential details; testimonials require stored permission.
- Keep claims conservative and consistent with the evidence exports — judges
  can verify against the audit logs we submit.
