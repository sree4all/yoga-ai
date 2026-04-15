import { describe, expect, it } from "vitest";

import bundle from "../../docs/routine-corpus/bundle.json";
import { corpusBundleSchema } from "@/lib/corpus/corpus-zod";

describe("corpus bundle schema", () => {
  it("parses bundled corpus", () => {
    const parsed = corpusBundleSchema.parse(bundle);
    expect(parsed.bundleVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(parsed.routines.length).toBeGreaterThanOrEqual(12);
  });
});
