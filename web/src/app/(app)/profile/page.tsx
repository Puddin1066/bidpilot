import type { Metadata } from "next";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CompanyProfile } from "@/lib/schemas/agents";
import { saveProfile, approveProfile, addEvidence, setEvidenceApproval } from "./actions";

export const metadata: Metadata = { title: "Company profile" };

const EVIDENCE_TYPES = [
  "PAST_PERFORMANCE",
  "CERTIFICATION",
  "PERSONNEL",
  "CAPABILITY",
  "INSURANCE",
  "OTHER",
];

function Field({
  label,
  name,
  defaultValue,
  hint,
  textarea,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          defaultValue={defaultValue}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      )}
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireOrganization();
  const supabase = await createClient();

  const [{ data: profileRow }, { data: evidence }] = await Promise.all([
    supabase
      .from("company_profiles")
      .select("id, status, approved_at, profile_json")
      .eq("organization_id", session.organizationId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("evidence_items")
      .select("id, evidence_type, content, source_page, approved, created_at")
      .eq("organization_id", session.organizationId)
      .order("created_at", { ascending: false }),
  ]);

  const p = (profileRow?.profile_json ?? null) as CompanyProfile | null;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Company profile</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            profileRow?.status === "APPROVED"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {profileRow?.status ?? "NOT STARTED"}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Everything BidPilot writes is grounded in this profile and your approved
        evidence. Saving changes returns the profile to DRAFT until you approve
        it again.
      </p>

      <form action={saveProfile} className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">1. Company basics</h2>
        <Field label="Legal name" name="legal_name" defaultValue={p?.legal_name ?? session.organizationName ?? ""} />
        <Field label="Website" name="website" defaultValue={p?.website ?? ""} />

        <h2 className="font-semibold text-slate-900 pt-2">2. Services and markets</h2>
        <Field
          label="Service categories"
          name="service_categories"
          hint="Comma or newline separated"
          textarea
          defaultValue={p?.service_categories?.join(", ") ?? ""}
        />
        <Field label="Industries" name="industries" hint="Comma separated" defaultValue={p?.industries?.join(", ") ?? ""} />
        <Field label="NAICS codes" name="naics_codes" hint="Comma separated" defaultValue={p?.naics_codes?.join(", ") ?? ""} />
        <Field label="Geographies served" name="geographies" hint="Comma separated" defaultValue={p?.geographies?.join(", ") ?? ""} />

        <h2 className="font-semibold text-slate-900 pt-2">3. Contract capacity</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Minimum contract value ($)" name="contract_min" type="number" defaultValue={p?.contract_value_range?.minimum?.toString() ?? ""} />
          <Field label="Maximum contract value ($)" name="contract_max" type="number" defaultValue={p?.contract_value_range?.maximum?.toString() ?? ""} />
        </div>

        <h2 className="font-semibold text-slate-900 pt-2">4. Qualifications</h2>
        <Field label="Certifications" name="certifications" hint="Comma separated (e.g. MBE, WBE, 8(a))" defaultValue={p?.certifications?.join(", ") ?? ""} />
        <Field label="Licenses" name="licenses" hint="Comma separated" defaultValue={p?.licenses?.join(", ") ?? ""} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="General liability insurance" name="general_liability" hint="e.g. $1,000,000 per occurrence" defaultValue={p?.insurance?.general_liability ?? ""} />
          <Field label="Professional liability insurance" name="professional_liability" defaultValue={p?.insurance?.professional_liability ?? ""} />
        </div>
        <Field label="Bonding capacity" name="bonding" defaultValue={p?.bonding ?? ""} />

        <h2 className="font-semibold text-slate-900 pt-2">5. Team and past performance</h2>
        <Field
          label="Key personnel"
          name="key_personnel"
          hint="One per line: Name | Role | Summary"
          textarea
          defaultValue={p?.key_personnel?.map((k) => `${k.name} | ${k.role} | ${k.summary}`).join("\n") ?? ""}
        />
        <Field
          label="Past performance"
          name="past_performance"
          hint="One per line: Customer type | Project scope"
          textarea
          defaultValue={p?.past_performance?.map((pp) => `${pp.customer_type} | ${pp.scope}`).join("\n") ?? ""}
        />
        <Field
          label="Excluded work"
          name="excluded_work"
          hint="Work you will not bid on, comma separated"
          defaultValue={p?.excluded_work?.join(", ") ?? ""}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save profile
          </button>
        </div>
      </form>

      {profileRow && profileRow.status !== "APPROVED" && (
        <form action={approveProfile} className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-900">
            Review the saved profile above. By approving it you confirm every
            fact is accurate and usable as proposal evidence.
          </p>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Approve profile
          </button>
        </form>
      )}

      {/* Evidence library */}
      <h2 className="mt-12 text-xl font-bold text-slate-900">Evidence library</h2>
      <p className="mt-1 text-sm text-slate-600">
        Individual facts BidPilot may cite in drafts. Only{" "}
        <strong>approved</strong> items are ever used. Unapproved evidence never
        enters proposal drafting.
      </p>

      <form action={addEvidence} className="mt-4 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700">
              Evidence statement
            </label>
            <textarea
              id="content"
              name="content"
              rows={2}
              required
              placeholder="e.g. Completed a 12-month IT training program for a county workforce board in 2025 with an 87% completion rate."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="evidence_type" className="block text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              id="evidence_type"
              name="evidence_type"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Add evidence
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {(evidence ?? []).map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {item.evidence_type.replaceAll("_", " ")}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    item.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.approved ? "APPROVED" : "PENDING APPROVAL"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.content}</p>
            </div>
            <form action={setEvidenceApproval}>
              <input type="hidden" name="evidence_id" value={item.id} />
              <input type="hidden" name="approved" value={item.approved ? "false" : "true"} />
              <button
                type="submit"
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  item.approved
                    ? "border border-slate-300 text-slate-600 hover:bg-slate-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {item.approved ? "Revoke approval" : "Approve"}
              </button>
            </form>
          </div>
        ))}
        {(evidence ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No evidence items yet.</p>
        )}
      </div>
    </div>
  );
}
