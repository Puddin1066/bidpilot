/**
 * MOCK AI MODE outputs.
 *
 * These deterministic fixtures are returned by callAgent() when
 * GEMINI_API_KEY is not configured. They are always stored with
 * agent_runs.is_mocked = true and surfaced in the UI with a MOCKED badge.
 * They describe a synthetic solicitation and a fictional company only.
 */
import type {
  ParsedSolicitation,
  EligibilityResult,
  BidDecision,
  ComplianceMatrix,
  StrategyResult,
  DraftResult,
  ClaimVerification,
  ComplianceReview,
} from "@/lib/schemas/agents";

const DOC = "synthetic-rfp-ocean-state-training.pdf";

export const mockParsedSolicitation: ParsedSolicitation = {
  title: "Workforce Development Training Services (Synthetic Demo RFP)",
  buyer: "Ocean State Regional Workforce Board (fictional)",
  solicitation_number: "OSRWB-2026-014",
  issue_date: "2026-06-15",
  deadline: "2026-08-08T17:00:00-04:00",
  questions_deadline: "2026-07-25T17:00:00-04:00",
  submission_mechanism: "Electronic submission via buyer portal (PDF)",
  scope:
    "Design and deliver workforce training programs for adult learners in information technology and healthcare support occupations across two counties.",
  contract_term: "12 months with two 12-month renewal options",
  estimated_value: "$180,000 base year",
  evaluation_criteria: [
    { criterion: "Technical approach", weight: "35%", source: { document: DOC, page: 12, section: "4.1" } },
    { criterion: "Past performance", weight: "25%", source: { document: DOC, page: 12, section: "4.2" } },
    { criterion: "Staffing plan", weight: "20%", source: { document: DOC, page: 13, section: "4.3" } },
    { criterion: "Price", weight: "20%", source: { document: DOC, page: 13, section: "4.4" } },
  ],
  mandatory_requirements: [
    {
      requirement: "Offeror must hold an active state vendor registration at time of proposal submission.",
      category: "REGISTRATION",
      source: { document: DOC, page: 8, section: "3.2" },
    },
    {
      requirement: "Offeror must carry professional liability insurance of at least $1,000,000 per occurrence.",
      category: "INSURANCE",
      source: { document: DOC, page: 9, section: "3.4" },
    },
    {
      requirement: "Offeror must document at least two comparable training engagements completed within the last five years.",
      category: "PAST_PERFORMANCE",
      source: { document: DOC, page: 9, section: "3.5" },
    },
    {
      requirement: "Proposals must include signed Attachment B (Certification of Non-Collusion).",
      category: "FORMS",
      source: { document: DOC, page: 22, section: "Attachment B" },
    },
  ],
  required_forms: [
    { form: "Attachment A – Cost Proposal Workbook", source: { document: DOC, page: 20, section: "Attachment A" } },
    { form: "Attachment B – Certification of Non-Collusion", source: { document: DOC, page: 22, section: "Attachment B" } },
  ],
  required_attachments: [
    { attachment: "Certificate of insurance", source: { document: DOC, page: 9, section: "3.4" } },
    { attachment: "Two past-performance references", source: { document: DOC, page: 9, section: "3.5" } },
  ],
  page_limits: [
    { section: "Technical proposal", limit: "20 pages", source: { document: DOC, page: 10, section: "3.7" } },
  ],
  site_visits: null,
  pricing_structure: "Fixed price per training cohort with optional per-learner add-ons",
};

export const mockEligibility: EligibilityResult = {
  decision: "CONDITIONALLY_ELIGIBLE",
  confidence: 0.86,
  blocking_requirements: [],
  conditional_requirements: [
    {
      requirement: "Professional liability insurance of at least $1,000,000 per occurrence",
      source_page: 9,
      customer_status: "UNKNOWN",
    },
    {
      requirement: "Active state vendor registration",
      source_page: 8,
      customer_status: "NEEDS_DOCUMENT",
    },
  ],
  satisfied_requirements: [
    {
      requirement: "Two comparable training engagements within five years",
      evidence_ids: ["EV-PP-001", "EV-PP-002"],
    },
  ],
  rationale:
    "No confirmed disqualifying requirement was found. Insurance coverage and current vendor registration must be verified by the customer before submission.",
};

export const mockBidDecision: BidDecision = {
  decision: "PURSUE_WITH_CONDITIONS",
  score: 74,
  confidence: 0.81,
  factor_scores: {
    service_fit: 85,
    past_performance_fit: 78,
    contract_value_attractiveness: 72,
    estimated_win_probability: 60,
    proposal_effort: 65,
    deadline_feasibility: 80,
    competitive_intensity: 55,
    strategic_value: 75,
    delivery_capacity: 82,
  },
  rationale:
    "Strong service and past-performance fit with a feasible deadline. Conditions: confirm insurance coverage and vendor registration before committing. This is a decision-support score, not a calibrated probability of award.",
};

export const mockComplianceMatrix: ComplianceMatrix = {
  rows: [
    {
      requirement_code: "REQ-001",
      requirement_text: "Active state vendor registration at time of submission",
      source: { document: DOC, page: 8, section: "3.2" },
      mandatory: true,
      evaluation_weight: null,
      planned_response_section: "Administrative Compliance",
      evidence_needed: "Vendor registration confirmation",
      evidence_status: "MISSING",
      risk_level: "HIGH",
    },
    {
      requirement_code: "REQ-002",
      requirement_text: "Professional liability insurance ≥ $1,000,000 per occurrence",
      source: { document: DOC, page: 9, section: "3.4" },
      mandatory: true,
      evaluation_weight: null,
      planned_response_section: "Administrative Compliance",
      evidence_needed: "Certificate of insurance",
      evidence_status: "MISSING",
      risk_level: "HIGH",
    },
    {
      requirement_code: "REQ-003",
      requirement_text: "Two comparable training engagements in the last five years",
      source: { document: DOC, page: 9, section: "3.5" },
      mandatory: true,
      evaluation_weight: "25%",
      planned_response_section: "Past Performance",
      evidence_needed: "Project summaries with references",
      evidence_status: "AVAILABLE",
      risk_level: "LOW",
    },
    {
      requirement_code: "REQ-004",
      requirement_text: "Technical proposal limited to 20 pages",
      source: { document: DOC, page: 10, section: "3.7" },
      mandatory: true,
      evaluation_weight: null,
      planned_response_section: "Technical Approach",
      evidence_needed: "Formatting compliance",
      evidence_status: "AVAILABLE",
      risk_level: "LOW",
    },
    {
      requirement_code: "REQ-005",
      requirement_text: "Signed Attachment B (Certification of Non-Collusion)",
      source: { document: DOC, page: 22, section: "Attachment B" },
      mandatory: true,
      evaluation_weight: null,
      planned_response_section: "Forms and Certifications",
      evidence_needed: "Signature by authorized officer (human approval required)",
      evidence_status: "UNVERIFIED",
      risk_level: "MEDIUM",
    },
  ],
};

export const mockStrategy: StrategyResult = {
  buyer_priorities: [
    "Measurable employment outcomes for adult learners",
    "Instructor quality and industry-recognized credentials",
    "Reliable delivery across two counties",
  ],
  win_themes: [
    "Outcome-driven curriculum tied to regional employer demand",
    "Experienced instructors with documented completion rates",
  ],
  differentiators: [
    "Documented comparable engagements with public workforce buyers [EV:EV-PP-001]",
  ],
  response_outline: [
    { section: "Executive Summary", purpose: "Frame outcomes and fit in one page" },
    { section: "Technical Approach", purpose: "Curriculum design, delivery model, outcome tracking" },
    { section: "Staffing Plan", purpose: "Named instructors, qualifications, backup coverage" },
    { section: "Past Performance", purpose: "Two comparable engagements with references" },
    { section: "Administrative Compliance", purpose: "Registration, insurance, forms" },
  ],
  evidence_plan: [
    { claim_area: "Past performance", evidence_ids: ["EV-PP-001", "EV-PP-002"] },
    { claim_area: "Instructor qualifications", evidence_ids: ["EV-PER-001"] },
  ],
  staffing_approach:
    "Lead instructor plus program coordinator; backup instructor identified for continuity.",
  delivery_approach:
    "Cohort-based delivery at community sites in both counties with hybrid options.",
  risk_mitigation: [
    "Confirm insurance coverage before submission",
    "Complete vendor registration in week one",
  ],
  clarification_questions: [
    "Are virtual-only cohorts acceptable for the healthcare support track?",
  ],
  assumptions_requiring_confirmation: [
    "Customer holds or can obtain state vendor registration before the deadline",
    "Customer insurance meets the $1,000,000 professional liability threshold",
  ],
};

export const mockDraft: DraftResult = {
  sections: [
    {
      section_name: "Executive Summary",
      content_markdown:
        "Demo Training Partners LLC proposes to deliver workforce training in information technology and healthcare support occupations for the Ocean State Regional Workforce Board. Our team has completed comparable public-sector training engagements [EV:EV-PP-001] [EV:EV-PP-002] and will apply the same outcome-tracking model to this program. [CUSTOMER CONFIRMATION REQUIRED: current state vendor registration status]",
    },
    {
      section_name: "Technical Approach",
      content_markdown:
        "Our cohort-based delivery model combines instructor-led sessions with applied practice. Curriculum modules map to the occupations named in Section 2 of the solicitation. Outcome tracking follows the completion-rate methodology used in prior engagements [EV:EV-PP-001].",
    },
    {
      section_name: "Past Performance",
      content_markdown:
        "Engagement 1: Adult IT fundamentals program for a regional workforce agency [EV:EV-PP-001]. Engagement 2: Healthcare support training cohort for a community college partner [EV:EV-PP-002]. Reference contact details will be provided in the reference forms. [CUSTOMER CONFIRMATION REQUIRED: permission to name reference contacts]",
    },
  ],
};

export const mockClaimVerification: ClaimVerification = {
  claims: [
    {
      section_name: "Executive Summary",
      claim_text: "Our team has completed comparable public-sector training engagements",
      status: "VERIFIED",
      evidence_ids: ["EV-PP-001", "EV-PP-002"],
      confidence: 0.93,
      required_action: "NONE",
      proposed_correction: null,
    },
    {
      section_name: "Technical Approach",
      claim_text: "Outcome tracking follows the completion-rate methodology used in prior engagements",
      status: "VERIFIED",
      evidence_ids: ["EV-PP-001"],
      confidence: 0.88,
      required_action: "NONE",
      proposed_correction: null,
    },
    {
      section_name: "Past Performance",
      claim_text: "Healthcare support training cohort for a community college partner",
      status: "AMBIGUOUS",
      evidence_ids: ["EV-PP-002"],
      confidence: 0.62,
      required_action: "REVISE",
      proposed_correction:
        "Confirm the engagement was a healthcare support cohort; the evidence describes a general clinical-office skills program.",
    },
  ],
};

export const mockComplianceReview: ComplianceReview = {
  result: "PASS_WITH_WARNINGS",
  confidence: 0.84,
  checks: [
    { check: "All mandatory requirements addressed", status: "PASS", detail: "5 of 5 mapped to sections" },
    { check: "Page limits", status: "PASS", detail: "Technical section under 20 pages" },
    { check: "Required forms", status: "WARN", detail: "Attachment B requires authorized signature (human approval)" },
    { check: "Insurance evidence", status: "WARN", detail: "Certificate of insurance not yet provided" },
    { check: "Unsupported claims", status: "PASS", detail: "No unsupported material claims remain" },
  ],
  unresolved_risks: [
    "Vendor registration must be confirmed before submission",
    "Certificate of insurance must be attached",
  ],
};
