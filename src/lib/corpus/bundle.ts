import { readFile } from "node:fs/promises";

import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import type { GeneratedRoutinePayload } from "@/lib/gen/orchestrator";
import {
  corpusBundleSchema,
  type CorpusBundle,
  type CuratedRoutine,
  validateCorpusBundle,
} from "@/lib/corpus/corpus-zod";
import { ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX, ROUTINE_CORPUS_BUNDLE_PATH } from "@/lib/corpus/paths";

let memoizedBundle: CorpusBundle | null = null;
let memoizedBundleMtime: string | null = null;

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
    const imageUrl = configuredPath.startsWith("/")
      ? configuredPath
      : `${ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX}${configuredPath}`;
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
