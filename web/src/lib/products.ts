/** Product catalog (spec section 4.1). Prices are integer cents. */

export type ProductType =
  | "OPPORTUNITY_MATCH"
  | "BID_NO_BID"
  | "READINESS_PACKAGE"
  | "COMPLETE_DRAFT"
  | "MONITORING";

export interface Product {
  type: ProductType;
  name: string;
  priceCents: number;
  recurring: boolean;
  tagline: string;
  targetDelivery: string;
  deliverables: string[];
  /** Whether the automated upload-to-deliverable pipeline runs for this product. */
  automated: boolean;
}

export const PRODUCTS: Product[] = [
  {
    type: "OPPORTUNITY_MATCH",
    name: "Opportunity Match",
    priceCents: 4900,
    recurring: false,
    tagline: "Five relevant opportunities matched to your company profile.",
    targetDelivery: "24 hours",
    deliverables: [
      "Five relevant opportunities",
      "Eligibility summary for each",
      "Fit score and deadline",
      "Estimated effort",
      "Recommended next action",
    ],
    automated: false,
  },
  {
    type: "BID_NO_BID",
    name: "Bid/No-Bid Report",
    priceCents: 14900,
    recurring: false,
    tagline: "Upload one solicitation, get a defensible go/no-go decision.",
    targetDelivery: "4 hours",
    deliverables: [
      "Eligibility decision with sources",
      "Strategic fit score",
      "Opportunity risks",
      "Estimated proposal effort",
      "Missing qualifications",
      "Bid/no-bid recommendation with plain-language rationale",
    ],
    automated: true,
  },
  {
    type: "READINESS_PACKAGE",
    name: "48-Hour RFP Readiness Package",
    priceCents: 34900,
    recurring: false,
    tagline: "Everything you need to decide and start responding, in 48 hours.",
    targetDelivery: "48 hours",
    deliverables: [
      "Bid/no-bid recommendation",
      "Full compliance matrix",
      "Missing-document checklist",
      "Proposal outline and response strategy",
      "Executive-summary draft",
      "Technical-response first draft",
      "Risk and clarification list",
    ],
    automated: true,
  },
  {
    type: "COMPLETE_DRAFT",
    name: "Complete First-Draft Package",
    priceCents: 99900,
    recurring: false,
    tagline: "A full evidence-grounded first draft with independent review.",
    targetDelivery: "3–5 business days",
    deliverables: [
      "All readiness-package components",
      "Full first draft",
      "Past-performance sections",
      "Management and staffing plans",
      "Attachment checklist",
      "Independent compliance review",
      "Submission packaging instructions",
    ],
    automated: true,
  },
  {
    type: "MONITORING",
    name: "Monitoring",
    priceCents: 9900,
    recurring: true,
    tagline: "Weekly opportunity matching and deadline alerts.",
    targetDelivery: "Weekly",
    deliverables: [
      "Weekly opportunity matching",
      "Deadline alerts",
      "Bid/no-bid recommendations",
      "Saved company knowledge base",
      "Discounted proposal packages",
    ],
    automated: false,
  },
];

export function getProduct(type: string): Product | undefined {
  return PRODUCTS.find((p) => p.type === type);
}

/** First-5 RI founding offer — used when checkout?promo=founding */
export const FOUNDING_PROMO_CODE = "founding";
export const FOUNDING_READINESS_PRICE_CENTS = 19900;

export function resolveCheckoutPriceCents(
  product: Product,
  promo: string | null | undefined
): { priceCents: number; isFounding: boolean } {
  if (
    promo === FOUNDING_PROMO_CODE &&
    product.type === "READINESS_PACKAGE"
  ) {
    return { priceCents: FOUNDING_READINESS_PRICE_CENTS, isFounding: true };
  }
  return { priceCents: product.priceCents, isFounding: false };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })}`;
}
