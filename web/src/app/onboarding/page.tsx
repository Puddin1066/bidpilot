import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Set up your organization" };

async function createOrganization(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const legalName = String(formData.get("legal_name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  if (!legalName) return;

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      owner_user_id: user.id,
      legal_name: legalName,
      website: website || null,
      industry: industry || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`Failed to create organization: ${error.message}`);

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });
  if (memberError) throw new Error(`Failed to add membership: ${memberError.message}`);

  redirect("/dashboard");
}

export default async function OnboardingPage() {
  const session = await requireSession();
  if (session.organizationId) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-bold text-slate-900 text-center">
        Tell us about your company
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        This creates your private workspace. You&apos;ll build the full company
        profile afterward.
      </p>
      <form action={createOrganization} className="mt-8 space-y-4 rounded-xl border border-slate-200 p-6">
        <div>
          <label htmlFor="legal_name" className="block text-sm font-medium text-slate-700">
            Legal business name
          </label>
          <input
            id="legal_name"
            name="legal_name"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700">
            Website (optional)
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
            Industry (optional)
          </label>
          <input
            id="industry"
            name="industry"
            placeholder="e.g. IT services, workforce training"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Create workspace
        </button>
      </form>
    </div>
  );
}
