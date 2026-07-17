import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, isMockAiMode, isMockPaymentMode } from "@/lib/env";
import { reclassifyRevenue, addExpense, saveEntrant } from "./actions";

export const metadata: Metadata = { title: "XPRIZE readiness" };

const SUBMISSION_DEADLINE = new Date("2026-08-17T20:00:00Z"); // 1:00 PM PT

const EXPENSE_CATEGORIES = [
  "AI_API",
  "CLOUD_HOSTING",
  "CONTRACTOR",
  "MARKETING",
  "CUSTOMER_ACQUISITION",
  "PAYMENT_PROCESSING",
  "SOFTWARE",
  "OTHER",
];

const EXPORTS = [
  ["revenue-by-month", "xprize-revenue-by-month.csv"],
  ["related-party-revenue", "xprize-related-party-revenue.csv"],
  ["expenses", "xprize-expenses.csv"],
  ["marketing-spend", "xprize-marketing-spend.csv"],
  ["user-evidence", "xprize-user-evidence.csv"],
  ["agent-execution-summary", "xprize-agent-execution-summary.csv"],
];

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function XprizeReadinessPage() {
  await requireAdmin();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        The XPRIZE readiness dashboard requires <code>SUPABASE_SERVICE_ROLE_KEY</code>{" "}
        to read compliance tables. Add it to the server environment and reload.
      </div>
    );
  }
  const admin = createAdminClient();

  const [
    { data: revenue },
    { data: expenses },
    { data: entrant },
    { count: geminiCalls },
    { count: mockedCalls },
    { count: orgCount },
    { count: jobCount },
    { count: userEvidenceCount },
    { count: judgeCount },
  ] = await Promise.all([
    admin.from("revenue_transactions").select("*").order("created_at", { ascending: false }),
    admin.from("expense_transactions").select("*").order("expense_date", { ascending: false }),
    admin.from("competition_entrants").select("*").limit(1).maybeSingle(),
    admin.from("agent_runs").select("id", { count: "exact", head: true }).eq("is_mocked", false),
    admin.from("agent_runs").select("id", { count: "exact", head: true }).eq("is_mocked", true),
    admin.from("organizations").select("id", { count: "exact", head: true }).eq("is_demo", false),
    admin.from("jobs").select("id", { count: "exact", head: true }),
    admin.from("user_evidence").select("id", { count: "exact", head: true }),
    admin.from("judge_accounts").select("id", { count: "exact", head: true }),
  ]);

  const daysLeft = Math.max(
    0,
    Math.ceil((SUBMISSION_DEADLINE.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const months = ["2026-05", "2026-06", "2026-07", "2026-08"];
  const revenueByMonth = months.map((m) => {
    const rows = (revenue ?? []).filter((r) => String(r.recognized_month).startsWith(m));
    return {
      month: m,
      armsLength: rows
        .filter((r) => r.revenue_type === "ARMS_LENGTH")
        .reduce((sum, r) => sum + r.amount_cents - r.refunded_amount_cents, 0),
      relatedParty: rows
        .filter((r) => r.revenue_type !== "ARMS_LENGTH")
        .reduce((sum, r) => sum + r.amount_cents - r.refunded_amount_cents, 0),
    };
  });

  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount_cents, 0);
  const marketingSpend = (expenses ?? [])
    .filter((e) => ["MARKETING", "CUSTOMER_ACQUISITION"].includes(e.expense_category))
    .reduce((sum, e) => sum + e.amount_cents, 0);

  const checklist: Array<[string, boolean, string]> = [
    ["Application deployed and functional", true, "This app"],
    ["Gemini API in deployed workflow", !isMockAiMode(), isMockAiMode() ? "GEMINI_API_KEY missing — running in MOCK AI MODE" : `${geminiCalls ?? 0} production calls logged`],
    ["Real payments configured", !isMockPaymentMode(), isMockPaymentMode() ? "STRIPE_SECRET_KEY missing — MOCK PAYMENT MODE" : "Stripe live"],
    ["Entrant record complete", Boolean(entrant?.representative_name && entrant?.authorization_confirmed), entrant ? "Saved below" : "Fill in the entrant form below"],
    ["At least one arms-length payment", (revenue ?? []).some((r) => r.revenue_type === "ARMS_LENGTH" && r.amount_cents > 0), ""],
    ["Expenses recorded (including $0 marketing)", (expenses ?? []).length > 0, ""],
    ["User evidence records", (userEvidenceCount ?? 0) > 0, `${userEvidenceCount ?? 0} records`],
    ["Judge account provisioned", (judgeCount ?? 0) > 0, `${judgeCount ?? 0} judge accounts`],
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">XPRIZE readiness</h1>
        <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {daysLeft} days to submission deadline
        </div>
      </div>

      {/* Checklist */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Stage One checklist</h2>
        <ul className="mt-4 space-y-2">
          {checklist.map(([label, ok, detail]) => (
            <li key={label} className="flex items-start gap-3 text-sm">
              <span className={ok ? "text-emerald-600" : "text-red-600"}>{ok ? "✓" : "✗"}</span>
              <span className="text-slate-900">{label}</span>
              {detail && <span className="text-slate-500 text-xs">{detail}</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Key numbers */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Gemini production calls", String(geminiCalls ?? 0)],
          ["Mocked agent runs", String(mockedCalls ?? 0)],
          ["Organizations (non-demo)", String(orgCount ?? 0)],
          ["Total jobs", String(jobCount ?? 0)],
          ["Total expenses", dollars(totalExpenses)],
          ["Marketing spend", dollars(marketingSpend)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      {/* Revenue by month */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Revenue by month (net of refunds)</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Month</th>
              <th className="px-3 py-2 font-medium">Arms-length</th>
              <th className="px-3 py-2 font-medium">Related-party / pre-existing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {revenueByMonth.map((r) => (
              <tr key={r.month}>
                <td className="px-3 py-2 font-medium text-slate-900">{r.month}</td>
                <td className="px-3 py-2">{dollars(r.armsLength)}</td>
                <td className="px-3 py-2">{dollars(r.relatedParty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(revenue ?? []).length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-slate-900">Transactions</h3>
            <div className="mt-2 space-y-2">
              {(revenue ?? []).map((r) => (
                <form
                  key={r.id}
                  action={reclassifyRevenue}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-3 text-xs"
                >
                  <input type="hidden" name="transaction_id" value={r.id} />
                  <span className="font-mono">{String(r.recognized_month).slice(0, 7)}</span>
                  <span className="font-semibold">{dollars(r.amount_cents)}</span>
                  <span className="text-slate-500">{r.stripe_payment_id}</span>
                  <select
                    name="revenue_type"
                    defaultValue={r.revenue_type}
                    className="rounded border border-slate-300 px-2 py-1"
                  >
                    <option value="ARMS_LENGTH">ARMS_LENGTH</option>
                    <option value="RELATED_PARTY">RELATED_PARTY</option>
                    <option value="PRE_EXISTING_CUSTOMER">PRE_EXISTING_CUSTOMER</option>
                  </select>
                  <input
                    name="note"
                    defaultValue={r.customer_relationship_note ?? ""}
                    placeholder="Relationship note"
                    className="flex-1 min-w-[160px] rounded border border-slate-300 px-2 py-1"
                  />
                  <button type="submit" className="rounded bg-slate-900 px-3 py-1 font-semibold text-white">
                    Save
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Expenses */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Expenses</h2>
        <form action={addExpense} className="mt-4 grid gap-2 sm:grid-cols-6 text-sm">
          <input name="expense_date" type="date" required className="rounded border border-slate-300 px-2 py-1.5" />
          <select name="expense_category" className="rounded border border-slate-300 px-2 py-1.5">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="vendor" placeholder="Vendor" className="rounded border border-slate-300 px-2 py-1.5" />
          <input name="description" required placeholder="Description" className="rounded border border-slate-300 px-2 py-1.5 sm:col-span-2" />
          <div className="flex gap-2">
            <input name="amount" type="number" step="0.01" required placeholder="$" className="w-full rounded border border-slate-300 px-2 py-1.5" />
            <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 font-semibold text-white">
              Add
            </button>
          </div>
        </form>
        <div className="mt-4 space-y-1 text-sm">
          {(expenses ?? []).map((e) => (
            <div key={e.id} className="flex flex-wrap gap-3 border-b border-slate-100 py-1.5 text-slate-700">
              <span className="font-mono text-xs text-slate-500">{e.expense_date}</span>
              <span className="rounded bg-slate-100 px-1.5 text-xs">{e.expense_category}</span>
              <span className="flex-1">{e.description}</span>
              <span className="font-semibold">{dollars(e.amount_cents)}</span>
            </div>
          ))}
          {(expenses ?? []).length === 0 && (
            <p className="text-slate-500">
              No expenses yet. Record all costs — including $0 marketing spend if
              applicable — before submission.
            </p>
          )}
        </div>
      </section>

      {/* Entrant */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Competition entrant record</h2>
        <form action={saveEntrant} className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <select
            name="entrant_type"
            defaultValue={entrant?.entrant_type ?? "INDIVIDUAL"}
            className="rounded border border-slate-300 px-2 py-1.5"
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="TEAM">Team</option>
            <option value="ORGANIZATION">Organization (&lt;25 employees)</option>
          </select>
          <input
            name="representative_name"
            required
            defaultValue={entrant?.representative_name ?? ""}
            placeholder="Representative name"
            className="rounded border border-slate-300 px-2 py-1.5"
          />
          <input
            name="organization_legal_name"
            defaultValue={entrant?.organization_legal_name ?? ""}
            placeholder="Organization legal name (if applicable)"
            className="rounded border border-slate-300 px-2 py-1.5"
          />
          <input
            name="employee_count"
            type="number"
            defaultValue={entrant?.employee_count ?? ""}
            placeholder="Employee count"
            className="rounded border border-slate-300 px-2 py-1.5"
          />
          <input
            name="corporate_id"
            defaultValue={entrant?.corporate_id ?? ""}
            placeholder="Corporate ID (if applicable)"
            className="rounded border border-slate-300 px-2 py-1.5"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="authorization_confirmed"
              defaultChecked={entrant?.authorization_confirmed ?? false}
            />
            Representative authorization documented
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            Save entrant record
          </button>
        </form>
      </section>

      {/* Exports */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">One-click evidence exports</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {EXPORTS.map(([slug, filename]) => (
            <a
              key={slug}
              href={`/api/admin/exports/${slug}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              {filename}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
