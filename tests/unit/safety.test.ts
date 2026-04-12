import { describe, it, expect } from "vitest";
import { evaluateSafety } from "@/lib/safety/evaluate";

describe("evaluateSafety", () => {
  it("restricts severe intensity", () => {
    const r = evaluateSafety({ intensity: "severe" });
    expect(r.path).toBe("restricted");
    expect(r.triggers.some((t) => t.includes("severe"))).toBe(true);
  });

  it("restricts when optional note matches risk term", () => {
    const r = evaluateSafety({
      intensity: "mild",
      optionalNote: "I was told I have a hernia",
    });
    expect(r.path).toBe("restricted");
    expect(r.matchedTerms).toContain("hernia");
  });

  it("safe for mild with no risk terms", () => {
    const r = evaluateSafety({
      intensity: "mild",
      optionalNote: "long day at desk",
    });
    expect(r.path).toBe("safe");
  });
});
