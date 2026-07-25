/**
 * Generate a natural Gemini TTS voiceover from SCRIPT-read-aloud.md
 * and mux onto the silent demo video.
 *
 * Usage (from web/):
 *   npx tsx scripts/generate-natural-voiceover.ts
 *
 * Env:
 *   TTS_VOICE   default Charon (informative). Also good: Callirrhoe, Aoede, Kore
 *   TTS_MODEL   default gemini-2.5-flash-preview-tts
 */
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq);
    let value = t.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const OUT_DIR = resolve(process.cwd(), "../docs/demo/video");
const SCRIPT_MD = join(OUT_DIR, "SCRIPT-read-aloud.md");
const SILENT = join(OUT_DIR, "bidpilot-demo.mp4");
const PCM = join(OUT_DIR, "voiceover-gemini.pcm");
const WAV = join(OUT_DIR, "voiceover-gemini.wav");
const M4A = join(OUT_DIR, "voiceover-gemini.m4a");
const VOICED = join(OUT_DIR, "bidpilot-demo-voiced.mp4");

const VOICE = process.env.TTS_VOICE ?? "Charon";
const MODEL = process.env.TTS_MODEL ?? "gemini-2.5-flash-preview-tts";

function extractScriptBody(md: string): string {
  const parts = md.split(/\n---\n/);
  // Body is between first --- and second ---
  if (parts.length >= 3) return parts[1].trim();
  return md
    .replace(/^#.*$/gm, "")
    .replace(/^## Recording tips[\s\S]*$/m, "")
    .replace(/^Read this[\s\S]*?---\n/m, "")
    .trim();
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
  return parseFloat(
    spawnSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
      { encoding: "utf8" }
    ).stdout.trim()
  );
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY required");
  if (!existsSync(SILENT)) throw new Error(`Missing silent video: ${SILENT}`);

  const body = extractScriptBody(readFileSync(SCRIPT_MD, "utf8"));
  const prompt = `Read the following narration for a product demo video.
Speak in a warm, natural, documentary style — like a founder telling one person a true story at a kitchen table, not a commercial announcer.
Steady pace. Soft pauses between paragraphs. Quiet conviction. No theatrical drama. No hype.
Do not add any words that are not in the script.

Script:

${body}`;

  console.log(`Generating TTS with ${MODEL} / voice ${VOICE}…`);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE },
        },
      },
    },
  });

  const inline =
    response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!inline?.data) {
    console.error(JSON.stringify(response, null, 2).slice(0, 2000));
    throw new Error("No audio in Gemini TTS response");
  }

  const pcm = Buffer.from(inline.data, "base64");
  writeFileSync(PCM, pcm);
  // Gemini TTS returns 24kHz 16-bit mono PCM
  run("ffmpeg", [
    "-y",
    "-f",
    "s16le",
    "-ar",
    "24000",
    "-ac",
    "1",
    "-i",
    PCM,
    WAV,
  ]);
  run("ffmpeg", ["-y", "-i", WAV, "-c:a", "aac", "-b:a", "192k", M4A]);

  const videoDur = durationOf(SILENT);
  const audioDur = durationOf(M4A);
  console.log(`Video ${videoDur.toFixed(1)}s · Voice ${audioDur.toFixed(1)}s`);

  if (audioDur > videoDur) {
    const pad = (audioDur - videoDur).toFixed(3);
    run("ffmpeg", [
      "-y",
      "-i",
      SILENT,
      "-i",
      M4A,
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
      VOICED,
    ]);
  } else {
    run("ffmpeg", [
      "-y",
      "-i",
      SILENT,
      "-i",
      M4A,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-shortest",
      "-movflags",
      "+faststart",
      VOICED,
    ]);
  }

  let finalPath = VOICED;
  const finalDur = durationOf(VOICED);
  if (finalDur >= 179) {
    const trimmed = join(OUT_DIR, "bidpilot-demo-voiced-trimmed.mp4");
    run("ffmpeg", ["-y", "-i", VOICED, "-t", "179", "-c", "copy", trimmed]);
    finalPath = trimmed;
  }

  writeFileSync(join(OUT_DIR, "narration.txt"), body, "utf8");
  console.log(
    JSON.stringify(
      {
        model: MODEL,
        voice: VOICE,
        voicedMp4: finalPath,
        durationSec: Number(durationOf(finalPath).toFixed(1)),
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
