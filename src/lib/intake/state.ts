import type { BodyRegion, DiscomfortType, Intensity } from "@/lib/types/intake";

export type IntakeStep =
  | "discomfortTypes"
  | "bodyRegions"
  | "intensity"
  | "optionalNote"
  | "review";

export interface IntakeFormState {
  discomfortTypes: DiscomfortType[];
  bodyRegions: BodyRegion[];
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

function toggleInList<T extends string>(list: T[], value: T): T[] {
  if (list.includes(value)) {
    return list.filter((x) => x !== value);
  }
  return [...list, value];
}

export function toggleDiscomfortType(
  state: IntakeFormState,
  value: DiscomfortType,
): Partial<IntakeFormState> {
  return { discomfortTypes: toggleInList(state.discomfortTypes, value) };
}

export function toggleBodyRegion(
  state: IntakeFormState,
  value: BodyRegion,
): Partial<IntakeFormState> {
  return { bodyRegions: toggleInList(state.bodyRegions, value) };
}

export function buildRoutineRequestBody(
  state: IntakeFormState,
): Record<string, unknown> | null {
  if (
    state.discomfortTypes.length === 0 ||
    state.bodyRegions.length === 0 ||
    !state.intensity
  ) {
    return null;
  }
  return {
    disclaimerAcknowledged: true,
    discomfortTypes: state.discomfortTypes,
    bodyRegions: state.bodyRegions,
    intensity: state.intensity,
    ...(state.optionalNote.trim()
      ? { optionalNote: state.optionalNote.trim() }
      : {}),
  };
}
