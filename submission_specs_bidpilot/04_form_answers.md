# Devpost Form Answers — DRAFTS

The email lists the questions below; **start the actual form now** to capture exact
wording and any questions not previewed here, then adapt. Replace all
`[PLACEHOLDER: ...]` items before submitting.

---

## 1. Category, and how the project creates impact within it

**Category: Small Business Services.**

> BidPilot gives small businesses a capability that today belongs only to firms
> with proposal departments: the ability to credibly pursue government,
> institutional, and commercial contracts. Federal agencies bought ~$273B from
> small businesses in FY2025, yet most qualified small firms never bid because
> a single RFP response requires specialist parsing, eligibility analysis,
> compliance mapping, and drafting. BidPilot delivers all of that as an
> AI-operated service for $149–$999 per package — versus thousands per response
> for consultants — so the impact is direct: more small businesses bidding on,
> and winning, contracts they were already qualified to perform, and hiring to
> deliver them. [PLACEHOLDER: N customers, X solicitations processed, $XM
> contract value pursued during the hackathon.]

## 2. Business model — sustainability and viability

> Transactional packages ($49 Opportunity Match, $149 Bid/No-Bid Report, $349
> 48-Hour Readiness Package, $999 Complete First-Draft Package) plus a $99/mo
> monitoring subscription. Customers can buy a single low-risk decision before
> committing to a full response, and monitoring converts one-time buyers into
> recurring revenue. Unit economics are AI-native: delivery cost is dominated
> by metered Gemini API calls, logged per job to the cent
> ([PLACEHOLDER: average AI cost $X.XX vs average package price $XXX]).
> Path to profitability: [PLACEHOLDER: real margin math from hackathon data].
> Five-year goal: become the default outsourced proposal department for small
> government and institutional contractors, expanding from response packages
> into always-on opportunity monitoring across a customer base that renews
> because wins are directly attributable. Traction so far: [PLACEHOLDER:
> revenue, customers, repeat purchases, subscriptions].

## 3. The extent AI is live in production and executes key decisions

> AI executes the core commercial decisions in production for every paid job.
> A deterministic state machine advances each job through eight Gemini agents:
> solicitation parsing, eligibility determination, a nine-factor bid/no-bid
> recommendation, compliance matrix construction, response strategy, evidence-
> grounded drafting, independent claim verification, and independent compliance
> review. The AI decides whether the customer is eligible, whether bidding is
> economically rational, which requirements are mandatory, which approved
> evidence supports each section, whether claims are unsupported, and whether
> the package passes quality review or must escalate to a human exception
> queue — the AI decides when humans get involved. Humans approve only pricing,
> legal certifications, and final submission. Every run is recorded in an
> immutable audit table (model, prompt version, tokens, cost, confidence,
> decision), and our evidence export contains [PLACEHOLDER: N] production runs
> across [PLACEHOLDER: M] paid jobs.

## 4. Which Google Cloud product and how

**Decision needed first** — see checklist item. Current truthful answer:

> BidPilot uses the **Gemini API** (`gemini-2.5-flash` via the `@google/genai`
> SDK) as the production workforce of the business: eight distinct agents with
> structured JSON output (`responseJsonSchema`), schema validation, and
> automatic retry-with-error-feedback, including multimodal PDF ingestion of
> solicitations.

If we add Cloud Run hosting or Vertex AI routing (recommended de-risk), append:

> The application is deployed on **Cloud Run** [or: Gemini calls are served
> through **Vertex AI**], which runs the production pipeline end to end.

## 5. How the Gemini API is used for at least one LLM call

> Every job makes 6–8+ Gemini API calls (`gemini-2.5-flash`). Example: the
> solicitation parser sends the customer's RFP PDF as an inline file part and
> receives structured JSON (requirements, deadlines, evaluation criteria)
> validated against a Zod schema; invalid responses are retried with the
> validation errors fed back. Each call's `gemini_response_id`, token counts,
> and cost are stored in our `agent_runs` audit table — included in our
> evidence exports.

## 6. Revenue, expenses, users acquired, and paying users during the hackathon

> Total arms-length revenue: [PLACEHOLDER: $X,XXX]
> Monthly: May $0 · June $0 · July [PLACEHOLDER] · August [PLACEHOLDER]
> (BidPilot launched [PLACEHOLDER: date]; pre-launch months honestly reported as $0.)
> Total expenses: [PLACEHOLDER — include Gemini API, Supabase, hosting, Stripe
> fees, domain, and marketing/customer-acquisition spend even if $0.]
> Users acquired: [PLACEHOLDER] · Paying users: [PLACEHOLDER]
> P&L attached using the provided template; Stripe dashboard export attached.

## 7. Customer concentration and related-party disclosure

> No single customer represents more than 40% of revenue.
> [VERIFY on /admin/xprize-readiness before submitting — a single $999 package
> requires ≥ ~$1,500 from other customers.]
> Related-party revenue: [PLACEHOLDER: $0, or itemized separately — any revenue
> from friends, family, team members, or pre-existing relationships. Our
> `revenue_transactions` table classifies every transaction at capture time.]

## 8. Repo and testing access (private submission notes)

> Repository: [PLACEHOLDER: GitHub URL] — shared with testing@devpost.com and
> judging@hacker.fund [if private].
> Application: [PLACEHOLDER: production URL]
> Judge credentials: [PLACEHOLDER — seeded judge account, synthetic org,
> mock-payment path so judges are never charged].
> Full walkthrough: `docs/testing-instructions.md` in the repo.
> Free judge access guaranteed through September 15, 2026. Verification
> requests answered within two business days via /admin/xprize-readiness exports.
