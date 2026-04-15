import { describe, expect, it } from "vitest";

import schema from "../../specs/004-mvp4-routine-data-corpus/contracts/corpus-bundle.schema.json";
import { corpusBundleSchema, enrichmentSnippetSchema } from "@/lib/corpus/corpus-zod";

describe("corpus schema and zod stay aligned", () => {
  it("requires key top-level fields in both schema and zod", () => {
    const required = new Set(schema.required ?? []);
    expect(required.has("bundleVersion")).toBe(true);
    expect(required.has("routines")).toBe(true);
    expect(required.has("intakeMapping")).toBe(true);
    expect(required.has("poseAssetIndex")).toBe(true);

    const parsed = corpusBundleSchema.safeParse({
      bundleVersion: "1.0.0",
      schemaVersion: 1,
      routines: [],
      intakeMapping: {},
      poseAssetIndex: {},
    });
    expect(parsed.success).toBe(false);
  });

  it("keeps enrichment type enum consistent with schema", () => {
    const schemaEnum = schema.$defs?.enrichmentSnippet?.properties?.type?.enum as
      | string[]
      | undefined;
    expect(schemaEnum).toBeTruthy();
    for (const value of schemaEnum ?? []) {
      const out = enrichmentSnippetSchema.safeParse({
        id: "x",
        type: value,
        text: "ok",
      });
      expect(out.success).toBe(true);
    }
  });
});
