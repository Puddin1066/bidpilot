# BidPilot
## Rules-Aligned Build Specification for the Build with Gemini XPRIZE

**Working concept:** An AI-operated proposal department for small businesses pursuing government, institutional, and commercial contracts.

**Primary XPRIZE category:** Small Business Services  
**Secondary category:** Professional Services Access  
**Recommended initial market:** Small professional-services firms bidding on state, municipal, university, and selected federal opportunities  
**Recommended initial paid offer:** 48-Hour RFP Readiness Package  
**Recommended launch price:** $249–$499 per live solicitation

---

#
# 0. Official-Rules Compliance Baseline

This specification is subordinate to the official Build with Gemini XPRIZE rules. Where this document and the official rules differ, the official rules control.

## 0.1 Competition dates

- **Submission period opened:** May 19, 2026 at 10:00 a.m. Pacific Time
- **Submission deadline:** August 17, 2026 at 1:00 p.m. Pacific Time
- **Judging period:** August 18 through September 15, 2026
- **Finalist pitch and winners announced:** On or around September 25, 2026

The production application, repository, evidence package, public demonstration video, financial reporting, and testing credentials must all be ready before the submission deadline.

## 0.2 Entrant structure

BidPilot may be entered by:

- An eligible individual
- A team of eligible individuals
- A small organization with fewer than 25 employees

If entered through an organization:

- The organization must have fewer than 25 employees.
- A representative must be formally authorized to submit on its behalf.
- The submission must include the organization’s corporate ID.
- The representative must be able to document authority if requested.

**Implementation requirement:** Add an internal `competition_entrant` record storing entrant type, representative name, organization legal name, employee count, corporate ID, and authorization status.

## 0.3 New-project restriction

BidPilot must be a **new project created after May 19, 2026**.

Permitted reuse is limited to generic:

- Templates
- Frameworks
- Boilerplate
- Open-source components
- Code snippets

Any reused material must be disclosed in the submission, and the BidPilot-specific business logic, workflows, prompts, interface, data model, and production implementation must be newly created during the submission period.

**Build rule:**

- Create a new repository specifically for BidPilot.
- Do not fork or rename a pre-existing GEMflush application.
- Preserve the repository creation date and commit history.
- Add `docs/preexisting-materials.md` listing every reused framework, template, package, and code fragment.
- Add `docs/build-timeline.md` linking major features to dated commits.
- Ensure all submission components are solely owned by the entrant or used under compliant open-source or commercial licenses.

## 0.4 Required Google and Gemini implementation

BidPilot must:

- Use at least one Google Cloud product.
- Run on its intended platform.
- Use the Gemini API for at least one deployed LLM call if the project includes LLM functionality.

For a strong AI-native score, Gemini should perform the core production workflow rather than a token demonstration call.

**Required production services:**

- Gemini API through Vertex AI or Google AI
- Google Cloud Run for agent execution
- Google Cloud Storage for solicitation and deliverable files
- Cloud Logging for execution evidence

Optional Google services:

- Document AI
- Cloud Tasks
- Pub/Sub
- Secret Manager
- BigQuery for judge-facing metrics

## 0.5 Required third-party permissions

Every integrated SDK, API, dataset, and service must be used under valid terms.

Maintain:

- `docs/third-party-inventory.md`
- Service name
- Purpose
- License or terms URL
- Data rights
- Whether redistribution is allowed
- Whether customer authorization is required
- Date reviewed

For SAM.gov or other procurement feeds, use only documented and authorized access methods. Do not scrape portals where terms prohibit automated access.

## 0.6 Mandatory submission artifacts

BidPilot’s development definition of done includes all of the following:

1. **Working project**
2. **Selected category**
3. **Complete source-code repository**
4. **Repository testing access**
5. **English text description**
6. **Public demonstration video under three minutes**
7. **Revenue evidence**
8. **Monthly revenue breakdown for May, June, July, and August 2026**
9. **Total expense evidence**
10. **Marketing and customer-acquisition spend, including zero if applicable**
11. **Related-party revenue reported separately**
12. **Real-user evidence**
13. **Customer testimonials or feedback, with user awareness and permission**
14. **Production evidence such as execution logs, API records, and dashboards**
15. **Corporate ID if entered as an organization**
16. **Free judge access through the end of the judging period**
17. **Testing instructions and login credentials**
18. **Ability to respond to verification requests within two business days**

## 0.7 Repository and judge-access requirements

The repository must:

- Contain all source code needed to run the project.
- Be public with appropriate licensing, or private and shared with:
  - `testing@devpost.com`
  - `judging@hacker.fund`
- Include setup instructions.
- Include environment-variable documentation without secrets.
- Include database migrations.
- Include sample or synthetic data.
- Include test credentials in the private submission instructions.
- Remain accessible through the judging period.

The application must:

- Be available free of charge to judges.
- Have no paywall for judge testing.
- Include a seeded judge account.
- Include a synthetic solicitation and fictional company profile.
- Avoid exposing customer-confidential information.
- Remain available through September 15, 2026, with a practical buffer afterward.

## 0.8 Financial evidence requirements

The database must distinguish:

- Arms-length third-party revenue
- Related-party revenue
- Refunds
- Revenue month
- Product purchased
- Customer organization
- Payment processor record
- Marketing source
- Customer-acquisition spend
- Direct delivery cost
- AI API cost
- Contractor cost
- Hosting cost
- Other operating expenses

Revenue must be reportable by:

- May 2026
- June 2026
- July 2026
- August 2026

**Important:** Only arms-length third-party revenue should be counted as primary competition revenue. Revenue from team members, family, related entities, or pre-existing customer relationships must be separately identified.

## 0.9 User-evidence requirements

For every user or customer included in the submission evidence, store:

- Organization type
- General user classification
- Product used
- Date used
- Whether paid
- Testimonial or feedback
- Permission to share the testimonial or identifying information
- Contact information in a restricted verification table

Public dashboards should use aggregated or anonymized information. Customer names and contact details should be disclosed only when permission exists or privately supplied during verification.

## 0.10 Production-evidence requirements

The system must continuously create evidence that AI is live in production:

- Gemini request IDs where available
- Model name
- Prompt version
- Execution timestamp
- Input and output token usage
- API cost estimate
- Workflow stage
- Decision produced
- Confidence
- Human override
- Job and customer linkage
- Error and retry information
- Cloud execution log reference

Create a judge-facing timeline showing real production runs without exposing confidential solicitation content.

## 0.11 Three-minute demonstration constraint

The demo must show the product functioning on its intended device and must be publicly hosted.

Recommended video structure:

| Time | Demonstration |
|---|---|
| 0:00–0:20 | Customer problem, market, and paid offer |
| 0:20–0:45 | Upload a synthetic RFP and select an approved company profile |
| 0:45–1:15 | Gemini extracts requirements and makes an eligibility decision |
| 1:15–1:45 | Bid/no-bid decision and compliance matrix |
| 1:45–2:15 | Evidence-grounded draft and claim-verification workflow |
| 2:15–2:35 | Production logs showing Gemini executing key decisions |
| 2:35–2:50 | Real revenue, users, expenses, and category-impact dashboard |
| 2:50–3:00 | Why the business can continue beyond the hackathon |

No unlicensed music, third-party trademarks, or customer-confidential data should appear.

## 0.12 Judging model

### Stage One: Pass/fail

BidPilot must clearly:

- Fit the chosen category
- Use the required Google and Gemini technologies
- Function as described
- Satisfy the baseline submission requirements

### Stage Two: Equally weighted criteria

1. **Business Viability**
2. **AI-Native Operations**
3. **Category Impact**

Because business viability is the first tie-break criterion, the build should prioritize real independent revenue and a sustainable operating model rather than feature breadth.

---


# 1. Executive Summary

BidPilot is an AI-operated service that helps small businesses identify suitable contract opportunities, decide whether to bid, understand every mandatory requirement, and produce an evidence-grounded first-draft proposal package.

The customer is not initially purchasing a general-purpose software seat. The customer purchases a specific outcome tied to a live solicitation:

> **Upload an RFP and receive a bid/no-bid recommendation, compliance matrix, missing-document list, proposal strategy, and source-grounded first draft within 48 hours.**

BidPilot is designed around the three equally weighted Build with Gemini XPRIZE judging criteria:

1. **Business viability:** launch a real business, acquire real users, collect real revenue, and demonstrate a model that can continue beyond the competition.
2. **AI-native operations:** run the business through AI, with AI live in production and executing important decisions.
3. **Category impact:** materially improve how small businesses access and pursue contract opportunities.

The competition requires a working business rather than only a prototype. BidPilot therefore needs a payment workflow, real customer intake, production Gemini calls, traceable AI decisions, completed customer deliverables, and measurable business results.

---

# 2. Market Thesis

## 2.1 Market definition

BidPilot participates in several overlapping markets:

- Proposal management software
- RFP response automation
- Government contracting software
- Bid intelligence
- Proposal consulting and outsourced proposal writing
- Procurement opportunity discovery
- AI-assisted professional services

The clearest comparable market is proposal management software.

One market estimate places the global proposal management software market at approximately **$3.66 billion in 2026**, growing to approximately **$9.19 billion by 2034**, representing a **12.2% compound annual growth rate**. A separate estimate places the market at approximately **$3.22 billion in 2026**, with an 11.6% annual growth rate. These estimates differ because market-research firms define the category differently, but both indicate a multibillion-dollar and growing market.[^1][^2]

The U.S. government-contracting opportunity is also economically substantial. The U.S. Small Business Administration reported that federal agencies procured **$273 billion in small-business goods and services in fiscal year 2025**, supporting an estimated 1.2 million jobs.[^3]

SAM.gov provides public access to federal contracting notices, including pre-solicitations, solicitations, awards, and sole-source notices.[^4]

## 2.2 Why the market is attractive for an XPRIZE launch

A growing market does not guarantee product-market fit, but it improves the probability that:

- Buyers already recognize the workflow.
- Organizations already allocate money to proposal labor or software.
- A new provider does not need to invent the category.
- The cost of the problem is measurable.
- Contract deadlines create urgency.
- A successful bid can be worth tens or hundreds of times the service fee.
- Customers can purchase a discrete project without committing to a long implementation.

Existing AI-native RFP products commonly charge hundreds of dollars per month, while enterprise proposal platforms can exceed $2,000 per month and may include significant implementation expense.[^5]

BidPilot should avoid competing initially as another horizontal proposal-management platform. Its wedge is a **done-for-you, AI-operated response package for small organizations without dedicated proposal personnel**.

## 2.3 Initial ideal customer profile

The initial customer should have:

- 2–50 employees
- Existing commercial revenue
- A credible service or product
- Occasional exposure to RFPs
- No full-time proposal manager
- Reusable company materials, even if poorly organized
- Contract opportunities large enough to justify a $249–$1,500 service
- A decision-maker who can purchase without lengthy procurement

Recommended first verticals:

1. IT and managed-services firms
2. Marketing and communications agencies
3. Workforce training providers
4. Environmental and engineering consultants
5. Scientific and technical consulting firms
6. Small manufacturers and distributors
7. Professional-services companies pursuing municipal or university work

The best launch geography is **Rhode Island and Massachusetts**, where outreach can be personal, opportunities can be manually reviewed, and early customer support can remain manageable.

## 2.4 Customer problem

Small firms frequently fail to pursue viable contracts because:

- They discover opportunities too late.
- Solicitations are lengthy and difficult to interpret.
- Mandatory requirements are buried across appendices.
- Employees cannot spare 15–30 hours to prepare a response.
- Reusable company evidence is scattered across files.
- Generic AI tools may fabricate claims or omit requirements.
- Proposal consultants are expensive.
- Enterprise software requires configuration and ongoing subscription costs.

BidPilot does not promise to win contracts. It reduces the cost and friction of deciding whether to bid and preparing a compliant first draft.

## 2.5 Core positioning

> **BidPilot is an AI-operated proposal department for small businesses. It identifies viable opportunities, makes bid/no-bid recommendations, extracts every requirement, generates evidence-grounded proposal drafts, and audits the package before submission.**

---

# 3. XPRIZE Fit

The Build with Gemini XPRIZE is a 90-day competition requiring participants to build a real business using Gemini. The deadline is August 17, 2026.[^6]

The judging criteria are equally weighted.[^7]

## 3.1 Business viability

The XPRIZE requires teams to:

- Launch a real business
- Acquire real users
- Generate real revenue
- Demonstrate sustainability beyond the competition

BidPilot should produce the following evidence:

| Required evidence | BidPilot proof |
|---|---|
| Real business | Public landing page, prices, terms, checkout, intake, delivery workflow |
| Real customers | Unrelated businesses using BidPilot for live solicitations |
| Real revenue | Cash collected through Stripe during the competition |
| Repeatable fulfillment | Same agent workflow used across customers |
| Sustainable economics | Revenue exceeds Gemini, storage, parsing, and review costs |
| Customer value | Hours saved, proposal cost avoided, contract value pursued |
| Recurring potential | Opportunity monitoring and repeat proposal purchases |
| Market pull | Conversion from targeted outreach to paid jobs |

### Suggested traction target

A credible competition target:

| Offer | Quantity | Price | Revenue |
|---|---:|---:|---:|
| Opportunity Match | 10 | $49 | $490 |
| Bid/No-Bid Report | 5 | $149 | $745 |
| RFP Readiness Package | 5 | $349 | $1,745 |
| Complete Draft Package | 2 | $999 | $1,998 |
| Monitoring subscription | 3 | $99 | $297 |
| **Total** |  |  | **$5,275** |

This is not a required minimum. It is a practical target showing multiple independent purchases, price escalation, and early recurring revenue.

## 3.2 AI-native operations

The XPRIZE states that AI must be live in production and execute key decisions.[^7]

BidPilot satisfies this only when the production system—not the founder—performs the core workflow.

### AI decisions

The AI should determine:

- Whether an opportunity matches the customer
- Whether mandatory eligibility requirements are met
- Whether bidding is economically rational
- Which requirements are mandatory
- Which company evidence supports each response
- Which proposal structure is required
- Which facts require customer confirmation
- Whether a claim is unsupported
- Whether the package passes quality checks
- Whether the workflow requires escalation

### Human decisions

Humans retain control over:

- Pricing approval
- Legal certifications
- Binding representations
- Confidential information
- Final submission
- Ambiguous requirements
- High-risk claims

The correct framing is:

> **AI operates routine production and commercial decisions. Humans approve legally binding or low-confidence exceptions.**

### Required evidence logs

For every customer job, record:

- Customer and solicitation IDs
- Files received
- AI model and prompt version
- Opportunities considered
- Eligibility decision
- Bid/no-bid score and rationale
- Mandatory requirements extracted
- Evidence mapped to each claim
- Draft sections produced
- Compliance defects detected
- Confidence scores
- Human overrides
- Gemini token cost
- Processing time
- Human review time
- Customer delivery time
- Customer feedback
- Bid outcome

These records demonstrate that AI is operating the business rather than serving as a hidden writing assistant.

## 3.3 Category impact

### Recommended category: Small Business Services

Problem statement:

> Small businesses are excluded from valuable contract opportunities because proposal analysis and production require specialized personnel, substantial time, and expensive software.

Impact thesis:

> BidPilot gives a small firm an on-demand proposal department without requiring a dedicated proposal manager.

### Impact metrics

Track:

- Contract opportunities identified
- Qualified opportunities surfaced
- Total contract value pursued
- Proposals produced
- Proposals submitted
- First-time government bidders
- Proposal hours saved
- Consultant expense avoided
- Requirements detected
- Unsupported claims prevented
- Shortlists
- Contract awards
- Customer jobs supported by awarded work

---

# 4. Product Scope

## 4.1 Initial paid products

### Product A: Opportunity Match — $49

Customer receives:

- Five relevant opportunities
- Eligibility summary
- Fit score
- Deadline
- Estimated effort
- Recommended next action

### Product B: Bid/No-Bid Report — $149

Customer uploads one solicitation and receives:

- Eligibility decision
- Strategic fit score
- Opportunity risks
- Estimated proposal effort
- Missing qualifications
- Bid/no-bid recommendation
- Plain-language rationale

### Product C: 48-Hour RFP Readiness Package — $249–$499

Customer receives:

- Bid/no-bid recommendation
- Full compliance matrix
- Missing-document checklist
- Proposal outline
- Response strategy
- Executive-summary draft
- Technical-response first draft
- Risk and clarification list

### Product D: Complete First-Draft Package — $999–$2,500

Customer receives:

- All readiness-package components
- Full first draft
- Past-performance sections
- Management and staffing plans
- Implementation schedule
- Attachment checklist
- Independent compliance review
- Submission packaging instructions

### Product E: Monitoring — $99–$299/month

Customer receives:

- Weekly opportunity matching
- Deadline alerts
- Bid/no-bid recommendations
- Saved company knowledge base
- Discounted proposal packages

## 4.2 MVP boundaries

The MVP should:

- Accept uploaded PDFs and DOCX files
- Build a customer capability profile
- Analyze one uploaded solicitation
- Produce a bid/no-bid report
- Generate a compliance matrix
- Generate a grounded first draft
- Run a separate quality-control pass
- Export results as DOCX and PDF
- Collect payment
- Log all AI decisions

The MVP should **not** initially:

- Submit legally binding bids automatically
- Sign certifications
- Integrate with every procurement portal
- Promise contract awards
- Generate unsupported qualifications
- Provide legal advice
- Store uncontrolled sensitive data indefinitely
- Attempt dynamic pricing optimization
- Build a generalized CRM
- Build a full collaborative proposal editor

---

# 5. Customer Workflow

## 5.1 New customer journey

1. Customer lands on BidPilot.
2. Customer chooses a package.
3. Customer pays through Stripe.
4. Customer creates an account.
5. Customer completes the company-profile wizard.
6. Customer uploads the live solicitation.
7. System validates file readability.
8. Gemini extracts solicitation structure and requirements.
9. Eligibility agent evaluates mandatory qualifications.
10. Bid/no-bid agent scores the opportunity.
11. Customer sees a preliminary go/no-go result.
12. Customer answers missing-information questions.
13. Compliance agent builds the requirements matrix.
14. Strategy agent designs the response approach.
15. Drafting agent writes the first draft.
16. Verification agent checks every factual claim.
17. Compliance agent audits the final package.
18. Customer receives the deliverables.
19. Customer approves or requests one revision.
20. System records the outcome and requests feedback.
21. Customer is offered monitoring or a future package.

## 5.2 Customer status model

Each job moves through these states:

```text
PAID
→ INTAKE_REQUIRED
→ DOCUMENTS_UPLOADED
→ PARSING
→ ELIGIBILITY_REVIEW
→ CUSTOMER_CLARIFICATION
→ BID_DECISION_READY
→ COMPLIANCE_MAPPING
→ DRAFTING
→ QUALITY_REVIEW
→ HUMAN_EXCEPTION_REVIEW
→ READY_FOR_DELIVERY
→ DELIVERED
→ REVISION_REQUESTED
→ COMPLETED
→ OUTCOME_PENDING
```

## 5.3 Service-level expectations

| Package | Target delivery |
|---|---|
| Opportunity Match | 24 hours |
| Bid/No-Bid Report | 4 hours |
| Readiness Package | 48 hours |
| Complete Draft | 3–5 business days |

Automated delivery may be faster, but the platform should promise conservative turnaround until reliability is measured.

---

# 6. AI Agent Architecture

## 6.1 Orchestrator

The orchestrator manages workflow state, agent calls, retries, confidence thresholds, and escalation.

Responsibilities:

- Determine the next workflow stage
- Pass only authorized data to each agent
- Enforce structured outputs
- Store citations and provenance
- Detect failed or inconsistent runs
- Trigger human review
- Track cost and latency
- Prevent duplicate processing

The orchestrator should not rely on unconstrained conversational autonomy. It should use a deterministic state machine with Gemini invoked for bounded tasks.

## 6.2 Company Profile Agent

Inputs:

- Website
- Capability statement
- Resumes
- Past proposals
- Project descriptions
- Certifications
- Pricing assumptions
- Geographic limits

Outputs:

- Structured company profile
- Evidence library
- Missing-information list
- Confidence scores
- Customer confirmation requests

Example schema:

```json
{
  "legal_name": "Example Consulting LLC",
  "service_categories": [
    "technical diligence",
    "commercialization strategy"
  ],
  "naics_codes": ["541611", "541690"],
  "geographies": ["Rhode Island", "Massachusetts", "Remote"],
  "contract_value_range": {
    "minimum": 5000,
    "maximum": 250000
  },
  "certifications": [],
  "insurance": {
    "general_liability": null,
    "professional_liability": null
  },
  "past_performance": [
    {
      "project_id": "PP-001",
      "customer_type": "public investment fund",
      "scope": "life-science commercialization assessment",
      "evidence_document_ids": ["DOC-004"]
    }
  ]
}
```

## 6.3 Solicitation Parser Agent

Inputs:

- Solicitation files
- Amendments
- Attachments

Outputs:

- Buyer
- Solicitation number
- Deadline
- Submission method
- Scope
- Evaluation criteria
- Mandatory requirements
- Forms
- Page limits
- Required attachments
- Contract term
- Pricing structure
- Questions deadline
- Site-visit requirements
- Source page for every extraction

Every extracted requirement must include page-level provenance.

## 6.4 Eligibility Agent

Checks:

- Registration requirements
- Licenses
- Certifications
- NAICS or industry restrictions
- Location
- Insurance
- Bonding
- Past-performance minimums
- Staffing requirements
- Clearance
- Site visits
- Submission deadline
- Contract capacity

Outputs:

```json
{
  "decision": "CONDITIONALLY_ELIGIBLE",
  "confidence": 0.88,
  "blocking_requirements": [],
  "conditional_requirements": [
    {
      "requirement": "$2 million professional liability insurance",
      "source_page": 24,
      "customer_status": "UNKNOWN"
    }
  ],
  "rationale": "No confirmed disqualifying requirement, but insurance must be verified."
}
```

## 6.5 Bid/No-Bid Agent

Suggested factors:

| Factor | Weight |
|---|---:|
| Mandatory eligibility | Gate |
| Service fit | 20% |
| Past-performance fit | 15% |
| Contract-value attractiveness | 15% |
| Estimated win probability | 15% |
| Proposal effort | 10% |
| Deadline feasibility | 10% |
| Competitive intensity | 5% |
| Strategic value | 5% |
| Delivery capacity | 5% |

Outputs:

- Pursue
- Pursue with conditions
- Pursue with partner
- Monitor
- Decline

Do not present the score as statistically calibrated until sufficient outcome data exist. Call it a **decision-support score**, not a probability of award.

## 6.6 Compliance Matrix Agent

Output columns:

| Field | Description |
|---|---|
| Requirement ID | Unique internal identifier |
| Requirement text | Plain-language summary |
| Exact source | Page, section, file |
| Mandatory | Yes/No |
| Evaluation weight | If stated |
| Response location | Planned proposal section |
| Evidence needed | Supporting customer fact |
| Evidence status | Available/Missing/Unverified |
| Draft status | Not started/In progress/Complete |
| Risk | Low/Medium/High |

## 6.7 Strategy Agent

Generates:

- Win themes
- Differentiators
- Buyer priorities
- Response outline
- Evidence plan
- Staffing approach
- Delivery approach
- Risk mitigation
- Clarification questions

The agent must label:

- Verified facts
- Proposed approach
- Assumptions
- Customer-confirmation items
- Prohibited unsupported claims

## 6.8 Drafting Agent

Rules:

- Use the solicitation’s structure.
- Answer each requirement directly.
- Cite internal evidence IDs.
- Never invent customers, results, credentials, staff, prices, or certifications.
- Insert visible placeholders when evidence is missing.
- Observe page and word limits.
- Preserve buyer terminology.
- Avoid promotional filler.
- Distinguish commitments from capabilities.

## 6.9 Claim Verification Agent

For each material sentence:

1. Identify factual claims.
2. Locate supporting customer evidence.
3. Mark verified, unsupported, contradictory, or ambiguous.
4. Remove or flag unsupported language.
5. Return a claim-evidence map.

Example:

```json
{
  "claim": "The team has completed more than 20 comparable projects.",
  "status": "UNSUPPORTED",
  "evidence_ids": [],
  "required_action": "REMOVE_OR_CONFIRM"
}
```

## 6.10 Compliance Review Agent

Checks:

- Every mandatory requirement answered
- Correct proposal order
- Required forms included
- Page limits
- File naming
- Buyer name
- Solicitation number
- Dates
- Pricing consistency
- Attachment references
- Signatures and certifications flagged
- Unsupported claims
- Contradictions
- Missing customer confirmations

This agent must be separate from the drafting call.

## 6.11 Packaging Agent

Produces:

- Proposal draft DOCX
- Compliance matrix XLSX or CSV
- Bid/no-bid PDF
- Missing-information checklist
- Submission checklist
- Risk memo
- ZIP package
- Machine-readable audit JSON

## 6.12 Outcome Agent

After submission:

- Record submitted/not submitted
- Record shortlist, loss, award, or pending
- Collect buyer feedback
- Record contract value
- Record customer time spent
- Record BidPilot processing cost
- Update reusable company content
- Improve future decision support

---

# 7. Platform Architecture

## 7.1 Recommended stack

| Layer | Technology |
|---|---|
| Front end | Next.js 15, TypeScript, Tailwind CSS |
| Authentication | Supabase Auth or Clerk |
| Database | Supabase PostgreSQL |
| File storage | Google Cloud Storage |
| AI | Gemini through Vertex AI or Gemini API |
| Agent execution | Google Cloud Run |
| Queue | Cloud Tasks or Pub/Sub |
| PDF parsing | Gemini multimodal first; Document AI fallback |
| Payments | Stripe Checkout |
| Email | Resend |
| Analytics | PostHog |
| Error monitoring | Sentry |
| Document export | docx npm package, PDF renderer |
| Hosting | Vercel front end, Google Cloud production workers |

The deployed project must use the Gemini API for production LLM functionality and at least one Google Cloud product. BidPilot will use Gemini for its core proposal workflow, Cloud Run for agent execution, Cloud Storage for documents, and Cloud Logging for production evidence.[^6][^7]

## 7.2 High-level architecture

```text
Browser
  │
  ▼
Next.js Application
  ├── Marketing and pricing
  ├── Authentication
  ├── Customer dashboard
  ├── Job intake
  ├── Document review
  └── XPRIZE metrics dashboard
  │
  ▼
Supabase
  ├── Users
  ├── Organizations
  ├── Jobs
  ├── Structured company profiles
  ├── Requirements
  ├── Evidence
  ├── Agent decisions
  └── Revenue and outcomes
  │
  ▼
Cloud Run Orchestrator
  ├── Job state machine
  ├── Gemini calls
  ├── Validation
  ├── Retry logic
  ├── Cost logging
  └── Human escalation
  │
  ├── Google Cloud Storage
  ├── Vertex AI / Gemini
  ├── Cloud Tasks
  └── Document AI fallback
```

## 7.3 Security requirements

- Encrypt files at rest and in transit.
- Use organization-level tenant isolation.
- Use signed file URLs.
- Store source documents privately.
- Separate customer data from public demo data.
- Do not train on customer documents.
- Implement deletion requests.
- Log privileged access.
- Redact secrets before model calls where feasible.
- State data-retention periods.
- Require customer confirmation before using past proposals as reusable content.

---

# 8. Database Model

## 8.1 Core tables

### users

```sql
id uuid primary key
email text unique not null
full_name text
created_at timestamptz
```

### organizations

```sql
id uuid primary key
owner_user_id uuid references users(id)
legal_name text
website text
industry text
created_at timestamptz
```

### organization_members

```sql
organization_id uuid
user_id uuid
role text
primary key (organization_id, user_id)
```

### company_profiles

```sql
id uuid primary key
organization_id uuid
version integer
profile_json jsonb
status text
approved_at timestamptz
created_at timestamptz
```

### documents

```sql
id uuid primary key
organization_id uuid
job_id uuid null
document_type text
filename text
storage_path text
mime_type text
sha256 text
processing_status text
created_at timestamptz
```

### evidence_items

```sql
id uuid primary key
organization_id uuid
document_id uuid
evidence_type text
content text
source_page integer null
metadata jsonb
approved boolean default false
created_at timestamptz
```

### solicitations

```sql
id uuid primary key
organization_id uuid
title text
buyer text
solicitation_number text
deadline timestamptz
source_url text null
structured_data jsonb
created_at timestamptz
```

### jobs

```sql
id uuid primary key
organization_id uuid
solicitation_id uuid
product_type text
status text
price_paid_cents integer
stripe_payment_id text
started_at timestamptz
delivered_at timestamptz null
created_at timestamptz
```

### requirements

```sql
id uuid primary key
job_id uuid
requirement_code text
requirement_text text
source_document_id uuid
source_page integer
source_section text
mandatory boolean
evaluation_weight numeric null
planned_response_section text
evidence_status text
risk_level text
created_at timestamptz
```

### bid_decisions

```sql
id uuid primary key
job_id uuid
decision text
score numeric
confidence numeric
factor_scores jsonb
rationale text
human_override text null
created_at timestamptz
```

### draft_sections

```sql
id uuid primary key
job_id uuid
section_name text
content_markdown text
version integer
status text
created_at timestamptz
```

### claim_evidence_links

```sql
id uuid primary key
draft_section_id uuid
claim_text text
evidence_item_id uuid null
verification_status text
confidence numeric
created_at timestamptz
```

### agent_runs

```sql
id uuid primary key
job_id uuid
agent_name text
model_name text
prompt_version text
input_hash text
output_json jsonb
confidence numeric null
token_input integer
token_output integer
estimated_cost_cents integer
duration_ms integer
status text
created_at timestamptz
```

### human_reviews

```sql
id uuid primary key
job_id uuid
review_type text
reviewer_user_id uuid
decision text
notes text
minutes_spent integer
created_at timestamptz
```

### deliverables

```sql
id uuid primary key
job_id uuid
deliverable_type text
storage_path text
version integer
created_at timestamptz
```

### outcomes

```sql
id uuid primary key
job_id uuid
submitted boolean
shortlisted boolean null
won boolean null
contract_value_cents bigint null
customer_hours_saved numeric null
feedback text null
recorded_at timestamptz
```

---

# 9. User Interface

## 9.1 Public pages

### Landing page

Sections:

1. Headline
2. Problem
3. Upload-to-deliverable workflow
4. Example compliance matrix
5. Pricing
6. Trust and safety
7. FAQ
8. Checkout CTA

Suggested headline:

> **Turn a 100-page RFP into a bid decision and compliant first draft.**

Suggested subheadline:

> BidPilot analyzes the solicitation, maps every requirement, grounds responses in your approved company evidence, and flags anything that still needs human confirmation.

### Pricing page

Show fixed-fee packages before subscriptions.

### Example report page

Use a synthetic solicitation and fictional company.

### XPRIZE transparency page

Display:

- AI tasks
- Human tasks
- Production workflow
- Decision logs
- Aggregate impact metrics
- Revenue and customer counts where appropriate

## 9.2 Authenticated application

### Dashboard

Cards:

- Active jobs
- Upcoming deadlines
- Jobs needing clarification
- Delivered packages
- Opportunity matches
- Outcome tracking
- Company-profile completion

### Company profile wizard

Steps:

1. Company basics
2. Services
3. Geographies
4. Contract capacity
5. Certifications
6. Insurance and bonding
7. Team
8. Past performance
9. Reusable evidence
10. Approval

### New job flow

1. Choose package
2. Upload solicitation
3. Confirm deadline
4. Select company profile
5. Pay
6. Review preliminary extraction
7. Answer questions
8. Track status

### Job workspace

Tabs:

- Overview
- Bid decision
- Requirements
- Evidence gaps
- Strategy
- Draft
- Quality review
- Deliverables
- Audit log
- Outcome

### Admin operations dashboard

Metrics:

- Revenue
- Paid jobs
- Conversion
- Delivery time
- Gemini cost
- Human-review minutes
- Gross margin
- Failure rate
- Unsupported claims caught
- Customer satisfaction
- Repeat purchases

---

# 10. Workflow Logic

## 10.1 Deterministic orchestration

Pseudo-code:

```typescript
async function advanceJob(jobId: string): Promise<void> {
  const job = await getJob(jobId);

  switch (job.status) {
    case "DOCUMENTS_UPLOADED":
      await enqueueSolicitationParsing(jobId);
      break;

    case "PARSING_COMPLETE":
      await enqueueEligibilityReview(jobId);
      break;

    case "ELIGIBILITY_REVIEW_COMPLETE":
      if (await requiresCustomerClarification(jobId)) {
        await setStatus(jobId, "CUSTOMER_CLARIFICATION");
      } else {
        await enqueueBidDecision(jobId);
      }
      break;

    case "BID_DECISION_READY":
      if (await customerApprovedContinuation(jobId)) {
        await enqueueComplianceMapping(jobId);
      }
      break;

    case "COMPLIANCE_MAPPING_COMPLETE":
      await enqueueStrategy(jobId);
      break;

    case "STRATEGY_COMPLETE":
      await enqueueDrafting(jobId);
      break;

    case "DRAFTING_COMPLETE":
      await enqueueClaimVerification(jobId);
      break;

    case "CLAIM_VERIFICATION_COMPLETE":
      await enqueueComplianceReview(jobId);
      break;

    case "QUALITY_REVIEW_COMPLETE":
      if (await hasHighRiskExceptions(jobId)) {
        await setStatus(jobId, "HUMAN_EXCEPTION_REVIEW");
      } else {
        await enqueuePackaging(jobId);
      }
      break;

    case "PACKAGING_COMPLETE":
      await deliverJob(jobId);
      break;
  }
}
```

## 10.2 Confidence thresholds

Recommended initial policy:

| Confidence | Action |
|---:|---|
| ≥ 0.90 | Continue automatically |
| 0.75–0.89 | Continue but display warning |
| 0.50–0.74 | Request customer confirmation |
| < 0.50 | Require human review |

Mandatory eligibility failures should override confidence scoring.

## 10.3 Hallucination controls

- Structured JSON schemas for every agent
- Evidence IDs required for material claims
- Separate generation and verification calls
- Page-level solicitation citations
- Customer-approved company profile
- No ungrounded free-form proposal generation
- Temperature kept low for extraction and verification
- Explicit placeholder insertion
- Automated contradiction detection
- Human approval for pricing and certifications

---

# 11. Revenue Operations

## 11.1 Customer acquisition

The strongest method is **opportunity-led outreach**.

Workflow:

1. Collect live public solicitations.
2. Identify plausible local vendors.
3. Produce a lightweight fit analysis.
4. Contact the company with the actual opportunity.
5. Include one concrete requirement or risk.
6. Offer a fixed-price analysis.
7. Link directly to checkout.

Example outreach:

> A Rhode Island solicitation for workforce training appears aligned with your services and is due August 8. BidPilot identified two mandatory requirements that may be easy to miss. For $249, it will produce a bid/no-bid assessment, full compliance matrix, evidence-gap list, and first-draft response within 48 hours.

Do not begin with generic messaging such as “Try our AI proposal software.”

## 11.2 Sales funnel

Track:

```text
Opportunity discovered
→ Candidate vendors identified
→ Personalized outreach sent
→ Landing-page visit
→ Sample viewed
→ Checkout started
→ Payment completed
→ Intake completed
→ Job delivered
→ Revision requested
→ Outcome recorded
→ Repeat purchase
```

## 11.3 Unit economics

Track per job:

- Price collected
- Stripe fee
- Gemini input cost
- Gemini output cost
- Document AI cost
- Storage cost
- Email cost
- Human review time
- Refunds
- Gross margin

Initial operating goal:

- Human review under 60 minutes for readiness package
- AI and infrastructure cost under 10% of price
- Gross margin above 70%
- On-time delivery above 90%
- Refund rate under 5%

---


# 12A. Rules-Compliant Submission Data Model

Add these tables or equivalent structures.

## competition_entrants

```sql
id uuid primary key
entrant_type text not null
representative_name text not null
organization_legal_name text null
employee_count integer null
corporate_id text null
authorization_confirmed boolean default false
created_at timestamptz not null
updated_at timestamptz not null
```

## revenue_transactions

```sql
id uuid primary key
organization_id uuid references organizations(id)
job_id uuid references jobs(id)
stripe_payment_id text
amount_cents integer not null
currency text default 'USD'
revenue_type text not null
-- ARMS_LENGTH, RELATED_PARTY, PRE_EXISTING_CUSTOMER
customer_relationship_note text
recognized_month date not null
refunded_amount_cents integer default 0
evidence_storage_path text
created_at timestamptz not null
```

## expense_transactions

```sql
id uuid primary key
expense_date date not null
expense_category text not null
-- AI_API, CLOUD_HOSTING, CONTRACTOR, MARKETING, CUSTOMER_ACQUISITION,
-- PAYMENT_PROCESSING, SOFTWARE, OTHER
vendor text
description text not null
amount_cents integer not null
evidence_storage_path text
related_job_id uuid null references jobs(id)
created_at timestamptz not null
```

## user_evidence

```sql
id uuid primary key
organization_id uuid references organizations(id)
job_id uuid null references jobs(id)
user_classification text
is_real_user boolean default true
is_paying_customer boolean default false
feedback_text text null
testimonial_text text null
sharing_permission boolean default false
verification_contact_name text null
verification_contact_email text null
verification_contact_phone text null
created_at timestamptz not null
```

Restrict verification contact fields to privileged administrative access.

## submission_artifacts

```sql
id uuid primary key
artifact_type text not null
-- REPOSITORY, VIDEO, TEXT_DESCRIPTION, FINANCIAL_EXPORT,
-- USER_EVIDENCE_EXPORT, TESTING_INSTRUCTIONS, CORPORATE_ID,
-- THIRD_PARTY_INVENTORY, PREEXISTING_MATERIALS
status text not null
url text null
storage_path text null
last_verified_at timestamptz null
notes text null
created_at timestamptz not null
updated_at timestamptz not null
```

## judge_accounts

```sql
id uuid primary key
email text unique not null
access_role text default 'JUDGE'
expires_at timestamptz not null
created_at timestamptz not null
```

The judge account must have access to synthetic demonstration data, the product workflow, and aggregate evidence, but not unrestricted access to confidential customer files.

---

# 12B. Rules-Compliant Admin and Evidence Interfaces

## Competition readiness dashboard

Create an admin route at `/admin/xprize-readiness` with:

- Submission countdown
- Stage One checklist
- Stage Two evidence completeness
- Repository-access status
- Judge-account status
- Demo-video status
- Public application uptime
- Google Cloud services used
- Gemini production-call count
- Revenue by month
- Arms-length revenue
- Related-party revenue
- Total expenses
- Marketing and customer-acquisition spend
- Real-user count
- Paying-customer count
- Testimonials with permission
- Production-log coverage
- Corporate-ID status
- Third-party licensing inventory
- Pre-existing-material disclosure
- Outstanding verification risks

## Required exports

Create one-click exports for:

- `xprize-revenue-by-month.csv`
- `xprize-related-party-revenue.csv`
- `xprize-expenses.csv`
- `xprize-marketing-spend.csv`
- `xprize-user-evidence.csv`
- `xprize-agent-execution-summary.csv`
- `xprize-business-metrics.pdf`
- `xprize-testing-instructions.md`
- `xprize-third-party-inventory.md`
- `xprize-preexisting-materials.md`

## Verification readiness

Add a secure internal package capable of producing, within two business days:

- Payment records
- Expense records
- Customer contact details
- User permissions
- Job-delivery evidence
- API usage evidence
- Repository access confirmation
- Live-demo credentials
- Corporate documentation


# 12. XPRIZE Evidence Dashboard

Build a public or judge-accessible dashboard showing:

## Business viability

- Total revenue
- Independent revenue
- Related-party revenue
- Number of paying organizations
- Average selling price
- Repeat purchase rate
- Gross margin
- Monthly recurring revenue
- Customer acquisition method

## AI-native operations

- Number of AI-operated jobs
- Number of agent decisions
- Percentage of workflow completed automatically
- Human-review minutes per job
- AI cost per job
- Customer overrides
- Escalation rate
- Unsupported claims caught
- Requirements extracted
- Processing time

## Category impact

- Small businesses served
- First-time bidders
- Proposals submitted
- Contract value pursued
- Hours saved
- Proposal-consulting cost avoided
- Shortlists
- Awards
- Estimated jobs supported

The dashboard must be backed by real database events, not manually typed marketing numbers.

---

# 13. Development Roadmap

## Phase 1: Paid upload-to-report workflow

Build:

- Landing page
- Authentication
- Stripe
- Company-profile form
- File upload
- Solicitation parsing
- Bid/no-bid report
- Compliance matrix
- Customer dashboard
- Agent logging

Goal:

> Collect the first payment and deliver a useful analysis.

## Phase 2: Evidence-grounded drafting

Build:

- Evidence library
- Strategy agent
- Drafting agent
- Claim-evidence links
- Verification agent
- DOCX export

Goal:

> Deliver a first draft without unsupported claims.

## Phase 3: Production quality and XPRIZE evidence

Build:

- Independent compliance review
- Human exception queue
- Cost logging
- Delivery metrics
- Public impact dashboard
- Outcome tracking
- Customer feedback

Goal:

> Demonstrate that AI operates the business with limited founder intervention.

## Phase 4: Opportunity discovery and recurring revenue

Build:

- SAM.gov search integration
- State portal feeds where practical
- Saved matching criteria
- Weekly alerts
- Monitoring subscription

Goal:

> Establish repeat usage and recurring revenue.

---

# 14. Cursor Development Prompts

Run these prompts sequentially. Review and commit after every phase.

## Prompt 1 — Repository and architecture

```text
You are building BidPilot, an AI-operated RFP analysis and proposal-production platform for the Build with Gemini XPRIZE.

Create a production-ready monorepo using:
- Next.js 15 App Router
- TypeScript with strict mode
- Tailwind CSS
- Supabase PostgreSQL and Auth
- Google Cloud Storage for private files
- Cloud Run worker services
- Gemini through Vertex AI
- Stripe Checkout
- Resend
- PostHog
- Sentry

Create:
1. apps/web for the customer-facing Next.js application
2. apps/worker for the Cloud Run workflow orchestrator
3. packages/database for typed database access
4. packages/schemas for Zod schemas
5. packages/agents for Gemini agents
6. packages/documents for PDF/DOCX parsing and export
7. packages/shared for shared utilities

Include:
- Environment-variable validation
- ESLint
- Prettier
- Vitest
- Playwright
- Dockerfiles
- README with local setup
- Error handling
- Structured logging
- No mock secrets

Do not implement business features yet. First create the clean architecture, dependency boundaries, health endpoints, and deployment configuration.
```

## Prompt 2 — Database and tenant security

```text
Implement the BidPilot PostgreSQL schema in Supabase.

Create migrations, TypeScript database types, and repositories for:
- users
- organizations
- organization_members
- company_profiles
- documents
- evidence_items
- solicitations
- jobs
- requirements
- bid_decisions
- draft_sections
- claim_evidence_links
- agent_runs
- human_reviews
- deliverables
- outcomes

Requirements:
- UUID primary keys
- created_at and updated_at timestamps where appropriate
- Row Level Security on all customer data
- Users may access only organizations where they are members
- Service-role access only from the worker
- Immutable audit records for agent_runs
- Monetary values stored as integer cents
- JSONB used only for versioned structured model outputs
- Add useful indexes
- Add test fixtures and RLS tests
- Document every table and relationship
```

## Prompt 3 — Public website and checkout

```text
Build the BidPilot public website.

Pages:
- /
- /pricing
- /sample
- /how-it-works
- /trust
- /xprize
- /login
- /signup

Landing-page positioning:
"Turn a 100-page RFP into a bid decision and compliant first draft."

Packages:
- Opportunity Match: $49
- Bid/No-Bid Report: $149
- 48-Hour RFP Readiness Package: $349
- Complete First-Draft Package: $999
- Monitoring: $99/month

Implement Stripe Checkout and webhook processing.
A successful payment should:
1. Create a paid job.
2. Associate it with the authenticated organization.
3. Send a receipt and intake link.
4. Log revenue as independent or related-party based on an admin flag.

Use accessible design, responsive layouts, clear error states, and no unsupported performance claims.
```

## Prompt 4 — Company profile wizard

```text
Build the authenticated company-profile wizard.

Capture:
- Legal name
- Website
- Services
- Industries
- NAICS codes
- Geography
- Contract-value range
- Certifications
- Licenses
- Insurance
- Bonding
- Security clearances
- Key personnel
- Past performance
- Excluded work
- Reusable documents

Allow PDF and DOCX uploads through signed Google Cloud Storage URLs.

Use Gemini to extract a structured company profile from uploaded documents, but require the customer to approve every extracted fact before it becomes usable proposal evidence.

Each evidence item must include:
- source document
- page number when available
- extracted text
- evidence type
- approval status
- confidence

Never allow unapproved evidence into proposal drafting.
```

## Prompt 5 — Solicitation upload and parsing

```text
Implement solicitation intake.

The customer uploads one or more PDF or DOCX files for an RFP, amendment, or appendix.

Build a Solicitation Parser Agent using Gemini.

Return validated JSON containing:
- title
- buyer
- solicitation number
- issue date
- deadline
- questions deadline
- submission mechanism
- scope
- contract term
- estimated value if stated
- evaluation criteria
- mandatory eligibility requirements
- required forms
- required attachments
- page limits
- site visits
- pricing structure
- source document and page for every extracted item

Use Zod validation.
Reject malformed outputs and retry with error feedback.
Store every agent run, prompt version, token count, cost estimate, duration, and output.
Display parsed fields for customer confirmation.
```

## Prompt 6 — Eligibility and bid/no-bid agents

```text
Implement two separate Gemini agents.

Eligibility Agent:
- Compare mandatory requirements with approved company evidence.
- Return ELIGIBLE, CONDITIONALLY_ELIGIBLE, or INELIGIBLE.
- Identify blocking, conditional, and satisfied requirements.
- Include source pages and evidence IDs.
- Never infer that an unknown qualification is satisfied.

Bid/No-Bid Agent:
- Run only after eligibility.
- Score service fit, past performance, contract value, likely competitive position, proposal effort, deadline feasibility, strategic value, and delivery capacity.
- Return PURSUE, PURSUE_WITH_CONDITIONS, PURSUE_WITH_PARTNER, MONITOR, or DECLINE.
- Explain factor scores.
- State clearly that the score is decision support and not a calibrated probability of award.

Build UI pages showing both decisions and allowing customer override with a written reason.
Log all overrides.
```

## Prompt 7 — Compliance matrix

```text
Implement the Compliance Matrix Agent.

For each solicitation requirement, store:
- requirement code
- plain-language requirement
- exact source file, page, and section
- mandatory status
- evaluation weight
- planned response section
- evidence needed
- available approved evidence
- missing evidence
- draft status
- risk level

Create an editable table in the job workspace.
Allow export to CSV and XLSX.
Add filters for mandatory, missing evidence, and high risk.
No requirement may be marked satisfied without a linked approved evidence item or an explicit customer confirmation.
```

## Prompt 8 — Strategy and drafting

```text
Implement a Proposal Strategy Agent and Drafting Agent.

The Strategy Agent produces:
- buyer priorities
- proposed win themes
- differentiators
- response outline
- evidence plan
- staffing approach
- delivery approach
- risk mitigation
- clarification questions
- assumptions requiring confirmation

The Drafting Agent:
- Writes in the solicitation's required structure.
- Answers requirements directly.
- Uses only approved evidence.
- Adds internal evidence IDs to all material claims.
- Inserts [CUSTOMER CONFIRMATION REQUIRED] when facts are missing.
- Does not invent credentials, projects, people, prices, certifications, or results.
- Observes word and page limits.
- Produces sections in Markdown stored by version.

Build an editor where customers can review sections and see linked evidence beside each claim.
```

## Prompt 9 — Verification and compliance review

```text
Implement two independent review agents.

Claim Verification Agent:
- Split draft sections into material factual claims.
- Link each claim to approved evidence.
- Mark VERIFIED, UNSUPPORTED, CONTRADICTORY, or AMBIGUOUS.
- Remove nothing automatically; flag defects and propose corrections.

Compliance Review Agent:
- Check that all mandatory requirements are answered.
- Check order, naming, page limits, dates, buyer name, solicitation number, forms, attachments, pricing references, signatures, certifications, and placeholders.
- Return PASS, PASS_WITH_WARNINGS, or FAIL.
- Generate an unresolved-risk list.

Create a human-exception queue for:
- low-confidence requirements
- unsupported claims
- contradictory evidence
- legal certifications
- pricing
- final signatures

Record reviewer time and decisions.
```

## Prompt 10 — Export and delivery

```text
Implement deliverable generation.

Create:
- Bid/no-bid PDF
- Compliance matrix XLSX
- Missing-information checklist PDF
- Proposal first draft DOCX
- Submission checklist PDF
- Risk memo PDF
- Audit JSON
- ZIP bundle

Use branded but restrained formatting.
Include generation timestamp and version.
Do not include internal prompts.
Store files privately in Google Cloud Storage.
Email secure download links through Resend.
Track delivery timestamp and link access.
Allow one customer revision request.
```

## Prompt 11 — XPRIZE metrics

```text
Build the BidPilot XPRIZE operations dashboard.

Business viability metrics:
- revenue
- independent revenue
- related-party revenue
- paying customers
- average selling price
- repeat purchases
- MRR
- gross margin

AI-native metrics:
- completed jobs
- agent decisions
- automated workflow percentage
- human-review minutes per job
- Gemini cost per job
- override rate
- escalation rate
- unsupported claims caught
- requirements extracted
- median delivery time

Impact metrics:
- small businesses served
- first-time bidders
- proposals submitted
- contract value pursued
- hours saved
- estimated consulting cost avoided
- shortlists
- awards

All metrics must be computed from database events.
Create a judge-accessible read-only view with no customer-confidential information.
```

## Prompt 12 — Production hardening

```text
Perform a production-readiness pass.

Add:
- Tenant-isolation tests
- Signed URL expiry
- File type and size validation
- Malware-scanning hook
- Rate limits
- Idempotent Stripe webhooks
- Idempotent agent jobs
- Retry and dead-letter handling
- Prompt versioning
- Model timeout handling
- Cost caps by product
- Data-retention controls
- Customer deletion workflow
- Audit logs
- Sentry
- PostHog events
- End-to-end Playwright tests
- Synthetic demo organization and RFP
- Load testing for simultaneous jobs
- Deployment documentation

Do not claim the system provides legal advice or guarantees contract awards.
```

---


## Prompt 13 — Official-rules compliance and submission readiness

```text
Implement the official-rules compliance layer for BidPilot.

Create:
1. competition_entrants table and admin form
2. revenue_transactions with ARMS_LENGTH, RELATED_PARTY, and PRE_EXISTING_CUSTOMER classifications
3. expense_transactions including explicit marketing and customer-acquisition spend
4. user_evidence with testimonial-sharing permission and restricted verification contacts
5. submission_artifacts checklist
6. judge_accounts with synthetic-data-only access
7. /admin/xprize-readiness dashboard
8. monthly May, June, July, and August 2026 revenue reports
9. total-expense and marketing-spend reports
10. Gemini production-call evidence reports
11. source-repository and judge-access checks
12. testing-instructions generator
13. pre-existing-material disclosure document
14. third-party integration and licensing inventory
15. two-business-day verification export package

Rules:
- The project must be demonstrably new after May 19, 2026.
- Never combine arms-length and related-party revenue in judge-facing primary revenue.
- Never expose customer contact information publicly.
- Public testimonials require explicit sharing permission.
- Judges must receive free product access through the judging period.
- The repository must contain all source code, migrations, and setup instructions.
- Gemini must be used in the deployed production workflow.
- At least one Google Cloud product must be used.
- All metrics must be computed from stored events or financial records.
- Add automated tests for revenue classification, monthly reporting, RLS, judge access, and evidence-export completeness.
```

## Prompt 14 — Submission bundle and three-minute demo mode

```text
Build a competition submission mode.

Create:
- A synthetic fictional customer
- A synthetic RFP that does not use third-party trademarks
- Seeded approved evidence
- A deterministic demo workflow
- A judge account
- A public read-only impact dashboard
- A three-minute demo script
- A video shot list
- English testing instructions
- Repository-sharing instructions
- A submission text-description draft
- A category-impact explanation
- A code-generated financial summary
- A code-generated user-evidence summary
- A code-generated AI-native operations summary

The demo workflow must visibly show:
1. upload
2. Gemini extraction
3. eligibility decision
4. bid/no-bid decision
5. compliance matrix
6. evidence-grounded drafting
7. independent verification
8. production execution logs
9. revenue, expenses, users, and impact metrics

Ensure the demo does not display confidential customer information, copyrighted music, unlicensed trademarks, or unsupported performance claims.
```


# 15. Validation Plan

## Week 1

- Create landing page and checkout.
- Interview five potential customers.
- Collect three live RFPs.
- Sell one manual-assisted bid/no-bid report.

## Week 2

- Automate parsing and compliance matrix.
- Deliver two paid readiness packages.
- Measure human review time.

## Week 3

- Add grounded drafting and claim verification.
- Increase price.
- Deliver three paid packages.

## Week 4

- Add recurring opportunity alerts.
- Convert one customer to monitoring.
- Publish XPRIZE metrics.

### Go/no-go thresholds

Continue aggressively if:

- At least three unrelated customers pay $149 or more.
- At least one customer buys a second service.
- Human review falls below one hour per readiness package.
- At least 70% of extracted mandatory requirements are correct before human review.
- No unsupported material claim reaches the customer unflagged.
- Gross margin exceeds 60% during the learning phase.

Reconsider the concept if:

- Prospects express interest but refuse to pay even when tied to a live opportunity.
- Customers require extensive proposal consulting beyond the automated workflow.
- Human review remains above three hours per package.
- Source-grounding fails on ordinary solicitations.
- Buyers consistently prefer generic ChatGPT use over a verified package.

---

# 16. Principal Risks

| Risk | Consequence | Mitigation |
|---|---|---|
| Hallucinated qualifications | Customer liability and loss of trust | Approved evidence only; separate verifier |
| Missed mandatory requirement | Nonresponsive bid | Page-level extraction and independent review |
| Sensitive data exposure | Commercial harm | Tenant isolation, private storage, retention policy |
| Unclear market differentiation | Low conversion | Sell checked deliverable, not generic writing |
| Irregular bidding frequency | Weak subscription retention | Transaction pricing plus monitoring |
| Long time to contract award | Delayed proof of downstream value | Charge for response production |
| Crowded market | Difficult acquisition | Target under-served small firms and local opportunities |
| Founder becomes consultant | Poor AI-native score and margins | Track human minutes and automate repeated exceptions |
| Procurement/legal reliance | Liability | Customer approves pricing, certifications, and submission |
| Overbuilding | Missed XPRIZE deadline | Launch upload-to-report workflow first |

---

# 17. Final Build Recommendation

The most pragmatic BidPilot XPRIZE product is not an autonomous federal contracting platform.

It is:

> **A paid upload-to-deliverable service that converts a live RFP into a defensible bid decision, complete compliance matrix, evidence-gap report, and grounded first draft.**

The project should be judged internally by four numbers:

1. **Independent revenue collected**
2. **Number of live proposals processed**
3. **Human review minutes per paid job**
4. **Material unsupported claims reaching customers**

A strong XPRIZE submission would show that BidPilot generated paid deliverables for real small businesses, made consequential workflow decisions through Gemini, reduced proposal effort, maintained defensible quality controls, and developed recurring revenue through opportunity monitoring.

---

# Sources

[^1]: Fortune Business Insights, “Proposal Management Software Market Size, Share & Industry Analysis,” estimating a $3.66 billion 2026 market and 12.2% CAGR through 2034: https://www.fortunebusinessinsights.com/proposal-management-software-market-108680

[^2]: Research and Markets, “Proposal Management Software Market Report 2026,” estimating a $3.22 billion 2026 market and 11.6% growth: https://www.researchandmarkets.com/reports/5980535/proposal-management-software-market-report

[^3]: U.S. Small Business Administration, “SBA Releases FY25 Scorecard for Small Business Contracting,” June 25, 2026: https://www.sba.gov/article/2026/06/25/sba-releases-fy25-scorecard-small-business-contracting

[^4]: SAM.gov Contract Opportunities: https://sam.gov/opportunities

[^5]: Bidara, “Top AI RFP Software 2026,” vendor-reported pricing comparison; use directionally rather than as independent market research: https://www.bidara.ai/comparison/top-ai-rfp-software-2026

[^6]: Build with Gemini XPRIZE official site: https://www.geminixprize.com/

[^7]: Build with Gemini XPRIZE Devpost page and FAQ describing business viability, AI-native operations, category impact, and equal weighting: https://xprize.devpost.com/ and https://xprize.devpost.com/details/faq


# 18. Final Rules-Based Acceptance Criteria

BidPilot is not submission-ready until every item below is true.

## Stage One eligibility

- [ ] Project was newly created after May 19, 2026.
- [ ] Reused boilerplate and open-source components are disclosed.
- [ ] Entrant is eligible.
- [ ] Organization has fewer than 25 employees, if applicable.
- [ ] Representative authorization is documented.
- [ ] Corporate ID is available, if applicable.
- [ ] Project clearly fits Small Business Services.
- [ ] Application is deployed and functional.
- [ ] At least one Google Cloud product is used.
- [ ] Gemini API is called in the deployed workflow.
- [ ] Third-party integrations are authorized.
- [ ] Repository contains all necessary source code.
- [ ] Repository access is granted to required judging addresses.
- [ ] Judge testing account works.
- [ ] Project is free to judges through the judging period.

## Business viability evidence

- [ ] At least one arms-length paying customer exists.
- [ ] Revenue is recorded by month.
- [ ] Related-party revenue is separately classified.
- [ ] Total expenses are recorded.
- [ ] Marketing and customer-acquisition spending is recorded, including zero.
- [ ] Payment evidence is retained.
- [ ] Customer relationships can be verified.
- [ ] Unit economics are computed.
- [ ] Continuation model is explained.

## AI-native operations evidence

- [ ] Gemini performs live production work.
- [ ] Gemini executes consequential decisions.
- [ ] Agent calls are logged.
- [ ] Prompt and model versions are recorded.
- [ ] Human overrides are logged.
- [ ] Production execution can be demonstrated.
- [ ] AI versus human responsibilities are explained.
- [ ] The demo shows the AI operating the workflow.

## Category impact evidence

- [ ] Real small-business users are documented.
- [ ] User breakdown is available.
- [ ] Testimonials have sharing permission.
- [ ] Proposals, requirements, and contract value pursued are measured.
- [ ] Time and cost savings are measured conservatively.
- [ ] The path to credible adoption is explained.

## Submission package

- [ ] English text description is complete.
- [ ] Public demonstration video is under three minutes.
- [ ] Video shows the working application.
- [ ] Video avoids unauthorized trademarks and copyrighted music.
- [ ] Repository URL is ready.
- [ ] Testing instructions are ready.
- [ ] Revenue evidence is ready.
- [ ] Expense evidence is ready.
- [ ] User evidence is ready.
- [ ] Production evidence is ready.
- [ ] Corporate ID is ready, if applicable.
- [ ] Verification package can be produced within two business days.

