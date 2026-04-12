import type {
  BodyRegion,
  DiscomfortType,
  DiscomfortProfile,
  Intensity,
} from "@/lib/types/intake";

/**
 * Map intake to a knowledge module key. Conservative defaults when unknown.
 */
export function selectKnowledgeKey(
  discomfortType: DiscomfortType,
  bodyRegion: BodyRegion,
  intensity: Intensity,
): string {
  if (intensity === "severe") {
    throw new Error("selectKnowledgeKey should not run for severe — safety path first");
  }

  if (bodyRegion === "neck" || bodyRegion === "shoulders") {
    return "neck_tension_mild";
  }

  if (discomfortType === "stress" || bodyRegion === "whole_body") {
    return "stress_whole_mild";
  }

  return "stress_whole_mild";
}

export function buildDiscomfortProfile(
  discomfortType: DiscomfortType,
  bodyRegion: BodyRegion,
  intensity: Intensity,
): DiscomfortProfile {
  const knowledgeKey = selectKnowledgeKey(discomfortType, bodyRegion, intensity);
  return {
    discomfortType,
    bodyRegion,
    intensity,
    knowledgeKey,
  };
}
