/**
 * Cross-check generated or mock steps against static "poses to avoid" (SC-002 support).
 */

export interface SimpleStep {
  poseId: string;
  instruction: string;
}

export function validateRoutineAgainstAvoidList(
  steps: SimpleStep[],
  posesToAvoid: string[],
): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  const avoidLower = posesToAvoid.map((p) => p.toLowerCase());

  for (const step of steps) {
    const pid = step.poseId.toLowerCase();
    const instr = step.instruction.toLowerCase();
    for (const avoid of avoidLower) {
      const token = avoid.replace(/\s+/g, "_");
      if (pid.includes(avoid) || pid.includes(token) || instr.includes(avoid)) {
        violations.push(`Step ${step.poseId} may conflict with avoided concept "${avoid}"`);
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

/** FR-006 helper: total duration should approximate ~10 minutes (540–780 seconds). */
export function totalDurationSeconds(steps: { durationSeconds?: number }[]): number {
  return steps.reduce((a, s) => a + (s.durationSeconds ?? 0), 0);
}

export function isApproxTenMinutes(totalSeconds: number, tolerance = 120): boolean {
  const target = 600;
  return Math.abs(totalSeconds - target) <= tolerance;
}
