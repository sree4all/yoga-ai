/** Domain types aligned with specs/001-yoga-ai-mvp/data-model.md */

export type Intensity = "mild" | "moderate" | "severe";

/** Curated values used in UI and API */
export type DiscomfortType =
  | "stress"
  | "tension"
  | "stiffness"
  | "fatigue"
  | "other";

export type BodyRegion =
  | "neck"
  | "shoulders"
  | "back"
  | "hips"
  | "whole_body"
  | "other";

export type SafetyPath = "safe" | "restricted";

export interface IntakeSession {
  sessionId: string;
  disclaimerAcknowledged: boolean;
  discomfortType: DiscomfortType | null;
  bodyRegion: BodyRegion | null;
  intensity: Intensity | null;
  optionalNote: string;
}

export interface SafetyEvaluation {
  path: SafetyPath;
  triggers: string[];
  matchedTerms: string[];
}

export interface DiscomfortProfile {
  discomfortType: DiscomfortType;
  bodyRegion: BodyRegion;
  intensity: Intensity;
  /** Key into static knowledge module */
  knowledgeKey: string;
}

export interface PoseStep {
  poseId: string;
  durationSeconds: number;
  cues: string[];
}

export interface BreathingScript {
  steps: { instruction: string; durationSeconds?: number }[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  sequence: PoseStep[];
  posesToAvoid: string[];
  breathingFallback: BreathingScript;
}
