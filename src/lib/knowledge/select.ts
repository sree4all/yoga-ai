import type {
  BodyRegion,
  DiscomfortType,
  DiscomfortProfile,
  Intensity,
} from "@/lib/types/intake";

/**
 * Map intake to a knowledge module key. Conservative defaults when signals combine.
 */
export function selectKnowledgeKey(
  discomfortTypes: DiscomfortType[],
  bodyRegions: BodyRegion[],
  intensity: Intensity,
): string {
  if (intensity === "severe") {
    throw new Error(
      "selectKnowledgeKey should not run for severe — safety path first",
    );
  }

  const regions = new Set(bodyRegions);
  const types = new Set(discomfortTypes);

  if (regions.has("neck") || regions.has("shoulders")) {
    return "neck_tension_mild";
  }

  if (types.has("stress") || regions.has("whole_body")) {
    return "stress_whole_mild";
  }

  return "stress_whole_mild";
}

export function buildDiscomfortProfile(
  discomfortTypes: DiscomfortType[],
  bodyRegions: BodyRegion[],
  intensity: Intensity,
): DiscomfortProfile {
  const knowledgeKey = selectKnowledgeKey(
    discomfortTypes,
    bodyRegions,
    intensity,
  );
  return {
    discomfortTypes,
    bodyRegions,
    intensity,
    knowledgeKey,
  };
}
