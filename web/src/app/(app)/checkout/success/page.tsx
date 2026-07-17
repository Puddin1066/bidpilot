import Link from "next/link";
import type { Metadata } from "next";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Payment received" };

export default async function CheckoutSuccessPage() {
  const session = await requireOrganization();
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("organization_id", session.organizationId)
    .eq("status", "INTAKE_REQUIRED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Payment received</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your job has been created. Next, upload the live solicitation so the
        analysis can begin.
      </p>
      <Link
        href={job ? `/jobs/${job.id}` : "/dashboard"}
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
      >
        {job ? "Upload solicitation" : "Go to dashboard"}
      </Link>
      <p className="mt-4 text-xs text-slate-500">
        If your job doesn&apos;t appear yet, the payment confirmation may still be
        processing — refresh the dashboard in a few seconds.
      </p>
    </div>
  );
}
