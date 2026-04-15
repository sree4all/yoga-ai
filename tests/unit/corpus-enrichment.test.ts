import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import { applyCorpusInstructionEnrichment } from "@/lib/corpus/bundle";
import {
  corpusBundleSchema,
  validateSecularAndEnglish,
} from "@/lib/corpus/corpus-zod";

describe("corpus enrichment policy", () => {
  it("enriches instruction with optional sanskrit/snippet text", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const out = applyCorpusInstructionEnrichment(parsed, {
      title: "test",
      totalDurationMinutes: 10,
      yogaStyle: { category: "Hatha", rationale: "test" },
      steps: [
        {
          poseId: "easy_seated",
          instruction: "Sit tall.",
          durationSeconds: 60,
          media: { imageUrl: "/x.svg", videoLabel: "x" },
        },
      ],
    });
    expect(out.steps[0].instruction.length).toBeGreaterThan("Sit tall.".length);
  });

  it("flags spiritual terms when present", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const clone = JSON.parse(JSON.stringify(parsed)) as typeof parsed;
    clone.enrichmentLibrary = [
      ...(clone.enrichmentLibrary ?? []),
      { id: "bad", type: "mindfulness", text: "Focus on chakra opening now." },
    ];
    const issues = validateSecularAndEnglish(clone);
    expect(issues.some((issue) => issue.code === "spiritual_term_forbidden")).toBe(
      true,
    );
  });
});
