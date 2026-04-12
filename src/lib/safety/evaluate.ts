import type { Intensity } from "@/lib/types/intake";
import { findMatchedRiskTerms } from "@/lib/safety/risk-terms";

export interface IntakeForSafety {
  intensity: Intensity;
  optionalNote?: string;
}

export interface SafetyResult {
  path: "safe" | "restricted";
  triggers: string[];
  matchedTerms: string[];
}

/**
 * Deterministic safety evaluation — no LLM (FR-003).
 */
export function evaluateSafety(input: IntakeForSafety): SafetyResult {
  const triggers: string[] = [];
  const matchedTerms = findMatchedRiskTerms(input.optionalNote ?? "");

  if (input.intensity === "severe") {
    triggers.push("severity:severe");
  }

  for (const t of matchedTerms) {
    triggers.push(`term:${t}`);
  }

  if (input.intensity === "severe" || matchedTerms.length > 0) {
    return {
      path: "restricted",
      triggers,
      matchedTerms,
    };
  }

  return { path: "safe", triggers: [], matchedTerms: [] };
}
