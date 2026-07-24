/**
 * Seed the XPRIZE judge account + synthetic demo organization.
 *
 * Creates (idempotent on judge email):
 *   - auth user (password printed once / from JUDGE_PASSWORD)
 *   - demo organization (is_demo=true) with role=judge
 *   - approved fictional company profile
 *   - approved evidence items (grounding library)
 *   - judge_accounts row (expires 2026-09-30)
 *
 * Usage (from web/):
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run seed:judge
 *
 * Or with web/.env.local loaded:
 *   npm run seed:judge
 *
 * MOCK PAYMENT MODE is intentional for judges — they never produce arms-length
 * revenue. Do not put this account's purchases in competition revenue.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

const JUDGE_EMAIL = process.env.JUDGE_EMAIL ?? "judge@bidpilot.demo";
const JUDGE_NAME = "XPRIZE Judge";
const EXPIRES_AT = "2026-09-30T23:59:59.000Z";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy the service-role key from Supabase → Project Settings → API into web/.env.local, then re-run."
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const demoProfile = {
  legal_name: "Harbor Path Training LLC (fictional)",
  website: "https://example.com/harbor-path-demo",
  service_categories: ["Workforce training", "Adult education", "IT skills"],
  industries: ["Education services", "Workforce development"],
  naics_codes: ["611430", "611519"],
  geographies: ["Rhode Island", "Massachusetts"],
  contract_value_range: { minimum: 25000, maximum: 250000 },
  certifications: ["State vendor registration (synthetic)"],
  licenses: [],
  insurance: {
    general_liability: "$2,000,000 per occurrence (synthetic certificate on file)",
    professional_liability: "$1,000,000 per occurrence (synthetic certificate on file)",
  },
  bonding: null,
  key_personnel: [
    {
      name: "Alex Rivera (fictional)",
      role: "Program Director",
      summary: "12 years designing adult IT and healthcare-support training cohorts.",
    },
    {
      name: "Jordan Lee (fictional)",
      role: "Lead Instructor",
      summary: "Former community-college instructor; CompTIA-aligned curriculum author.",
    },
  ],
  past_performance: [
    {
      project_id: "PP-001",
      customer_type: "Regional workforce board (fictional)",
      scope: "Delivered 4 IT fundamentals cohorts (96 learners) with 78% job-placement within 90 days.",
      evidence_document_ids: [],
    },
    {
      project_id: "PP-002",
      customer_type: "Community college partnership (fictional)",
      scope: "Healthcare support training for 60 adult learners; completed on schedule within budget.",
      evidence_document_ids: [],
    },
  ],
  excluded_work: ["Construction", "Armed security"],
};

const evidenceItems = [
  {
    evidence_type: "INSURANCE",
    content:
      "Synthetic certificate of insurance: professional liability $1,000,000 per occurrence; general liability $2,000,000. Carrier: Demo Mutual (fictional). Policy period 2026-01-01 to 2026-12-31.",
  },
  {
    evidence_type: "PAST_PERFORMANCE",
    content:
      "PP-001: Harbor Path Training delivered four 12-week IT fundamentals cohorts for a regional workforce board (fictional), enrolling 96 adult learners with a documented 78% employment placement within 90 days of completion.",
  },
  {
    evidence_type: "PAST_PERFORMANCE",
    content:
      "PP-002: Partnership with a community college (fictional) to deliver healthcare-support occupational training for 60 learners; completed on time and within the contracted fixed price.",
  },
  {
    evidence_type: "CERTIFICATION",
    content:
      "Active state vendor registration number SYN-VENDOR-2026-014 (fictional demo credential for judge testing only).",
  },
  {
    evidence_type: "CAPABILITY",
    content:
      "Capability: curriculum design and delivery for adult learners in information technology and healthcare support occupations across multi-county service areas.",
  },
];

async function findUserIdByEmail(email: string): Promise<string | null> {
  // Paginate lightly; judge seed projects are small.
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

async function main() {
  const password =
    process.env.JUDGE_PASSWORD && process.env.JUDGE_PASSWORD.length >= 12
      ? process.env.JUDGE_PASSWORD
      : `BidPilot-Judge-${randomBytes(6).toString("hex")}!`;

  let userId = await findUserIdByEmail(JUDGE_EMAIL);
  let created = false;

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: JUDGE_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { full_name: JUDGE_NAME },
    });
    if (error) throw error;
    userId = data.user.id;
    created = true;
  } else if (process.env.JUDGE_PASSWORD) {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
  }

  // Ensure public.users row exists (trigger usually handles this).
  await admin.from("users").upsert({
    id: userId,
    email: JUDGE_EMAIL,
    full_name: JUDGE_NAME,
  });

  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("is_demo", true)
    .maybeSingle();

  let orgId = existingOrg?.id as string | undefined;
  if (!orgId) {
    const { data: org, error } = await admin
      .from("organizations")
      .insert({
        owner_user_id: userId,
        legal_name: demoProfile.legal_name,
        website: demoProfile.website,
        industry: "Workforce training (demo)",
        is_demo: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    orgId = org.id;
  }

  await admin.from("organization_members").upsert({
    organization_id: orgId,
    user_id: userId,
    role: "judge",
  });

  const { data: existingProfile } = await admin
    .from("company_profiles")
    .select("id")
    .eq("organization_id", orgId)
    .maybeSingle();

  if (existingProfile) {
    await admin
      .from("company_profiles")
      .update({
        profile_json: demoProfile,
        status: "APPROVED",
        approved_at: new Date().toISOString(),
      })
      .eq("id", existingProfile.id);
  } else {
    const { error } = await admin.from("company_profiles").insert({
      organization_id: orgId,
      version: 1,
      profile_json: demoProfile,
      status: "APPROVED",
      approved_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  // Replace evidence set for a clean demo library.
  await admin.from("evidence_items").delete().eq("organization_id", orgId);
  const { error: evidenceError } = await admin.from("evidence_items").insert(
    evidenceItems.map((e) => ({
      organization_id: orgId,
      evidence_type: e.evidence_type,
      content: e.content,
      approved: true,
      confidence: 1,
    }))
  );
  if (evidenceError) throw evidenceError;

  await admin.from("judge_accounts").upsert(
    {
      email: JUDGE_EMAIL,
      access_role: "JUDGE",
      expires_at: EXPIRES_AT,
    },
    { onConflict: "email" }
  );

  console.log("Judge account seeded.");
  console.log(`  email:        ${JUDGE_EMAIL}`);
  console.log(`  organization: ${orgId}`);
  console.log(`  expires:      ${EXPIRES_AT}`);
  if (created || process.env.JUDGE_PASSWORD) {
    console.log(`  password:     ${password}`);
    console.log("  (store this in private Devpost submission notes — do not commit)");
  } else {
    console.log("  password:     unchanged (set JUDGE_PASSWORD to rotate)");
  }
  console.log("\nUpload docs/demo/synthetic-rfp-ocean-state-training.md on /jobs/new to demo the pipeline.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
