import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import {
  corpusBundleSchema,
  validateCorpusBundle,
  validateNoVideoFields,
  validatePoseCoverage,
  validateRoutineDuration,
} from "@/lib/corpus/corpus-zod";

describe("corpus validation helpers", () => {
  it("accepts valid routine durations", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const issues = validateRoutineDuration(parsed.routines[0]);
    expect(issues).toHaveLength(0);
  });

  it("rejects video-like fields in corpus", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const json = JSON.parse(JSON.stringify(parsed)) as typeof parsed;
    json.enrichmentLibrary = [
      ...(json.enrichmentLibrary ?? []),
      { id: "bad", type: "mindfulness", text: "watch youtube.com/video here" },
    ];
    const issues = validateNoVideoFields(json);
    expect(issues.some((i) => i.code === "video_forbidden")).toBe(true);
  });

  it("detects missing pose ids", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const json = JSON.parse(JSON.stringify(parsed)) as typeof parsed;
    json.routines[0].steps[0].poseId = "unknown_pose";
    const issues = validatePoseCoverage(json);
    expect(issues.some((i) => i.code === "unknown_pose_id")).toBe(true);
  });

  it("validates complete bundle", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    const issues = validateCorpusBundle(parsed);
    expect(issues).toHaveLength(0);
  });
});
