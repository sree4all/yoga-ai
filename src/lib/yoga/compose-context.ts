import type { KnowledgeEntry } from "@/lib/types/intake";
import type { RoutineRequest } from "@/lib/contracts/routine-zod";

export interface ComposePromptOptions {
  /** Per-request token so completions vary across sessions (MVP3). */
  diversityNonce?: string;
  /** MVP4 constrained generation context. */
  constrainedPoseIds?: string[];
  catalogTags?: string[];
  enrichmentSnippets?: string[];
}

/**
 * Builds non-medical prompt context for the orchestrator (FR-003–FR-005).
 * Output is English only (FR-011).
 */
export function composeOrchestratorPrompts(
  request: RoutineRequest,
  entry: KnowledgeEntry,
  options?: ComposePromptOptions,
): { systemPrompt: string; userPrompt: string } {
  const sequenceSummary = entry.sequence
    .map(
      (s, i) =>
        `${i + 1}. [${s.poseId}] ~${s.durationSeconds}s — ${s.cues.join(" ")}`,
    )
    .join("\n");

  const avoid = entry.posesToAvoid.join(", ");
  const discomfortList = request.discomfortTypes.join(", ");
  const regionList = request.bodyRegions.join(", ");

  const systemPrompt = `You are a supportive movement guide for Yoga.ai. This is NOT medical advice.
Output MUST be valid JSON only, matching this shape:
{
  "title": string,
  "totalDurationMinutes": number (target ~10),
  "yogaStyle": {
    "category": string (one of: Hatha, Vinyasa, Yin, Restorative, or similar widely known label),
    "rationale": string (1–3 sentences: why this style fits THIS user's combined symptoms and regions)
  },
  "steps": [
    {
      "poseId": string,
      "instruction": string,
      "durationSeconds": number,
      "media": {
        "imageUrl": string (https placeholder ok, e.g. picsum seed per poseId),
        "videoLabel": string (short hint for finding a video, e.g. YouTube search phrase for this pose)
      }
    }
  ]
}
(You may omit optional media keys; the server may add attribution or video URLs later.)
Rules:
- Use beginner–intermediate (YTT200-level) language. Do NOT diagnose, treat, or claim to cure.
- You MUST follow the sequence order and timing intent from the knowledge base summary below.
- You MUST NOT include any pose id listed in poses_to_avoid.
- Instructions must be step-by-step and calm; total practice time should approximate ten minutes (sum durationSeconds roughly 540–660 seconds).
- **Different intake combinations MUST produce meaningfully different title, yogaStyle, and step instructions** — do not reuse generic boilerplate across different symptom/region sets. Anchor opening sentences in the specific regions and symptoms given.
- **Across separate generations**, even with similar intake, vary cue wording, micro-emphasis, and transitional phrases — do not output near-duplicate scripts. A per-session diversity id is provided; use it only to nudge lexical variety, not to change safety or sequence.
- Choose yogaStyle.category and rationale from the user's signals (e.g. stiffness / joint sensitivity → Yin or slow Hatha; fatigue / low energy → a slightly more flowing Vinyasa-style pacing if appropriate; stress → grounding Hatha/Restorative bias). Explain the choice briefly in rationale.
- English only.`;

  const nonceLine =
    options?.diversityNonce != null && options.diversityNonce.length > 0
      ? `\n- **Session diversity id (vary wording vs other runs; do not repeat boilerplate):** ${options.diversityNonce}`
      : "";
  const constrainedPosesLine =
    options?.constrainedPoseIds && options.constrainedPoseIds.length > 0
      ? `\n- **Allowed pose ids (strict list; do not invent others):** ${options.constrainedPoseIds.join(", ")}`
      : "";
  const tagsLine =
    options?.catalogTags && options.catalogTags.length > 0
      ? `\n- **Catalog focus tags for this request:** ${options.catalogTags.join(", ")}`
      : "";
  const snippetLine =
    options?.enrichmentSnippets && options.enrichmentSnippets.length > 0
      ? `\n- **Approved optional enrichment lines (English-only, secular):**\n${options.enrichmentSnippets
          .slice(0, 8)
          .map((s, i) => `  ${i + 1}. ${s}`)
          .join("\n")}`
      : "";

  const userPrompt = `Intake (non-medical self-report) — **use ALL items** in each list; they form a combined picture:
- Discomfort types selected: ${discomfortList}
- Body regions selected: ${regionList}
- Intensity: ${request.intensity}
- Optional note: ${request.optionalNote ?? "(none)"}${nonceLine}

Knowledge base entry: ${entry.title}
Authoritative sequence (follow this order and spirit):
${sequenceSummary}

poses_to_avoid: ${avoid}

Produce JSON for the final user-facing routine. Tie every section to this specific combination of types and regions — not a generic routine.${constrainedPosesLine}${tagsLine}${snippetLine}`;

  return { systemPrompt, userPrompt };
}
