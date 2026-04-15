import { readFile } from "node:fs/promises";

import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import type { GeneratedRoutinePayload, GeneratedRoutineStep } from "@/lib/gen/orchestrator";
import {
  corpusBundleSchema,
  type CorpusBundle,
  type CuratedRoutine,
  validateCorpusBundle,
} from "@/lib/corpus/corpus-zod";
import { ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX, ROUTINE_CORPUS_BUNDLE_PATH } from "@/lib/corpus/paths";

let memoizedBundle: CorpusBundle | null = null;
let memoizedBundleMtime: string | null = null;
const HIDE_IMAGE_URL = "about:blank";
const REST_POSE_ID = "savasana";
const WARMUP_POSE_IDS = new Set(["easy_seated", "cat", "cow", "childs_pose"]);
const COOLDOWN_POSE_IDS = new Set(["childs_pose", "bound_angle", "supine_twist", "happy_baby"]);
const STYLE_ROTATION = ["Hatha", "Vinyasa", "Yin", "Restorative"] as const;
const ASSET_PATH_ALIASES: Record<string, string> = {
  "/routine-corpus/assets/yoga-easy.svg": "/routine-corpus/assets/yoga-easy-seated.svg",
  "/routine-corpus/assets/yoga-standing-forward-fold-1.svg":
    "/routine-corpus/assets/yoga-standing-forward-fold.svg",
  "/routine-corpus/assets/yoga-seated-spinal-twist-1.svg":
    "/routine-corpus/assets/yoga-seated-spinal-twist.svg",
  "/routine-corpus/assets/yoga-seated-forward-fold-1.svg":
    "/routine-corpus/assets/yoga-seated-forward-fold.svg",
  "/routine-corpus/assets/yoga-bound-angle-1.svg": "/routine-corpus/assets/yoga-bound-angle.svg",
  "/routine-corpus/assets/yoga-supine-twist-1.svg": "/routine-corpus/assets/yoga-supine-twist.svg",
  "/routine-corpus/assets/yoga-boat-2.svg": "/routine-corpus/assets/yoga-boat.svg",
  "/routine-corpus/assets/yoga-camel-1.svg": "/routine-corpus/assets/yoga-camel.svg",
  "/routine-corpus/assets/yoga-goddess-1.svg": "/routine-corpus/assets/yoga-goddess.svg",
  "/routine-corpus/assets/yoga-tree-2.svg": "/routine-corpus/assets/yoga-tree.svg",
};

function normalizeAssetPath(pathValue: string): string {
  const normalized = pathValue.replace(/\\/g, "/");
  return ASSET_PATH_ALIASES[normalized] ?? normalized;
}

function readablePoseName(bundle: CorpusBundle, poseId: string): string {
  return (
    bundle.poseAssetIndex[poseId]?.displayName ??
    poseId
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function ensureDetailedInstruction(
  bundle: CorpusBundle,
  poseId: string,
  instruction: string,
): string {
  const normalized = instruction.replace(/\s+/g, " ").trim();
  const base =
    normalized.length > 0
      ? normalized
      : `Move into ${readablePoseName(bundle, poseId)} with slow, steady breath.`;
  if (base.length >= 120) return base;
  const details = /switch|both sides|other side/i.test(base)
    ? "Move slowly on each side with control and keep your breath smooth."
    : "Take 2-3 slow breaths before transitioning and stay in a pain-free range.";
  return `${base} ${details}`;
}

function localImageForPose(bundle: CorpusBundle, poseId: string): string {
  const configuredPath = bundle.poseAssetIndex[poseId]?.stillImage?.path;
  if (!configuredPath) return HIDE_IMAGE_URL;
  const normalized = normalizeAssetPath(configuredPath);
  return normalized.startsWith("/")
    ? normalized
    : `${ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX}${normalized}`;
}

function buildLocalStep(
  bundle: CorpusBundle,
  poseId: string,
  instruction: string,
  durationSeconds = 60,
): GeneratedRoutineStep {
  const label = poseId.replace(/_/g, " ");
  return {
    poseId,
    instruction: ensureDetailedInstruction(bundle, poseId, instruction),
    durationSeconds,
    media: {
      imageUrl: localImageForPose(bundle, poseId),
      videoLabel: `YouTube search: “${label}” yoga pose (gentle)`,
    },
  };
}

export async function loadCorpusBundle(forceReload = false): Promise<CorpusBundle | null> {
  if (!forceReload && memoizedBundle) return memoizedBundle;
  try {
    const raw = await readFile(ROUTINE_CORPUS_BUNDLE_PATH, "utf8");
    const parsedJson = JSON.parse(raw) as unknown;
    const parsed = corpusBundleSchema.parse(parsedJson);
    const validationIssues = validateCorpusBundle(parsed);
    if (validationIssues.length > 0) {
      console.warn(
        JSON.stringify({
          source: "yoga-ai-corpus",
          event: "bundle_validation_issues",
          issueCount: validationIssues.length,
          firstIssue: validationIssues[0]?.message,
        }),
      );
      return null;
    }
    memoizedBundle = parsed;
    memoizedBundleMtime = new Date().toISOString();
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      JSON.stringify({
        source: "yoga-ai-corpus",
        event: "bundle_load_failed",
        message: message.slice(0, 300),
      }),
    );
    return null;
  }
}

export function corpusBundleVersion(): string | null {
  return memoizedBundle?.bundleVersion ?? null;
}

export function corpusLoadedAt(): string | null {
  return memoizedBundleMtime;
}

export function resolveCatalogTags(
  bundle: CorpusBundle,
  request: RoutineRequest,
): string[] {
  const keys = [
    ...request.bodyRegions.map((region) => `region:${region}`),
    ...request.discomfortTypes.map((kind) => `discomfort:${kind}`),
    `intensity:${request.intensity}`,
  ];
  const out = new Set<string>();
  for (const key of keys) {
    for (const tag of bundle.intakeMapping[key] ?? []) {
      out.add(tag);
    }
  }
  return Array.from(out);
}

export function routinesForTags(bundle: CorpusBundle, tags: string[]): CuratedRoutine[] {
  if (tags.length === 0) return bundle.routines;
  const tagSet = new Set(tags);
  return bundle.routines.filter((routine) =>
    routine.catalogTags.some((tag) => tagSet.has(tag)),
  );
}

export function allowedPoseIdsForRoutines(routines: CuratedRoutine[]): string[] {
  const ids = new Set<string>();
  for (const routine of routines) {
    for (const step of routine.steps) {
      ids.add(step.poseId);
    }
  }
  return Array.from(ids);
}

export function substitutionForPoseId(bundle: CorpusBundle, poseId: string): string | null {
  const sub = bundle.safetySubstitutions?.[poseId];
  return sub?.trim() ? sub : null;
}

export function applyCorpusStillImageDefaults(
  bundle: CorpusBundle,
  payload: GeneratedRoutinePayload,
): GeneratedRoutinePayload {
  const steps = payload.steps.map((step) => {
    const entry = bundle.poseAssetIndex[step.poseId];
    const configuredPath = entry?.stillImage?.path;
    if (!configuredPath) return step;
    const normalized = normalizeAssetPath(configuredPath);
    const imageUrl = normalized.startsWith("/")
      ? normalized
      : `${ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX}${normalized}`;
    return {
      ...step,
      media: {
        ...step.media,
        imageUrl,
      },
    };
  });
  return { ...payload, steps };
}

export function applyCorpusInstructionEnrichment(
  bundle: CorpusBundle,
  payload: GeneratedRoutinePayload,
): GeneratedRoutinePayload {
  const snippets = bundle.enrichmentLibrary ?? [];
  if (snippets.length === 0) return payload;
  const useful = snippets.filter((s) => s.type === "breath" || s.type === "mindfulness");
  if (useful.length === 0) return payload;
  let snippetIdx = 0;
  const steps = payload.steps.map((step, idx) => {
    const entry = bundle.poseAssetIndex[step.poseId];
    const sanskrit = entry?.sanskritName?.trim();
    const snippet = useful[snippetIdx % useful.length];
    snippetIdx += 1;
    const parts: string[] = [];
    if (sanskrit) {
      parts.push(`Sanskrit: ${sanskrit}.`);
    }
    if (idx % 2 === 0 && snippet.text) {
      const cuePrefix = snippet.type === "breath" ? "Breath cue" : "Mindful cue";
      parts.push(`${cuePrefix}: ${snippet.text}`);
    }
    if (parts.length === 0) return step;
    return {
      ...step,
      instruction: ensureDetailedInstruction(
        bundle,
        step.poseId,
        `${step.instruction.trim()} ${parts.join(" ")}`.trim(),
      ),
    };
  });
  return { ...payload, steps };
}

export function clampRoutineToAllowedPoses(
  bundle: CorpusBundle,
  payload: GeneratedRoutinePayload,
  allowedPoseIds: Set<string>,
): GeneratedRoutinePayload {
  const fallbackPose = allowedPoseIds.values().next().value ?? "easy_seated";
  const steps = payload.steps.map((step) => {
    if (allowedPoseIds.has(step.poseId)) return step;
    const substitute = substitutionForPoseId(bundle, step.poseId);
    const nextPose = substitute && allowedPoseIds.has(substitute) ? substitute : fallbackPose;
    return {
      ...step,
      poseId: nextPose,
      instruction: `${step.instruction} (Adjusted to an approved pose.)`,
    };
  });
  return { ...payload, steps };
}

export function finalizeRoutineFlow(
  bundle: CorpusBundle,
  payload: GeneratedRoutinePayload,
  options?: { candidateRoutines?: CuratedRoutine[]; request?: RoutineRequest },
): GeneratedRoutinePayload {
  const deduped: GeneratedRoutineStep[] = [];
  const seenPoseIds = new Set<string>();
  for (const step of payload.steps) {
    if (seenPoseIds.has(step.poseId)) continue;
    seenPoseIds.add(step.poseId);
    deduped.push({
      ...step,
      media: {
        ...step.media,
        imageUrl: step.media.imageUrl?.startsWith("/")
          ? step.media.imageUrl
          : localImageForPose(bundle, step.poseId),
      },
    });
  }

  const steps =
    deduped.length > 0
      ? deduped
      : [buildLocalStep(bundle, "easy_seated", "Sit comfortably and settle your breath.", 60)];

  if (!WARMUP_POSE_IDS.has(steps[0].poseId)) {
    steps.unshift(buildLocalStep(bundle, "easy_seated", "Sit comfortably and settle your breath.", 60));
  }

  const existingRestIdx = steps.findIndex(
    (step) => step.poseId === REST_POSE_ID || step.poseId === "shavasana",
  );
  let restStep: GeneratedRoutineStep | null = null;
  if (existingRestIdx >= 0) {
    const existing = steps[existingRestIdx];
    steps.splice(existingRestIdx, 1);
    restStep = {
      ...existing,
      poseId: REST_POSE_ID,
      durationSeconds: 120,
      media: {
        ...existing.media,
        imageUrl: localImageForPose(bundle, REST_POSE_ID),
      },
    };
  } else {
    restStep = buildLocalStep(
      bundle,
      REST_POSE_ID,
      "Rest on your back in Savasana, allowing your breath to settle naturally.",
      120,
    );
  }

  const compactedCore = steps.filter(
    (step, idx) => idx === 0 || steps[idx - 1]?.poseId !== step.poseId,
  );
  if (!compactedCore.some((step) => COOLDOWN_POSE_IDS.has(step.poseId))) {
    compactedCore.push(
      buildLocalStep(bundle, "supine_twist", "Lie on your back and release gently side to side.", 60),
    );
  }

  const targetCoreSeconds = 480;
  let coreSeconds = compactedCore.reduce((acc, step) => acc + (step.durationSeconds || 0), 0);
  const pool = options?.candidateRoutines ?? [];
  if (coreSeconds < targetCoreSeconds && pool.length > 0) {
    const used = new Set(compactedCore.map((step) => step.poseId));
    for (const routine of pool) {
      for (const routineStep of routine.steps) {
        if (coreSeconds >= targetCoreSeconds) break;
        if (routineStep.poseId === REST_POSE_ID || routineStep.poseId === "shavasana") continue;
        if (used.has(routineStep.poseId)) continue;
        const cue = routineStep.cues[0] ?? "Move with steady breath and a comfortable range.";
        compactedCore.push(buildLocalStep(bundle, routineStep.poseId, cue, routineStep.durationSeconds));
        used.add(routineStep.poseId);
        coreSeconds += routineStep.durationSeconds;
      }
      if (coreSeconds >= targetCoreSeconds) break;
    }
  }
  if (coreSeconds < targetCoreSeconds && compactedCore.length > 0) {
    const deficit = targetCoreSeconds - coreSeconds;
    const idx = Math.max(0, compactedCore.length - 1);
    compactedCore[idx] = {
      ...compactedCore[idx],
      durationSeconds: (compactedCore[idx].durationSeconds || 60) + deficit,
    };
  }

  compactedCore.push(restStep);
  const withDetailedInstructions = compactedCore.map((step) => ({
    ...step,
    instruction: ensureDetailedInstruction(bundle, step.poseId, step.instruction),
  }));
  const totalSeconds = withDetailedInstructions.reduce(
    (acc, step) => acc + (step.durationSeconds || 0),
    0,
  );
  const suggestedStyle = suggestYogaStyle(options?.request);
  return {
    ...payload,
    yogaStyle: suggestedStyle ?? payload.yogaStyle,
    totalDurationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
    steps: withDetailedInstructions,
  };
}

function suggestYogaStyle(
  request: RoutineRequest | undefined,
): GeneratedRoutinePayload["yogaStyle"] | null {
  if (!request) return null;
  const discomfort = new Set(request.discomfortTypes);
  const regions = new Set(request.bodyRegions);
  let category: (typeof STYLE_ROTATION)[number] = "Hatha";

  if (request.intensity === "moderate" && discomfort.has("fatigue")) {
    category = "Vinyasa";
  } else if (
    discomfort.has("stiffness") ||
    regions.has("hips") ||
    (request.intensity === "mild" && regions.has("back"))
  ) {
    category = "Yin";
  } else if (discomfort.has("stress") || discomfort.has("tension") || request.intensity === "severe") {
    category = "Restorative";
  } else {
    const seed = request.bodyRegions.join("|").length + request.discomfortTypes.join("|").length;
    category = STYLE_ROTATION[seed % STYLE_ROTATION.length];
  }

  const rationale =
    category === "Vinyasa"
      ? "A gentle Vinyasa pace adds steady movement to lift energy while keeping transitions controlled."
      : category === "Yin"
        ? "A Yin-inspired pace supports longer, softer holds to ease stiffness and improve mobility."
        : category === "Restorative"
          ? "A Restorative approach emphasizes down-regulation, breath awareness, and low-intensity release."
          : "A Hatha structure keeps the session balanced with clear, steady steps for safe movement.";

  return { category, rationale };
}
