import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import type { CorpusBundle } from "@/lib/corpus/corpus-zod";
import { resolveCatalogTags, routinesForTags } from "@/lib/corpus/bundle";

export interface ResolvedCorpusSelection {
  tags: string[];
  routineIds: string[];
  allowedPoseIds: string[];
}

export function resolveCorpusSelection(
  bundle: CorpusBundle,
  request: RoutineRequest,
): ResolvedCorpusSelection {
  const tags = resolveCatalogTags(bundle, request);
  const routines = routinesForTags(bundle, tags);
  const poseSet = new Set<string>();
  for (const routine of routines) {
    for (const step of routine.steps) {
      poseSet.add(step.poseId);
    }
  }
  return {
    tags,
    routineIds: routines.map((r) => r.id),
    allowedPoseIds: Array.from(poseSet),
  };
}
