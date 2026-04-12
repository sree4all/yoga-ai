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
 * 1. `GENORCHESTRATOR_BASE_URL` + `GENORCHESTRATOR_API_KEY` → GenOrchestrator
 * 2. `OPENAI_API_KEY` only → direct OpenAI (dev / bypass orchestrator)
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

  if (baseUrl && orchestratorApiKey) {
    return callGenOrchestratorChatCompletions(
      baseUrl,
      orchestratorApiKey,
      systemPrompt,
      userPrompt,
      signal,
    );
  }

  if (openAiKey) {
    return callOpenAiJsonMode(systemPrompt, userPrompt, openAiKey, signal);
  }

  return mockRoutineFromKnowledge(entry);
}

function normalizeBaseUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  return url.replace(/\/+$/, "");
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
    parsed = JSON.parse(content);
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

async function callOpenAiJsonMode(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<GeneratedRoutinePayload> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${t}`);
  }
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI: empty content");
  const parsed = JSON.parse(content) as unknown;
  return parseRoutinePayload(parsed);
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
