import Link from "next/link";
import type { Metadata } from "next";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProduct, formatPrice } from "@/lib/products";
import StatusBadge from "@/components/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireOrganization();
  const supabase = await createClient();

  const [{ data: jobs }, { data: profile }, { count: evidenceCount }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, product_type, status, price_paid_cents, created_at, delivered_at, solicitations(title, deadline)")
      .eq("organization_id", session.organizationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("company_profiles")
      .select("id, status, version")
      .eq("organization_id", session.organizationId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("evidence_items")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", session.organizationId)
      .eq("approved", true),
  ]);

  const allJobs = jobs ?? [];
  const activeJobs = allJobs.filter(
    (j) => !["DELIVERED", "COMPLETED", "OUTCOME_PENDING"].includes(j.status)
  );
  const needsAction = allJobs.filter((j) =>
    ["INTAKE_REQUIRED", "CUSTOMER_CLARIFICATION", "BID_DECISION_READY", "REVISION_REQUESTED"].includes(j.status)
  );
  const delivered = allJobs.filter((j) =>
    ["DELIVERED", "COMPLETED", "OUTCOME_PENDING"].includes(j.status)
  );

  const profileComplete = profile?.status === "APPROVED";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {session.organizationName}
        </h1>
        <Link
          href="/jobs/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New job
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active jobs", String(activeJobs.length)],
          ["Needs your action", String(needsAction.length)],
          ["Delivered packages", String(delivered.length)],
          ["Approved evidence items", String(evidenceCount ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {!profileComplete && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-amber-900">
              Your company profile is not approved yet
            </div>
            <p className="text-sm text-amber-800">
              Proposal drafts can only use evidence you have approved. Complete
              and approve your profile to unlock grounded drafting.
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Complete profile
          </Link>
        </div>
      )}

      <h2 className="mt-10 text-lg font-bold text-slate-900">Jobs</h2>
      {allJobs.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">
            No jobs yet. Upload a live solicitation to get a bid decision and
            compliant first draft.
          </p>
          <Link
            href="/jobs/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start your first job
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Solicitation</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allJobs.map((job) => {
                const sol = job.solicitations as unknown as { title: string | null } | null;
                return (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="font-medium text-blue-600 hover:underline">
                        {getProduct(job.product_type)?.name ?? job.product_type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {sol?.title ?? "Not uploaded yet"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatPrice(job.price_paid_cents)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
