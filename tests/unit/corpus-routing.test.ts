import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import type { RoutineRequest } from "@/lib/contracts/routine-zod";
import {
  allowedPoseIdsForRoutines,
  clampRoutineToAllowedPoses,
  finalizeRoutineFlow,
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

  it("dedupes and enforces final savasana", () => {
    const out = finalizeRoutineFlow(parsed, {
      title: "X",
      totalDurationMinutes: 10,
      yogaStyle: { category: "Hatha", rationale: "x" },
      steps: [
        {
          poseId: "easy_seated",
          instruction: "Start",
          durationSeconds: 60,
          media: { imageUrl: "/routine-corpus/assets/yoga-easy-seated.svg", videoLabel: "x" },
        },
        {
          poseId: "easy_seated",
          instruction: "Repeat",
          durationSeconds: 60,
          media: { imageUrl: "/routine-corpus/assets/yoga-easy-seated.svg", videoLabel: "x" },
        },
        {
          poseId: "cat",
          instruction: "Move",
          durationSeconds: 60,
          media: { imageUrl: "https://example.com/a.png", videoLabel: "x" },
        },
      ],
    }, {
      candidateRoutines: routinesForTags(parsed, resolveCatalogTags(parsed, request)),
      request,
    });
    const ids = out.steps.map((step) => step.poseId);
    expect(ids.filter((id) => id === "easy_seated")).toHaveLength(1);
    expect(ids[ids.length - 1]).toBe("savasana");
    expect(out.totalDurationMinutes).toBeGreaterThanOrEqual(9);
    expect(out.yogaStyle.category).toBe("Restorative");
  });
});
