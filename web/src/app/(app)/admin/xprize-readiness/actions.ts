"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reclassifyRevenue(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("revenue_transactions")
    .update({
      revenue_type: String(formData.get("revenue_type")),
      customer_relationship_note: String(formData.get("note") ?? "") || null,
    })
    .eq("id", String(formData.get("transaction_id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/xprize-readiness");
}

export async function addExpense(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const amount = Math.round(parseFloat(String(formData.get("amount") ?? "0")) * 100);
  const { error } = await admin.from("expense_transactions").insert({
    expense_date: String(formData.get("expense_date")),
    expense_category: String(formData.get("expense_category")),
    vendor: String(formData.get("vendor") ?? "") || null,
    description: String(formData.get("description")),
    amount_cents: Number.isFinite(amount) ? amount : 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/xprize-readiness");
}

export async function saveEntrant(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("competition_entrants")
    .select("id")
    .limit(1)
    .maybeSingle();
  const record = {
    entrant_type: String(formData.get("entrant_type")),
    representative_name: String(formData.get("representative_name")),
    organization_legal_name: String(formData.get("organization_legal_name") ?? "") || null,
    employee_count: formData.get("employee_count")
      ? Number(formData.get("employee_count"))
      : null,
    corporate_id: String(formData.get("corporate_id") ?? "") || null,
    authorization_confirmed: formData.get("authorization_confirmed") === "on",
  };
  const { error } = existing
    ? await admin.from("competition_entrants").update(record).eq("id", existing.id)
    : await admin.from("competition_entrants").insert(record);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/xprize-readiness");
}
