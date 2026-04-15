import type {
  BodyRegion,
  DiscomfortType,
  DiscomfortProfile,
  Intensity,
} from "@/lib/types/intake";

/**
 * Map intake to a knowledge module key.
 * Priority: neck/shoulders → stiffness → back → hips → fatigue → stress/whole body → default.
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

  if (types.has("stiffness")) {
    return "stiffness_slow_mild";
  }

  if (regions.has("back")) {
    return "back_care_mild";
  }

  if (regions.has("hips")) {
    return "hips_mobility_mild";
  }

  if (types.has("fatigue")) {
    return "fatigue_gentle_flow_mild";
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
