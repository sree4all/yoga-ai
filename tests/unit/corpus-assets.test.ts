import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import { applyCorpusStillImageDefaults } from "@/lib/corpus/bundle";
import { corpusBundleSchema } from "@/lib/corpus/corpus-zod";

describe("corpus still-image defaults", () => {
  it("applies indexed image paths", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const out = applyCorpusStillImageDefaults(parsed, {
      title: "test",
      totalDurationMinutes: 10,
      yogaStyle: { category: "Hatha", rationale: "test" },
      steps: [
        {
          poseId: "cat",
          instruction: "Move",
          durationSeconds: 60,
          media: { imageUrl: "https://example.com/placeholder.png", videoLabel: "x" },
        },
      ],
    });
    expect(out.steps[0].media.imageUrl).toMatch(/^\/routine-corpus\/assets\//);
  });

  it("keeps valid numbered filenames and remaps legacy aliases", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const out = applyCorpusStillImageDefaults(parsed, {
      title: "test",
      totalDurationMinutes: 10,
      yogaStyle: { category: "Hatha", rationale: "test" },
      steps: [
        {
          poseId: "warrior_1",
          instruction: "Move",
          durationSeconds: 60,
          media: { imageUrl: "https://example.com/placeholder.png", videoLabel: "x" },
        },
        {
          poseId: "standing_forward_fold",
          instruction: "Move",
          durationSeconds: 60,
          media: { imageUrl: "https://example.com/placeholder.png", videoLabel: "x" },
        },
      ],
    });
    expect(out.steps[0].media.imageUrl).toBe("/routine-corpus/assets/yoga-warrior-1.svg");
    expect(out.steps[1].media.imageUrl).toBe("/routine-corpus/assets/yoga-standing-forward-fold.svg");
  });
});
