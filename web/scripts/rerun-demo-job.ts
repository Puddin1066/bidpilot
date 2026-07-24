/**
 * Re-run the Roundhouse demo job after seeding approved profile/evidence.
 *
 * Signs in as the demo user (RLS-scoped), advances the pipeline through
 * automatic stages, and auto-clears customer gates for this demo only.
 *
 * Usage (from web/):
 *   npx --yes tsx scripts/rerun-demo-job.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "j.jayround@gmail.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "BidPilotDemo2026!";
const JOB_ID = process.env.DEMO_JOB_ID ?? "3f9d0538-e461-4f6c-8eab-da1af82f15b5";

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
    if (!(key in process.env) || !process.env[key]) process.env[key] = value;
  }
}

// Must load before importing modules that parse env at module scope.
loadEnvLocal();

async function getStatus(supabase: ReturnType<typeof createClient>, jobId: string) {
  const { data, error } = await supabase.from("jobs").select("status").eq("id", jobId).single();
  if (error) throw error;
  if (!data) throw new Error(`Job ${jobId} not found`);
  return String((data as { status: string }).status);
}

async function main() {
  const { runPipeline } = await import("../src/lib/pipeline");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase URL/anon key in .env.local");
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required for a real re-run");

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (authError) throw authError;

  console.log(`Signed in as ${DEMO_EMAIL}`);
  console.log(`Job ${JOB_ID} starting status: ${await getStatus(supabase, JOB_ID)}`);

  for (let pass = 1; pass <= 8; pass++) {
    const before = await getStatus(supabase, JOB_ID);
    console.log(`\nPass ${pass} — status ${before}`);

    if (before === "DELIVERED" || before === "COMPLETED") {
      console.log("Done.");
      break;
    }

    if (before === "BID_DECISION_READY") {
      const { data: bid } = await supabase
        .from("bid_decisions")
        .select("decision, score, confidence, rationale")
        .eq("job_id", JOB_ID)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      console.log("Bid decision:", bid);
      await supabase.from("jobs").update({ status: "COMPLIANCE_MAPPING" }).eq("id", JOB_ID);
      continue;
    }

    if (before === "CUSTOMER_CLARIFICATION") {
      console.log("Clearing clarification gate (demo auto-approve).");
      await supabase.from("jobs").update({ status: "BID_DECISION_READY" }).eq("id", JOB_ID);
      continue;
    }

    if (before === "HUMAN_EXCEPTION_REVIEW") {
      console.log("Clearing exception review gate (demo auto-approve).");
      await supabase.from("jobs").update({ status: "READY_FOR_DELIVERY" }).eq("id", JOB_ID);
      continue;
    }

    if (before === "INTAKE_REQUIRED") {
      throw new Error("Job still needs intake — cannot re-run pipeline.");
    }

    try {
      const outcomes = await runPipeline(supabase, JOB_ID);
      for (const o of outcomes) {
        console.log(`  ${o.previousStatus} → ${o.newStatus}: ${o.detail}`);
      }
      if (outcomes.length === 0) {
        console.log("  No automatic advancement from this status.");
        break;
      }
    } catch (err) {
      console.error("Pipeline error:", err);
      console.log(`Status after failure: ${await getStatus(supabase, JOB_ID)}`);
      process.exitCode = 1;
      break;
    }
  }

  const finalStatus = await getStatus(supabase, JOB_ID);
  const { count: draftCount } = await supabase
    .from("draft_sections")
    .select("*", { count: "exact", head: true })
    .eq("job_id", JOB_ID);
  const { count: reqCount } = await supabase
    .from("requirements")
    .select("*", { count: "exact", head: true })
    .eq("job_id", JOB_ID);
  const { data: bid } = await supabase
    .from("bid_decisions")
    .select("decision, score, confidence")
    .eq("job_id", JOB_ID)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log("\n=== Final ===");
  console.log({ finalStatus, drafts: draftCount, requirements: reqCount, bid });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
