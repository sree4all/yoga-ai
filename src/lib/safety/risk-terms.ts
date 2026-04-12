/**
 * Curated high-risk substrings (English, lowercase comparison).
 * Extend via product review — FR-003.
 */
export const HIGH_RISK_SUBSTRINGS = [
  "hernia",
  "fracture",
  "broken bone",
  "tear",
  "surgery",
  "pregnant",
  "pregnancy",
  "stroke",
  "blood clot",
  "dvt",
  "cancer",
  "osteoporosis",
  "uncontrolled",
  "severe pain",
  "numbness",
  "tingling in face",
  "chest pain",
  "fainting",
  "chronic",
] as const;

export function findMatchedRiskTerms(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const term of HIGH_RISK_SUBSTRINGS) {
    if (lower.includes(term)) {
      matched.push(term);
    }
  }
  return matched;
}
