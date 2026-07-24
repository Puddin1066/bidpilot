const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-blue-50 text-blue-700",
  INTAKE_REQUIRED: "bg-amber-50 text-amber-700",
  DOCUMENTS_UPLOADED: "bg-blue-50 text-blue-700",
  PARSING: "bg-blue-50 text-blue-700",
  ELIGIBILITY_REVIEW: "bg-blue-50 text-blue-700",
  CUSTOMER_CLARIFICATION: "bg-amber-50 text-amber-700",
  BID_DECISION_READY: "bg-purple-50 text-purple-700",
  COMPLIANCE_MAPPING: "bg-blue-50 text-blue-700",
  DRAFTING: "bg-blue-50 text-blue-700",
  QUALITY_REVIEW: "bg-blue-50 text-blue-700",
  HUMAN_EXCEPTION_REVIEW: "bg-red-50 text-red-700",
  READY_FOR_DELIVERY: "bg-emerald-50 text-emerald-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  REVISION_REQUESTED: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  OUTCOME_PENDING: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-50 text-red-700",
  PIPELINE_FAILED: "bg-red-50 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
