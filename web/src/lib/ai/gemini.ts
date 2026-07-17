import { GoogleGenAI } from "@google/genai";
import { createHash } from "crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, isMockAiMode } from "@/lib/env";

export const GEMINI_MODEL = "gemini-2.5-flash";

// Gemini 2.5 Flash list pricing (USD per 1M tokens), used for cost estimates.
const INPUT_COST_PER_M = 0.3;
const OUTPUT_COST_PER_M = 2.5;

export interface AgentCallResult<T> {
  output: T;
  runId: string;
  isMocked: boolean;
  confidence: number | null;
}

interface AgentCallOptions<T> {
  /** Supabase client used to write agent_runs audit records (RLS-scoped or service-role). */
  supabase: SupabaseClient;
  jobId: string | null;
  agentName: string;
  promptVersion: string;
  systemInstruction: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  /** JSON schema passed to Gemini structured output. */
  responseJsonSchema: Record<string, unknown>;
  /** Optional binary attachments (e.g. solicitation PDFs) sent inline to Gemini. */
  fileParts?: Array<{ mimeType: string; dataBase64: string }>;
  /** Deterministic output used in MOCK AI MODE (no GEMINI_API_KEY). */
  mockOutput: T;
  temperature?: number;
  maxRetries?: number;
}

/**
 * Single entry point for every Gemini agent call.
 *
 * - Enforces structured output validated with Zod, retrying with error
 *   feedback on malformed responses (spec 10.3).
 * - Writes an immutable agent_runs audit record for every attempt, including
 *   tokens, estimated cost, duration, and prompt version (spec 0.10).
 * - In MOCK AI MODE (no GEMINI_API_KEY) returns `mockOutput` and records the
 *   run with status MOCKED / is_mocked=true so mock data is never confused
 *   with production evidence.
 */
export async function callAgent<T>(opts: AgentCallOptions<T>): Promise<AgentCallResult<T>> {
  const supabase = opts.supabase;
  const inputHash = createHash("sha256")
    .update(opts.systemInstruction + "\n" + opts.userPrompt)
    .digest("hex");

  if (isMockAiMode()) {
    const { data, error } = await supabase
      .from("agent_runs")
      .insert({
        job_id: opts.jobId,
        agent_name: opts.agentName,
        model_name: "MOCK (no GEMINI_API_KEY configured)",
        prompt_version: opts.promptVersion,
        input_hash: inputHash,
        output_json: opts.mockOutput as object,
        confidence: extractConfidence(opts.mockOutput),
        status: "MOCKED",
        is_mocked: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to log mocked agent run: ${error.message}`);
    return {
      output: opts.mockOutput,
      runId: data.id,
      isMocked: true,
      confidence: extractConfidence(opts.mockOutput),
    };
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const maxRetries = opts.maxRetries ?? 2;
  let lastError = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const started = Date.now();
    const retryFeedback = lastError
      ? `\n\nYour previous response failed validation with this error. Fix it and respond again with valid JSON only:\n${lastError}`
      : "";

    const parts = [
      ...(opts.fileParts ?? []).map((f) => ({
        inlineData: { mimeType: f.mimeType, data: f.dataBase64 },
      })),
      { text: opts.userPrompt + retryFeedback },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: opts.systemInstruction,
        temperature: opts.temperature ?? 0.2,
        responseMimeType: "application/json",
        responseJsonSchema: opts.responseJsonSchema,
      },
    });

    const durationMs = Date.now() - started;
    const tokenInput = response.usageMetadata?.promptTokenCount ?? 0;
    const tokenOutput = response.usageMetadata?.candidatesTokenCount ?? 0;
    const costCents = Math.ceil(
      ((tokenInput * INPUT_COST_PER_M + tokenOutput * OUTPUT_COST_PER_M) / 1_000_000) * 100
    );

    let parsed: T | null = null;
    let status = "SUCCESS";
    try {
      parsed = opts.schema.parse(JSON.parse(response.text ?? ""));
    } catch (err) {
      status = attempt < maxRetries ? "RETRIED" : "FAILED";
      lastError = err instanceof Error ? err.message.slice(0, 2000) : String(err);
    }

    const { data: run, error: logError } = await supabase
      .from("agent_runs")
      .insert({
        job_id: opts.jobId,
        agent_name: opts.agentName,
        model_name: GEMINI_MODEL,
        prompt_version: opts.promptVersion,
        input_hash: inputHash,
        output_json: parsed ?? { raw: (response.text ?? "").slice(0, 10000), error: lastError },
        confidence: parsed ? extractConfidence(parsed) : null,
        token_input: tokenInput,
        token_output: tokenOutput,
        estimated_cost_cents: costCents,
        duration_ms: durationMs,
        status,
        is_mocked: false,
        gemini_response_id: response.responseId ?? null,
      })
      .select("id")
      .single();
    if (logError) throw new Error(`Failed to log agent run: ${logError.message}`);

    if (parsed) {
      return {
        output: parsed,
        runId: run.id,
        isMocked: false,
        confidence: extractConfidence(parsed),
      };
    }
  }

  throw new Error(
    `${opts.agentName} produced invalid output after retries: ${lastError}`
  );
}

function extractConfidence(output: unknown): number | null {
  if (
    output &&
    typeof output === "object" &&
    "confidence" in output &&
    typeof (output as { confidence: unknown }).confidence === "number"
  ) {
    return (output as { confidence: number }).confidence;
  }
  return null;
}
