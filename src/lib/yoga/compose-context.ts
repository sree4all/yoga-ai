import type { KnowledgeEntry } from "@/lib/types/intake";
import type { RoutineRequest } from "@/lib/contracts/routine-zod";

/**
 * Builds non-medical prompt context for the orchestrator (FR-005).
 * Output is English only (FR-011).
 */
export function composeOrchestratorPrompts(
  request: RoutineRequest,
  entry: KnowledgeEntry,
): { systemPrompt: string; userPrompt: string } {
  const sequenceSummary = entry.sequence
    .map(
      (s, i) =>
        `${i + 1}. [${s.poseId}] ~${s.durationSeconds}s — ${s.cues.join(" ")}`,
    )
    .join("\n");

  const avoid = entry.posesToAvoid.join(", ");

  const systemPrompt = `You are a supportive movement guide for Yoga.ai. This is NOT medical advice.
Output MUST be valid JSON only, matching this shape:
{
  "title": string,
  "totalDurationMinutes": number (target ~10),
  "steps": [ { "poseId": string, "instruction": string, "durationSeconds": number } ]
}
Rules:
- Use only Hatha/Vinyasa-style language appropriate for beginner–intermediate (YTT200-level) practice.
- Do NOT diagnose, treat, or claim to cure. No medical claims.
- You MUST follow the sequence order and timing intent from the knowledge base summary below.
- You MUST NOT include any pose id listed in poses_to_avoid.
- Instructions must be step-by-step and calm; total practice time should approximate ten minutes (sum durationSeconds roughly 540–660 seconds).
- English only.`;

  const userPrompt = `Intake (non-medical self-report):
- Discomfort type: ${request.discomfortType}
- Body region: ${request.bodyRegion}
- Intensity: ${request.intensity}
- Optional note: ${request.optionalNote ?? "(none)"}

Knowledge base entry: ${entry.title}
Authoritative sequence (follow this order and spirit):
${sequenceSummary}

poses_to_avoid: ${avoid}

Produce JSON for the final user-facing routine.`;

  return { systemPrompt, userPrompt };
}
