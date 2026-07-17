"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { companyProfileSchema, type CompanyProfile } from "@/lib/schemas/agents";

function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveProfile(formData: FormData): Promise<void> {
  const session = await requireOrganization();
  const supabase = await createClient();

  const profile: CompanyProfile = companyProfileSchema.parse({
    legal_name: String(formData.get("legal_name") ?? ""),
    website: String(formData.get("website") ?? "") || null,
    service_categories: csv(formData.get("service_categories")),
    industries: csv(formData.get("industries")),
    naics_codes: csv(formData.get("naics_codes")),
    geographies: csv(formData.get("geographies")),
    contract_value_range: {
      minimum: formData.get("contract_min") ? Number(formData.get("contract_min")) : null,
      maximum: formData.get("contract_max") ? Number(formData.get("contract_max")) : null,
    },
    certifications: csv(formData.get("certifications")),
    licenses: csv(formData.get("licenses")),
    insurance: {
      general_liability: String(formData.get("general_liability") ?? "") || null,
      professional_liability: String(formData.get("professional_liability") ?? "") || null,
    },
    bonding: String(formData.get("bonding") ?? "") || null,
    key_personnel: csv(formData.get("key_personnel")).map((line) => {
      const [name = "", role = "", ...rest] = line.split("|").map((s) => s.trim());
      return { name, role, summary: rest.join(" ") };
    }),
    past_performance: csv(formData.get("past_performance")).map((line, i) => ({
      project_id: `PP-${String(i + 1).padStart(3, "0")}`,
      customer_type: line.split("|")[0]?.trim() ?? "unspecified",
      scope: line.split("|")[1]?.trim() ?? line,
      evidence_document_ids: [],
    })),
    excluded_work: csv(formData.get("excluded_work")),
  });

  const { data: existing } = await supabase
    .from("company_profiles")
    .select("id, version")
    .eq("organization_id", session.organizationId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("company_profiles")
      .update({ profile_json: profile, status: "DRAFT", approved_at: null })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("company_profiles").insert({
      organization_id: session.organizationId,
      version: 1,
      profile_json: profile,
      status: "DRAFT",
    });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/profile");
}

export async function approveProfile(): Promise<void> {
  const session = await requireOrganization();
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_profiles")
    .update({ status: "APPROVED", approved_at: new Date().toISOString() })
    .eq("organization_id", session.organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function addEvidence(formData: FormData): Promise<void> {
  const session = await requireOrganization();
  const supabase = await createClient();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  const { error } = await supabase.from("evidence_items").insert({
    organization_id: session.organizationId,
    evidence_type: String(formData.get("evidence_type") ?? "OTHER"),
    content,
    source_page: formData.get("source_page") ? Number(formData.get("source_page")) : null,
    approved: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function setEvidenceApproval(formData: FormData): Promise<void> {
  const session = await requireOrganization();
  const supabase = await createClient();
  const { error } = await supabase
    .from("evidence_items")
    .update({ approved: formData.get("approved") === "true" })
    .eq("id", String(formData.get("evidence_id")))
    .eq("organization_id", session.organizationId);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}
