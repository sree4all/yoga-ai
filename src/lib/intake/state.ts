import type { BodyRegion, DiscomfortType, Intensity } from "@/lib/types/intake";

export type IntakeStep =
  | "discomfortType"
  | "bodyRegion"
  | "intensity"
  | "optionalNote"
  | "review";

export interface IntakeFormState {
  discomfortType: DiscomfortType | "";
  bodyRegion: BodyRegion | "";
  intensity: Intensity | "";
  optionalNote: string;
}

export const DISCOMFORT_OPTIONS: { value: DiscomfortType; label: string }[] = [
  { value: "stress", label: "Stress / mental load" },
  { value: "tension", label: "Muscle tension" },
  { value: "stiffness", label: "Stiffness" },
  { value: "fatigue", label: "Fatigue / low energy" },
  { value: "other", label: "Other (describe in notes)" },
];

export const REGION_OPTIONS: { value: BodyRegion; label: string }[] = [
  { value: "neck", label: "Neck" },
  { value: "shoulders", label: "Shoulders" },
  { value: "back", label: "Back" },
  { value: "hips", label: "Hips" },
  { value: "whole_body", label: "Whole body" },
  { value: "other", label: "Other" },
];

export const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export function buildRoutineRequestBody(
  state: IntakeFormState,
): Record<string, unknown> | null {
  if (
    !state.discomfortType ||
    !state.bodyRegion ||
    !state.intensity
  ) {
    return null;
  }
  return {
    disclaimerAcknowledged: true,
    discomfortType: state.discomfortType,
    bodyRegion: state.bodyRegion,
    intensity: state.intensity,
    ...(state.optionalNote.trim()
      ? { optionalNote: state.optionalNote.trim() }
      : {}),
  };
}
