import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import {
  allowedPoseIdsForRoutines,
  clampRoutineToAllowedPoses,
  resolveCatalogTags,
  routinesForTags,
} from "@/lib/corpus/bundle";
import { corpusBundleSchema } from "@/lib/corpus/corpus-zod";

describe("corpus routing and constraints", () => {
  const parsed = corpusBundleSchema.parse(bundle);
  const request: RoutineRequest = {
    disclaimerAcknowledged: true,
    discomfortTypes: ["stress"],
    bodyRegions: ["neck"],
    intensity: "mild",
    optionalNote: "test",
  };

  it("resolves catalog tags from intake", () => {
    const tags = resolveCatalogTags(parsed, request);
    expect(tags).toContain("stress_relief");
    expect(tags.length).toBeGreaterThan(0);
  });

  it("filters routines by tags", () => {
    const tags = resolveCatalogTags(parsed, request);
    const routines = routinesForTags(parsed, tags);
    expect(routines.length).toBeGreaterThan(0);
  });

  it("clamps unknown poses to allowed set", () => {
    const tags = resolveCatalogTags(parsed, request);
    const routines = routinesForTags(parsed, tags);
    const allowed = new Set(allowedPoseIdsForRoutines(routines));
    const clamped = clampRoutineToAllowedPoses(
      parsed,
      {
        title: "X",
        totalDurationMinutes: 10,
        yogaStyle: { category: "Hatha", rationale: "x" },
        steps: [
          {
            poseId: "unknown_pose",
            instruction: "Move",
            durationSeconds: 60,
            media: { imageUrl: "https://example.com/a.png", videoLabel: "x" },
          },
        ],
      },
      allowed,
    );
    expect(allowed.has(clamped.steps[0].poseId)).toBe(true);
  });
});
