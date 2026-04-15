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
const FALLBACK_LOCAL_IMAGE = "/routine-corpus/assets/yoga-easy-seated.svg";
const REST_POSE_ID = "savasana";
const WARMUP_POSE_IDS = new Set(["easy_seated", "cat", "cow", "childs_pose"]);
const COOLDOWN_POSE_IDS = new Set(["childs_pose", "bound_angle", "supine_twist", "happy_baby"]);

function normalizeAssetPath(pathValue: string): string {
  const normalized = pathValue
    .replace(/\\/g, "/")
    .replace(/-([0-9]+)\.svg$/i, ".svg")
    .replace("yoga-easy.svg", "yoga-easy-seated.svg");
  return normalized;
}

function localImageForPose(bundle: CorpusBundle, poseId: string): string {
  const configuredPath = bundle.poseAssetIndex[poseId]?.stillImage?.path;
  if (!configuredPath) return FALLBACK_LOCAL_IMAGE;
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
    instruction,
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
  let snippetIdx = 0;
  const steps = payload.steps.map((step, idx) => {
    const entry = bundle.poseAssetIndex[step.poseId];
    const sanskrit = entry?.sanskritName?.trim();
    const snippet = snippets[snippetIdx % snippets.length];
    snippetIdx += 1;
    const parts: string[] = [];
    if (sanskrit) {
      parts.push(`Sanskrit: ${sanskrit}.`);
    }
    if (idx % 2 === 0 && snippet.text) {
      parts.push(snippet.text);
    }
    if (parts.length === 0) return step;
    return {
      ...step,
      instruction: `${step.instruction} ${parts.join(" ")}`.trim(),
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
        imageUrl: step.media.imageUrl?.trim() || localImageForPose(bundle, step.poseId),
      },
    });
  }

  const steps = deduped.length > 0 ? deduped : [buildLocalStep(bundle, "easy_seated", "Sit comfortably and settle your breath.", 60)];

  if (!WARMUP_POSE_IDS.has(steps[0].poseId)) {
    steps.unshift(buildLocalStep(bundle, "easy_seated", "Sit comfortably and settle your breath.", 60));
  }

  if (!steps.some((step) => COOLDOWN_POSE_IDS.has(step.poseId))) {
    steps.push(buildLocalStep(bundle, "supine_twist", "Lie on your back and release gently side to side.", 60));
  }

  const existingRestIdx = steps.findIndex(
    (step) => step.poseId === REST_POSE_ID || step.poseId === "shavasana",
  );
  if (existingRestIdx >= 0) {
    const existing = steps[existingRestIdx];
    steps.splice(existingRestIdx, 1);
    steps.push({
      ...existing,
      poseId: REST_POSE_ID,
      durationSeconds: existing.durationSeconds || 120,
      media: {
        ...existing.media,
        imageUrl: localImageForPose(bundle, REST_POSE_ID),
      },
    });
  } else {
    steps.push(
      buildLocalStep(
        bundle,
        REST_POSE_ID,
        "Rest on your back in Savasana, allowing your breath to settle naturally.",
        120,
      ),
    );
  }

  const compacted = steps.filter(
    (step, idx) => idx === 0 || steps[idx - 1]?.poseId !== step.poseId,
  );
  const totalSeconds = compacted.reduce((acc, step) => acc + (step.durationSeconds || 0), 0);
  return {
    ...payload,
    totalDurationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
    steps: compacted,
  };
}
