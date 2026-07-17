import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const cell = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return [
    columns.join(","),
    ...rows.map((r) => columns.map((c) => cell(r[c])).join(",")),
  ].join("\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || (user.app_metadata?.role as string | undefined) !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const admin = createAdminClient();
  let csv = "";
  let filename = `xprize-${slug}.csv`;

  switch (slug) {
    case "revenue-by-month": {
      const { data } = await admin
        .from("revenue_transactions")
        .select("recognized_month, revenue_type, amount_cents, refunded_amount_cents, currency, stripe_payment_id, customer_relationship_note")
        .order("recognized_month");
      csv = toCsv(data ?? [], [
        "recognized_month",
        "revenue_type",
        "amount_cents",
        "refunded_amount_cents",
        "currency",
        "stripe_payment_id",
        "customer_relationship_note",
      ]);
      break;
    }
    case "related-party-revenue": {
      const { data } = await admin
        .from("revenue_transactions")
        .select("recognized_month, revenue_type, amount_cents, refunded_amount_cents, stripe_payment_id, customer_relationship_note")
        .neq("revenue_type", "ARMS_LENGTH")
        .order("recognized_month");
      csv = toCsv(data ?? [], [
        "recognized_month",
        "revenue_type",
        "amount_cents",
        "refunded_amount_cents",
        "stripe_payment_id",
        "customer_relationship_note",
      ]);
      break;
    }
    case "expenses": {
      const { data } = await admin
        .from("expense_transactions")
        .select("expense_date, expense_category, vendor, description, amount_cents")
        .order("expense_date");
      csv = toCsv(data ?? [], [
        "expense_date",
        "expense_category",
        "vendor",
        "description",
        "amount_cents",
      ]);
      break;
    }
    case "marketing-spend": {
      const { data } = await admin
        .from("expense_transactions")
        .select("expense_date, expense_category, vendor, description, amount_cents")
        .in("expense_category", ["MARKETING", "CUSTOMER_ACQUISITION"])
        .order("expense_date");
      csv = toCsv(data ?? [], [
        "expense_date",
        "expense_category",
        "vendor",
        "description",
        "amount_cents",
      ]);
      break;
    }
    case "user-evidence": {
      // Excludes restricted verification contact fields (privileged access only).
      const { data } = await admin
        .from("user_evidence")
        .select("user_classification, is_real_user, is_paying_customer, feedback_text, testimonial_text, sharing_permission, created_at");
      csv = toCsv(data ?? [], [
        "user_classification",
        "is_real_user",
        "is_paying_customer",
        "feedback_text",
        "testimonial_text",
        "sharing_permission",
        "created_at",
      ]);
      break;
    }
    case "agent-execution-summary": {
      const { data } = await admin
        .from("agent_runs")
        .select("created_at, agent_name, model_name, prompt_version, status, is_mocked, confidence, token_input, token_output, estimated_cost_cents, duration_ms, gemini_response_id")
        .order("created_at");
      csv = toCsv(data ?? [], [
        "created_at",
        "agent_name",
        "model_name",
        "prompt_version",
        "status",
        "is_mocked",
        "confidence",
        "token_input",
        "token_output",
        "estimated_cost_cents",
        "duration_ms",
        "gemini_response_id",
      ]);
      filename = "xprize-agent-execution-summary.csv";
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown export" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
