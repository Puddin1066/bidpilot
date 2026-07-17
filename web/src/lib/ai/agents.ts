import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { callAgent, type AgentCallResult } from "@/lib/ai/gemini";
import {
  parsedSolicitationSchema,
  eligibilityResultSchema,
  bidDecisionSchema,
  complianceMatrixSchema,
  strategyResultSchema,
  draftResultSchema,
  claimVerificationSchema,
  complianceReviewSchema,
  type ParsedSolicitation,
  type EligibilityResult,
  type BidDecision,
  type ComplianceMatrix,
  type StrategyResult,
  type DraftResult,
  type ClaimVerification,
  type ComplianceReview,
  type CompanyProfile,
} from "@/lib/schemas/agents";
import {
  mockParsedSolicitation,
  mockEligibility,
  mockBidDecision,
  mockComplianceMatrix,
  mockStrategy,
  mockDraft,
  mockClaimVerification,
  mockComplianceReview,
} from "@/lib/ai/mocks";

const PROMPT_VERSION = "v1.0";

const GROUNDING_RULES = `Ground every statement in the provided materials.
Never invent customers, results, credentials, staff, prices, or certifications.
Never assume an unknown qualification is satisfied.
Cite page-level provenance for every extracted item when available.`;

export interface EvidenceInput {
  id: string;
  evidence_type: string;
  content: string;
  source_page: number | null;
}

function evidenceBlock(evidence: EvidenceInput[]): string {
  if (evidence.length === 0) return "No approved evidence items exist yet.";
  return evidence
    .map(
      (e) =>
        `[EV:${e.id}] (${e.evidence_type}${e.source_page ? `, p.${e.source_page}` : ""}) ${e.content}`
    )
    .join("\n");
}

export function runSolicitationParser(
  supabase: SupabaseClient,
  jobId: string,
  solicitationText: string,
  fileParts?: Array<{ mimeType: string; dataBase64: string }>
): Promise<AgentCallResult<ParsedSolicitation>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "solicitation_parser",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Solicitation Parser Agent. Extract the structure of a government/institutional solicitation into strict JSON. ${GROUNDING_RULES} If a field is not stated, use null; do not guess.`,
    userPrompt: solicitationText
      ? `Extract all fields from this solicitation:\n\n${solicitationText}`
      : "Extract all fields from the attached solicitation document(s).",
    fileParts,
    schema: parsedSolicitationSchema,
    responseJsonSchema: z.toJSONSchema(parsedSolicitationSchema),
    mockOutput: mockParsedSolicitation,
    temperature: 0.1,
  });
}

export function runEligibilityAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  profile: CompanyProfile | null,
  evidence: EvidenceInput[]
): Promise<AgentCallResult<EligibilityResult>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "eligibility",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Eligibility Agent. Compare mandatory solicitation requirements against the approved company profile and evidence. ${GROUNDING_RULES} A requirement with no supporting evidence must be marked conditional (customer_status UNKNOWN or NEEDS_DOCUMENT), never satisfied.`,
    userPrompt: `MANDATORY REQUIREMENTS:\n${JSON.stringify(parsed.mandatory_requirements, null, 2)}\n\nCOMPANY PROFILE:\n${JSON.stringify(profile ?? "No approved profile", null, 2)}\n\nAPPROVED EVIDENCE:\n${evidenceBlock(evidence)}`,
    schema: eligibilityResultSchema,
    responseJsonSchema: z.toJSONSchema(eligibilityResultSchema),
    mockOutput: mockEligibility,
    temperature: 0.1,
  });
}

export function runBidDecisionAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  eligibility: EligibilityResult,
  profile: CompanyProfile | null
): Promise<AgentCallResult<BidDecision>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "bid_no_bid",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Bid/No-Bid Agent. Score the opportunity on each factor (0-100) and recommend PURSUE, PURSUE_WITH_CONDITIONS, PURSUE_WITH_PARTNER, MONITOR, or DECLINE. Weights: service fit 20%, past performance 15%, contract value 15%, win probability 15%, effort 10%, deadline 10%, competition 5%, strategic value 5%, capacity 5%. Mandatory eligibility failure is a gate that forces DECLINE. The score is decision support, not a calibrated probability of award — say so in the rationale. ${GROUNDING_RULES}`,
    userPrompt: `SOLICITATION SUMMARY:\n${JSON.stringify({ title: parsed.title, buyer: parsed.buyer, scope: parsed.scope, deadline: parsed.deadline, estimated_value: parsed.estimated_value, evaluation_criteria: parsed.evaluation_criteria }, null, 2)}\n\nELIGIBILITY RESULT:\n${JSON.stringify(eligibility, null, 2)}\n\nCOMPANY PROFILE:\n${JSON.stringify(profile ?? "No approved profile", null, 2)}`,
    schema: bidDecisionSchema,
    responseJsonSchema: z.toJSONSchema(bidDecisionSchema),
    mockOutput: mockBidDecision,
  });
}

export function runComplianceMatrixAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  evidence: EvidenceInput[]
): Promise<AgentCallResult<ComplianceMatrix>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "compliance_matrix",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Compliance Matrix Agent. Build a complete requirements matrix from the parsed solicitation. Every row needs exact source provenance. evidence_status is AVAILABLE only when an approved evidence item clearly supports the requirement; otherwise MISSING or UNVERIFIED. ${GROUNDING_RULES}`,
    userPrompt: `PARSED SOLICITATION:\n${JSON.stringify(parsed, null, 2)}\n\nAPPROVED EVIDENCE:\n${evidenceBlock(evidence)}`,
    schema: complianceMatrixSchema,
    responseJsonSchema: z.toJSONSchema(complianceMatrixSchema),
    mockOutput: mockComplianceMatrix,
    temperature: 0.1,
  });
}

export function runStrategyAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  matrix: ComplianceMatrix,
  profile: CompanyProfile | null,
  evidence: EvidenceInput[]
): Promise<AgentCallResult<StrategyResult>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "strategy",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Strategy Agent. Design the response approach. Label verified facts with evidence IDs like [EV:id]; list all assumptions requiring customer confirmation. ${GROUNDING_RULES}`,
    userPrompt: `PARSED SOLICITATION:\n${JSON.stringify(parsed, null, 2)}\n\nCOMPLIANCE MATRIX:\n${JSON.stringify(matrix, null, 2)}\n\nCOMPANY PROFILE:\n${JSON.stringify(profile ?? "No approved profile", null, 2)}\n\nAPPROVED EVIDENCE:\n${evidenceBlock(evidence)}`,
    schema: strategyResultSchema,
    responseJsonSchema: z.toJSONSchema(strategyResultSchema),
    mockOutput: mockStrategy,
  });
}

export function runDraftingAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  strategy: StrategyResult,
  evidence: EvidenceInput[]
): Promise<AgentCallResult<DraftResult>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "drafting",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Drafting Agent. Write the first-draft proposal sections following the strategy outline and the solicitation's required structure. Rules:
- Use ONLY the approved evidence provided. Cite evidence inline as [EV:id] on every material claim.
- Insert [CUSTOMER CONFIRMATION REQUIRED: <what>] wherever a needed fact is missing.
- Observe page and word limits. Preserve buyer terminology. No promotional filler.
- Distinguish commitments from capabilities.
${GROUNDING_RULES}`,
    userPrompt: `SOLICITATION:\n${JSON.stringify({ title: parsed.title, buyer: parsed.buyer, scope: parsed.scope, evaluation_criteria: parsed.evaluation_criteria, page_limits: parsed.page_limits }, null, 2)}\n\nSTRATEGY:\n${JSON.stringify(strategy, null, 2)}\n\nAPPROVED EVIDENCE:\n${evidenceBlock(evidence)}`,
    schema: draftResultSchema,
    responseJsonSchema: z.toJSONSchema(draftResultSchema),
    mockOutput: mockDraft,
    temperature: 0.4,
  });
}

export function runClaimVerificationAgent(
  supabase: SupabaseClient,
  jobId: string,
  draft: DraftResult,
  evidence: EvidenceInput[]
): Promise<AgentCallResult<ClaimVerification>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "claim_verification",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Claim Verification Agent, independent from the Drafting Agent. Split each draft section into material factual claims and verify each against the approved evidence. Mark VERIFIED, UNSUPPORTED, CONTRADICTORY, or AMBIGUOUS. Remove nothing; flag defects and propose corrections. ${GROUNDING_RULES}`,
    userPrompt: `DRAFT SECTIONS:\n${JSON.stringify(draft, null, 2)}\n\nAPPROVED EVIDENCE:\n${evidenceBlock(evidence)}`,
    schema: claimVerificationSchema,
    responseJsonSchema: z.toJSONSchema(claimVerificationSchema),
    mockOutput: mockClaimVerification,
    temperature: 0.1,
  });
}

export function runComplianceReviewAgent(
  supabase: SupabaseClient,
  jobId: string,
  parsed: ParsedSolicitation,
  matrix: ComplianceMatrix,
  draft: DraftResult,
  verification: ClaimVerification
): Promise<AgentCallResult<ComplianceReview>> {
  return callAgent({
    supabase,
    jobId,
    agentName: "compliance_review",
    promptVersion: PROMPT_VERSION,
    systemInstruction: `You are the BidPilot Compliance Review Agent, independent from drafting. Audit the package: every mandatory requirement answered, correct order, forms included, page limits, buyer name, solicitation number, dates, unsupported claims, contradictions, missing confirmations. Signatures, certifications, and pricing always require human approval — flag them. Return PASS, PASS_WITH_WARNINGS, or FAIL with an unresolved-risk list. ${GROUNDING_RULES}`,
    userPrompt: `PARSED SOLICITATION:\n${JSON.stringify(parsed, null, 2)}\n\nCOMPLIANCE MATRIX:\n${JSON.stringify(matrix, null, 2)}\n\nDRAFT:\n${JSON.stringify(draft, null, 2)}\n\nCLAIM VERIFICATION:\n${JSON.stringify(verification, null, 2)}`,
    schema: complianceReviewSchema,
    responseJsonSchema: z.toJSONSchema(complianceReviewSchema),
    mockOutput: mockComplianceReview,
    temperature: 0.1,
  });
}
