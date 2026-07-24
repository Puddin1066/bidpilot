/**
 * Record a <3 min BidPilot demo video via automated Playwright navigation,
 * then mux a TTS voiceover from the submission script.
 *
 * Output under docs/demo/video/:
 *   bidpilot-demo.webm / .mp4 (silent)
 *   bidpilot-demo-voiced.mp4 (with narration)
 *   voiceover.aiff / voiceover.m4a
 *
 * Usage (from web/):
 *   npx --yes tsx scripts/record-demo-video.ts
 */
import { chromium, type Page } from "playwright";
import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const BASE = process.env.DEMO_BASE_URL ?? "https://bidpilot-three.vercel.app";
const EMAIL = process.env.DEMO_EMAIL ?? "j.jayround@gmail.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "BidPilotDemo2026!";
const JOB_ID = process.env.DEMO_JOB_ID ?? "3f9d0538-e461-4f6c-8eab-da1af82f15b5";

const OUT_DIR = resolve(process.cwd(), "../docs/demo/video");
const RAW_DIR = join(OUT_DIR, "raw");

const NARRATION = `
Small businesses leave contracts on the table because responding to an RFP takes a proposal department they don't have.
BidPilot is that department — operated by AI. Customers pay a fixed fee, and within forty-eight hours get a bid decision, a compliance matrix, and a source-grounded first draft.

This is the live product. Pricing is transparent. The sample report shows exactly what a readiness package looks like.

A customer signs in, opens their job, and the pipeline has already run.
Here is the bid recommendation — scored across multiple factors, with plain-language rationale. Humans approve the go decision; AI does not submit anything for them.

Next, the compliance matrix. Every mandatory requirement is listed with a source citation, evidence status, and risk level — so nothing buried in the RFP is missed.

Then a grounded first draft. Claims are written from the company's approved evidence. A separate verification pass flags anything unsupported.

Every Gemini call is logged immutably — model, tokens, cost, and status — so AI operation is auditable, not a black box.

BidPilot turns RFP paperwork into a product small firms can buy — a proposal department they can afford.
`.replace(/\n+/g, " ").trim();

async function hold(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function scrollReveal(page: Page, px: number, steps = 4) {
  const step = Math.max(1, Math.floor(px / steps));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, step);
    await hold(page, 400);
  }
}

async function record() {
  mkdirSync(RAW_DIR, { recursive: true });
  for (const f of readdirSync(RAW_DIR)) {
    if (f.endsWith(".webm")) {
      try {
        renameSync(join(RAW_DIR, f), join(RAW_DIR, `old-${f}`));
      } catch {
        /* ignore */
      }
    }
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: RAW_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // Landing
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await hold(page, 3500);
  await scrollReveal(page, 1100, 6);
  await hold(page, 1500);

  // Pricing
  await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
  await hold(page, 3000);
  await scrollReveal(page, 900, 5);
  await hold(page, 1200);

  // Sample deliverable
  await page.goto(`${BASE}/sample`, { waitUntil: "networkidle" });
  await hold(page, 3000);
  await scrollReveal(page, 1200, 6);
  await hold(page, 1200);

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await hold(page, 1000);
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await hold(page, 500);
  await Promise.all([
    page.waitForURL(/\/(dashboard|onboarding|jobs)/, { timeout: 30000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await hold(page, 2500);

  // Dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await hold(page, 3500);

  // Job workspace
  await page.goto(`${BASE}/jobs/${JOB_ID}`, { waitUntil: "networkidle" });
  await hold(page, 3500);
  await scrollReveal(page, 700, 4);
  await hold(page, 2000);

  for (const label of [/bid\/?no-?bid|recommendation|decision/i, /compliance matrix/i, /draft/i, /audit|agent run|gemini/i]) {
    const el = page.getByText(label).first();
    if (await el.count()) {
      await el.scrollIntoViewIfNeeded().catch(() => null);
      await hold(page, 2800);
      await scrollReveal(page, 650, 3);
      await hold(page, 1200);
    }
  }

  // Trust / XPRIZE transparency
  await page.goto(`${BASE}/xprize`, { waitUntil: "networkidle" });
  await hold(page, 3000);
  await scrollReveal(page, 900, 5);
  await hold(page, 1500);

  // How it works
  await page.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
  await hold(page, 2500);
  await scrollReveal(page, 700, 4);
  await hold(page, 1200);

  // Close on pricing
  await page.goto(`${BASE}/pricing`, { waitUntil: "networkidle" });
  await hold(page, 3500);

  await context.close();
  await browser.close();

  const webms = readdirSync(RAW_DIR).filter((f) => f.endsWith(".webm") && !f.startsWith("old-"));
  if (!webms.length) throw new Error("No webm recorded");
  const webmOut = join(OUT_DIR, "bidpilot-demo.webm");
  const mp4Silent = join(OUT_DIR, "bidpilot-demo.mp4");
  renameSync(join(RAW_DIR, webms[0]), webmOut);

  run("ffmpeg", ["-y", "-i", webmOut, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4Silent]);
  return mp4Silent;
}

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stderr);
    throw new Error(`${cmd} failed`);
  }
  return res;
}

function durationOf(path: string): number {
  const res = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
    { encoding: "utf8" }
  );
  return parseFloat(res.stdout.trim());
}

function buildVoiceover(targetSeconds: number) {
  const aiff = join(OUT_DIR, "voiceover.aiff");
  const m4a = join(OUT_DIR, "voiceover.m4a");
  const scriptFile = join(OUT_DIR, "narration.txt");
  writeFileSync(scriptFile, NARRATION, "utf8");

  // macOS TTS
  run("say", ["-r", "165", "-f", scriptFile, "-o", aiff]);
  run("ffmpeg", ["-y", "-i", aiff, "-c:a", "aac", "-b:a", "192k", m4a]);

  let audioDur = durationOf(m4a);
  // If audio longer than video, we'll pad video; if shorter, pad audio with silence.
  return { m4a, audioDur, targetSeconds };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const mp4Silent = await record();
  const videoDur = durationOf(mp4Silent);
  const { m4a, audioDur } = buildVoiceover(videoDur);

  const voiced = join(OUT_DIR, "bidpilot-demo-voiced.mp4");
  // Pad the shorter stream so A/V end together; keep under 3:00 if possible.
  if (audioDur > videoDur) {
    const pad = (audioDur - videoDur).toFixed(2);
    run("ffmpeg", [
      "-y",
      "-i",
      mp4Silent,
      "-i",
      m4a,
      "-filter_complex",
      `[0:v]tpad=stop_mode=clone:stop_duration=${pad}[v]`,
      "-map",
      "[v]",
      "-map",
      "1:a",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-shortest",
      "-movflags",
      "+faststart",
      voiced,
    ]);
  } else {
    run("ffmpeg", [
      "-y",
      "-i",
      mp4Silent,
      "-i",
      m4a,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-shortest",
      "-movflags",
      "+faststart",
      voiced,
    ]);
  }

  const finalDur = durationOf(voiced);
  // If somehow over 179s, trim.
  let finalPath = voiced;
  if (finalDur >= 179) {
    const trimmed = join(OUT_DIR, "bidpilot-demo-voiced-trimmed.mp4");
    run("ffmpeg", ["-y", "-i", voiced, "-t", "179", "-c", "copy", trimmed]);
    finalPath = trimmed;
  }

  writeFileSync(
    join(OUT_DIR, "README.md"),
    `# BidPilot demo video

Generated by \`web/scripts/record-demo-video.ts\` against production
(\`${BASE}\`) using Playwright screen recording + macOS \`say\` voiceover.

## Files

- \`bidpilot-demo-voiced.mp4\` — **upload this** to YouTube (unlisted or public) and paste the link into Devpost
- \`bidpilot-demo.mp4\` — silent capture only
- \`narration.txt\` — TTS script used

## Devpost steps

1. Upload \`bidpilot-demo-voiced.mp4\` to YouTube (or Vimeo).
2. Wait until processing finishes; set visibility to **Unlisted** or **Public**.
3. Paste the watch URL into Devpost **Video demo link**.
4. Open the Devpost preview in an incognito window and confirm the embed plays.

Hard limit: under 3:00. Re-record anytime with:

\`\`\`bash
cd web && npx tsx scripts/record-demo-video.ts
\`\`\`
`,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        silentMp4: mp4Silent,
        voicedMp4: finalPath,
        videoDurationSec: Number(videoDur.toFixed(1)),
        audioDurationSec: Number(audioDur.toFixed(1)),
        finalDurationSec: Number(durationOf(finalPath).toFixed(1)),
        underThreeMinutes: durationOf(finalPath) < 180,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
