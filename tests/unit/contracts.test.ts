import { describe, it, expect } from "vitest";
import {
  routineRequestSchema,
  routineResponseSchema,
} from "@/lib/contracts/routine-zod";

describe("routineRequestSchema", () => {
  it("accepts valid payload", () => {
    const r = routineRequestSchema.safeParse({
      disclaimerAcknowledged: true,
      discomfortType: "stress",
      bodyRegion: "whole_body",
      intensity: "mild",
    });
    expect(r.success).toBe(true);
  });

  it("rejects false disclaimer", () => {
    const r = routineRequestSchema.safeParse({
      disclaimerAcknowledged: false,
      discomfortType: "stress",
      bodyRegion: "whole_body",
      intensity: "mild",
    });
    expect(r.success).toBe(false);
  });
});

describe("routineResponseSchema", () => {
  it("accepts safe_routine", () => {
    const r = routineResponseSchema.safeParse({
      kind: "safe_routine",
      disclaimer: "x",
      routine: {
        title: "Test",
        totalDurationMinutes: 10,
        steps: [{ poseId: "a", instruction: "b", durationSeconds: 60 }],
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts generation_fallback", () => {
    const r = routineResponseSchema.safeParse({
      kind: "generation_fallback",
      disclaimer: "x",
      fallback: {
        message: "m",
        breathingSteps: [{ instruction: "breathe" }],
        retryAvailable: true,
      },
    });
    expect(r.success).toBe(true);
  });
});
