import { z } from "zod";

/** Page-level provenance required for every extracted item (spec 6.3). */
export const sourceRefSchema = z.object({
  document: z.string().describe("Source filename"),
  page: z.number().int().nullable().describe("1-based page number, null if unknown"),
  section: z.string().nullable().optional(),
});

export const parsedSolicitationSchema = z.object({
  title: z.string(),
  buyer: z.string(),
  solicitation_number: z.string().nullable(),
  issue_date: z.string().nullable(),
  deadline: z.string().nullable(),
  questions_deadline: z.string().nullable(),
  submission_mechanism: z.string().nullable(),
  scope: z.string(),
  contract_term: z.string().nullable(),
  estimated_value: z.string().nullable(),
  evaluation_criteria: z.array(
    z.object({
      criterion: z.string(),
      weight: z.string().nullable(),
      source: sourceRefSchema,
    })
  ),
  mandatory_requirements: z.array(
    z.object({
      requirement: z.string(),
      category: z.string(),
      source: sourceRefSchema,
    })
  ),
  required_forms: z.array(z.object({ form: z.string(), source: sourceRefSchema })),
  required_attachments: z.array(z.object({ attachment: z.string(), source: sourceRefSchema })),
  page_limits: z.array(z.object({ section: z.string(), limit: z.string(), source: sourceRefSchema })),
  site_visits: z.string().nullable(),
  pricing_structure: z.string().nullable(),
});
export type ParsedSolicitation = z.infer<typeof parsedSolicitationSchema>;

export const eligibilityResultSchema = z.object({
  decision: z.enum(["ELIGIBLE", "CONDITIONALLY_ELIGIBLE", "INELIGIBLE"]),
  confidence: z.number().min(0).max(1),
  blocking_requirements: z.array(
    z.object({
      requirement: z.string(),
      source_page: z.number().int().nullable(),
      reason: z.string(),
    })
  ),
  conditional_requirements: z.array(
    z.object({
      requirement: z.string(),
      source_page: z.number().int().nullable(),
      customer_status: z.enum(["UNKNOWN", "LIKELY_MET", "NEEDS_DOCUMENT"]),
    })
  ),
  satisfied_requirements: z.array(
    z.object({
      requirement: z.string(),
      evidence_ids: z.array(z.string()),
    })
  ),
  rationale: z.string(),
});
export type EligibilityResult = z.infer<typeof eligibilityResultSchema>;

export const bidDecisionSchema = z.object({
  decision: z.enum([
    "PURSUE",
    "PURSUE_WITH_CONDITIONS",
    "PURSUE_WITH_PARTNER",
    "MONITOR",
    "DECLINE",
  ]),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  factor_scores: z.object({
    service_fit: z.number().min(0).max(100),
    past_performance_fit: z.number().min(0).max(100),
    contract_value_attractiveness: z.number().min(0).max(100),
    estimated_win_probability: z.number().min(0).max(100),
    proposal_effort: z.number().min(0).max(100),
    deadline_feasibility: z.number().min(0).max(100),
    competitive_intensity: z.number().min(0).max(100),
    strategic_value: z.number().min(0).max(100),
    delivery_capacity: z.number().min(0).max(100),
  }),
  rationale: z.string(),
});
export type BidDecision = z.infer<typeof bidDecisionSchema>;

export const complianceMatrixSchema = z.object({
  rows: z.array(
    z.object({
      requirement_code: z.string(),
      requirement_text: z.string(),
      source: sourceRefSchema,
      mandatory: z.boolean(),
      evaluation_weight: z.string().nullable(),
      planned_response_section: z.string(),
      evidence_needed: z.string(),
      evidence_status: z.enum(["AVAILABLE", "MISSING", "UNVERIFIED"]),
      risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
    })
  ),
});
export type ComplianceMatrix = z.infer<typeof complianceMatrixSchema>;

export const strategyResultSchema = z.object({
  buyer_priorities: z.array(z.string()),
  win_themes: z.array(z.string()),
  differentiators: z.array(z.string()),
  response_outline: z.array(z.object({ section: z.string(), purpose: z.string() })),
  evidence_plan: z.array(z.object({ claim_area: z.string(), evidence_ids: z.array(z.string()) })),
  staffing_approach: z.string(),
  delivery_approach: z.string(),
  risk_mitigation: z.array(z.string()),
  clarification_questions: z.array(z.string()),
  assumptions_requiring_confirmation: z.array(z.string()),
});
export type StrategyResult = z.infer<typeof strategyResultSchema>;

export const draftResultSchema = z.object({
  sections: z.array(
    z.object({
      section_name: z.string(),
      content_markdown: z
        .string()
        .describe(
          "Draft text. Material claims must cite evidence IDs inline as [EV:<id>]. Missing facts must use [CUSTOMER CONFIRMATION REQUIRED: <what>]."
        ),
    })
  ),
});
export type DraftResult = z.infer<typeof draftResultSchema>;

export const claimVerificationSchema = z.object({
  claims: z.array(
    z.object({
      section_name: z.string(),
      claim_text: z.string(),
      status: z.enum(["VERIFIED", "UNSUPPORTED", "CONTRADICTORY", "AMBIGUOUS"]),
      evidence_ids: z.array(z.string()),
      confidence: z.number().min(0).max(1),
      required_action: z.enum(["NONE", "REMOVE_OR_CONFIRM", "REVISE", "ESCALATE"]),
      proposed_correction: z.string().nullable(),
    })
  ),
});
export type ClaimVerification = z.infer<typeof claimVerificationSchema>;

export const complianceReviewSchema = z.object({
  result: z.enum(["PASS", "PASS_WITH_WARNINGS", "FAIL"]),
  confidence: z.number().min(0).max(1),
  checks: z.array(
    z.object({
      check: z.string(),
      status: z.enum(["PASS", "WARN", "FAIL"]),
      detail: z.string(),
    })
  ),
  unresolved_risks: z.array(z.string()),
});
export type ComplianceReview = z.infer<typeof complianceReviewSchema>;

export const companyProfileSchema = z.object({
  legal_name: z.string(),
  website: z.string().nullable(),
  service_categories: z.array(z.string()),
  industries: z.array(z.string()),
  naics_codes: z.array(z.string()),
  geographies: z.array(z.string()),
  contract_value_range: z.object({
    minimum: z.number().nullable(),
    maximum: z.number().nullable(),
  }),
  certifications: z.array(z.string()),
  licenses: z.array(z.string()),
  insurance: z.object({
    general_liability: z.string().nullable(),
    professional_liability: z.string().nullable(),
  }),
  bonding: z.string().nullable(),
  key_personnel: z.array(
    z.object({ name: z.string(), role: z.string(), summary: z.string() })
  ),
  past_performance: z.array(
    z.object({
      project_id: z.string(),
      customer_type: z.string(),
      scope: z.string(),
      evidence_document_ids: z.array(z.string()),
    })
  ),
  excluded_work: z.array(z.string()),
});
export type CompanyProfile = z.infer<typeof companyProfileSchema>;
