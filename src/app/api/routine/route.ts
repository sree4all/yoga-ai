import { NextResponse } from "next/server";
import { routineRequestSchema, routineResponseSchema } from "@/lib/contracts/routine-zod";
import { evaluateSafety } from "@/lib/safety/evaluate";
import { KNOWLEDGE_ENTRIES } from "@/lib/knowledge/entries";
import { buildDiscomfortProfile } from "@/lib/knowledge/select";
import {
  generateRoutineStructured,
  mockRoutineFromKnowledge,
  resolveRoutineGenerationBackend,
} from "@/lib/gen/orchestrator";
import { validateRoutineAgainstAvoidList } from "@/lib/knowledge/validate-routine";
import type { DiscomfortType, BodyRegion } from "@/lib/types/intake";
import { API_RESPONSE_DISCLAIMER } from "@/lib/copy/disclaimer";

export const runtime = "nodejs";

function restrictedBreathingForRegion(bodyRegion: string) {
  if (bodyRegion === "neck" || bodyRegion === "shoulders") {
    return KNOWLEDGE_ENTRIES.neck_tension_mild.breathingFallback;
  }
  return KNOWLEDGE_ENTRIES.stress_whole_mild.breathingFallback;
}

function timeoutMs(): number {
  const raw = process.env.ROUTINE_GEN_TIMEOUT_MS;
  const n = raw ? parseInt(raw, 10) : 25000;
  return Number.isFinite(n) && n > 0 ? n : 25000;
}

function postJson(body: unknown, init?: ResponseInit) {
  const backend = resolveRoutineGenerationBackend();
  const headers = new Headers(init?.headers);
  headers.set("X-Yoga-Routine-Backend", backend);
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = routineRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;
  const safety = evaluateSafety({
    intensity: body.intensity,
    optionalNote: body.optionalNote,
  });

  if (safety.path === "restricted") {
    const breath = restrictedBreathingForRegion(body.bodyRegion);
    const response = {
      kind: "restricted" as const,
      disclaimer: API_RESPONSE_DISCLAIMER,
      restricted: {
        breathingSteps: breath.steps,
        careGuidance:
          "If symptoms are strong or worsening, seek in-person care from a qualified professional.",
      },
    };
    const check = routineResponseSchema.safeParse(response);
    if (!check.success) {
      return NextResponse.json({ error: "Internal response shape error" }, { status: 500 });
    }
    return postJson(check.data);
  }

  const profile = buildDiscomfortProfile(
    body.discomfortType as DiscomfortType,
    body.bodyRegion as BodyRegion,
    body.intensity,
  );
  const entry = KNOWLEDGE_ENTRIES[profile.knowledgeKey];
  if (!entry) {
    return NextResponse.json({ error: "Unknown knowledge profile" }, { status: 500 });
  }

  const ms = timeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    let generated = await generateRoutineStructured(body, entry, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const avoidCheck = validateRoutineAgainstAvoidList(
      generated.steps,
      entry.posesToAvoid,
    );
    if (!avoidCheck.ok) {
      generated = mockRoutineFromKnowledge(entry);
    }

    const payload = {
      kind: "safe_routine" as const,
      disclaimer: API_RESPONSE_DISCLAIMER,
      routine: {
        title: generated.title,
        totalDurationMinutes: generated.totalDurationMinutes,
        steps: generated.steps,
      },
    };
    const check = routineResponseSchema.safeParse(payload);
    if (!check.success) {
      return NextResponse.json({ error: "Response validation failed" }, { status: 500 });
    }
    return postJson(check.data);
  } catch (err) {
    console.error("[routine] generation failed:", err);
    clearTimeout(timer);
    const breath = entry.breathingFallback;
    const fallback = {
      kind: "generation_fallback" as const,
      disclaimer: API_RESPONSE_DISCLAIMER,
      fallback: {
        message:
          "Personalized guidance is temporarily unavailable. Here is a short breathing sequence from our knowledge base while you can try again.",
        breathingSteps: breath.steps,
        retryAvailable: true as const,
      },
    };
    const check = routineResponseSchema.safeParse(fallback);
    if (!check.success) {
      return NextResponse.json({ error: "Fallback shape error" }, { status: 500 });
    }
    return postJson(check.data);
  }
}

/** Health + which generation path is configured (no secrets). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "yoga-ai-routine",
    generationBackend: resolveRoutineGenerationBackend(),
    routineGenTimeoutMs: timeoutMs(),
  });
}
