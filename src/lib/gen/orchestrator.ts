import type { KnowledgeEntry } from "@/lib/types/intake";
import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import { composeOrchestratorPrompts } from "@/lib/yoga/compose-context";

export interface GeneratedRoutinePayload {
  title: string;
  totalDurationMinutes: number;
  steps: { poseId: string; instruction: string; durationSeconds: number }[];
}

/**
 * Server-only orchestration (FR-008). No client import.
 *
 * Integration with [GenOrchestrator](https://github.com/sree4all/genorchestrator):
 * - Self-hosted FastAPI service exposing OpenAI-compatible `POST /v1/chat/completions`
 * - Auth: `Authorization: Bearer <API key>` (keys from `python scripts/create_user.py` on the orchestrator)
 *
 * Priority:
 * 1. `OPENAI_API_KEY` → direct OpenAI (wins if set — avoids accidental orchestrator when both are in env)
 * 2. `GENORCHESTRATOR_BASE_URL` + `GENORCHESTRATOR_API_KEY` → GenOrchestrator
 * 3. Deterministic mock from static knowledge
 */
export async function generateRoutineStructured(
  request: RoutineRequest,
  entry: KnowledgeEntry,
  options?: { signal?: AbortSignal },
): Promise<GeneratedRoutinePayload> {
  const { systemPrompt, userPrompt } = composeOrchestratorPrompts(request, entry);
  const signal = options?.signal;

  const baseUrl = normalizeBaseUrl(process.env.GENORCHESTRATOR_BASE_URL);
  const orchestratorApiKey = process.env.GENORCHESTRATOR_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  console.info("[routine] generation backend:", resolveRoutineGenerationBackend());

  if (openAiKey) {
    return callOpenAiJsonMode(systemPrompt, userPrompt, openAiKey, signal);
  }

  if (baseUrl && orchestratorApiKey) {
    return callGenOrchestratorChatCompletions(
      baseUrl,
      orchestratorApiKey,
      systemPrompt,
      userPrompt,
      signal,
    );
  }

  return mockRoutineFromKnowledge(entry);
}

function normalizeBaseUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  return url.replace(/\/+$/, "");
}

/** Which backend `generateRoutineStructured` will use (for diagnostics; no secrets). */
export function resolveRoutineGenerationBackend():
  | "orchestrator"
  | "openai"
  | "mock" {
  const baseUrl = normalizeBaseUrl(process.env.GENORCHESTRATOR_BASE_URL);
  const orchestratorApiKey = process.env.GENORCHESTRATOR_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) return "openai";
  if (baseUrl && orchestratorApiKey) return "orchestrator";
  return "mock";
}

/**
 * @see https://github.com/sree4all/genorchestrator/blob/main/docs/api.md — Chat Completions
 */
async function callGenOrchestratorChatCompletions(
  baseUrl: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal,
): Promise<GeneratedRoutinePayload> {
  const model =
    process.env.GENORCHESTRATOR_MODEL?.trim() || "gpt-3.5-turbo";
  const useJsonObject =
    process.env.GENORCHESTRATOR_USE_JSON_OBJECT !== "false";

  const body: Record<string, unknown> = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model,
    temperature: 0.4,
    max_tokens: 4096,
  };

  const pref = process.env.GENORCHESTRATOR_PROVIDER_PREFERENCE?.trim();
  if (pref) {
    body.provider_preference = pref;
  }

  if (useJsonObject) {
    body.response_format = { type: "json_object" };
  }

  const url = `${baseUrl}/v1/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GenOrchestrator ${res.status} ${url}: ${t}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("GenOrchestrator: empty assistant content");
  }

  let parsed: unknown;
  try {
    parsed = parseModelJsonContent(content);
  } catch {
    throw new Error("GenOrchestrator: assistant content is not valid JSON");
  }

  return parseRoutinePayload(parsed);
}

function parseRoutinePayload(data: unknown): GeneratedRoutinePayload {
  const obj = data as Record<string, unknown>;
  const inner = (obj.routine ?? obj) as Record<string, unknown>;
  const title = String(inner.title ?? "Your practice");
  const totalDurationMinutes = Number(inner.totalDurationMinutes ?? 10);
  const stepsRaw = inner.steps;
  if (!Array.isArray(stepsRaw)) {
    throw new Error("Invalid orchestrator payload: steps");
  }
  const steps = stepsRaw.map((s) => {
    const step = s as Record<string, unknown>;
    return {
      poseId: String(step.poseId ?? "pose"),
      instruction: String(step.instruction ?? ""),
      durationSeconds: Number(step.durationSeconds ?? 60),
    };
  });
  return { title, totalDurationMinutes, steps };
}

function openAiMaxAttempts(): number {
  const raw = process.env.OPENAI_MAX_ATTEMPTS?.trim();
  const n = raw ? parseInt(raw, 10) : 3;
  if (!Number.isFinite(n)) return 3;
  return Math.min(8, Math.max(1, n));
}

function retryAfterMsFromHeaders(headers: Headers): number | null {
  const raw = headers.get("retry-after");
  if (!raw) return null;
  const sec = parseFloat(raw);
  if (!Number.isFinite(sec) || sec < 0) return null;
  return Math.min(sec * 1000, 120_000);
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const id = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(signal!.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Billing / credit exhaustion — retries do not help. */
function openAiInsufficientQuotaFromBody(bodyText: string): boolean {
  try {
    const j = JSON.parse(bodyText) as {
      error?: { code?: string; type?: string };
    };
    return (
      j.error?.code === "insufficient_quota" ||
      j.error?.type === "insufficient_quota"
    );
  } catch {
    return false;
  }
}

function openAiMaxCompletionTokens(): number {
  const raw = process.env.OPENAI_MAX_TOKENS?.trim();
  const n = raw ? parseInt(raw, 10) : 2048;
  if (!Number.isFinite(n)) return 2048;
  return Math.min(8192, Math.max(256, n));
}

async function callOpenAiJsonMode(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<GeneratedRoutinePayload> {
  const maxAttempts = openAiMaxAttempts();
  const body = JSON.stringify({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    max_tokens: openAiMaxCompletionTokens(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
  });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body,
    });

    if (res.ok) {
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("OpenAI: empty content");
      const parsed = parseModelJsonContent(content);
      return parseRoutinePayload(parsed);
    }

    const t = await res.text();
    if (res.status === 429 && openAiInsufficientQuotaFromBody(t)) {
      throw new Error(`OpenAI error 429: ${t}`);
    }
    if (res.status === 429 && attempt < maxAttempts - 1) {
      const fromHeader = retryAfterMsFromHeaders(res.headers);
      const backoff = Math.min(1000 * 2 ** attempt, 8000);
      const waitMs = Math.min(
        60_000,
        fromHeader != null ? Math.max(fromHeader, backoff) : backoff,
      );
      console.info(
        `[routine] OpenAI 429 — retry ${attempt + 2}/${maxAttempts} after ${waitMs}ms`,
      );
      await delay(waitMs, signal);
      continue;
    }

    throw new Error(`OpenAI error ${res.status}: ${t}`);
  }

  throw new Error("OpenAI: unreachable retry loop");
}

/** Parse JSON from model text; tolerates markdown fences or leading prose (HTTP 200 can still fail strict JSON.parse). */
function parseModelJsonContent(content: string): unknown {
  const trimmed = content.trim();
  const attempts: (() => unknown)[] = [
    () => JSON.parse(trimmed),
    () => {
      const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(trimmed);
      if (!fence) throw new Error("no fence");
      return JSON.parse(fence[1].trim());
    },
    () => {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start < 0 || end <= start) throw new Error("no object");
      return JSON.parse(trimmed.slice(start, end + 1));
    },
  ];
  for (const run of attempts) {
    try {
      return run();
    } catch {
      /* try next strategy */
    }
  }
  throw new Error("Model content is not valid JSON");
}

/** Deterministic mock — valid JSON shape, ~10 minutes total duration. */
export function mockRoutineFromKnowledge(entry: KnowledgeEntry): GeneratedRoutinePayload {
  const steps = entry.sequence.map((s) => ({
    poseId: s.poseId,
    instruction: s.cues.join(" "),
    durationSeconds: s.durationSeconds,
  }));
  const totalSeconds = steps.reduce((a, b) => a + b.durationSeconds, 0);
  const totalDurationMinutes = Math.max(1, Math.round(totalSeconds / 60));
  return {
    title: entry.title,
    totalDurationMinutes,
    steps,
  };
}
