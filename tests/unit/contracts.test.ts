import { describe, it, expect } from "vitest";
import {
  routineRequestSchema,
  routineResponseSchema,
} from "@/lib/contracts/routine-zod";

describe("routineRequestSchema", () => {
  it("accepts valid payload", () => {
    const r = routineRequestSchema.safeParse({
      disclaimerAcknowledged: true,
      discomfortTypes: ["stress"],
      bodyRegions: ["whole_body"],
      intensity: "mild",
    });
    expect(r.success).toBe(true);
  });

  it("rejects duplicate discomfort types", () => {
    const r = routineRequestSchema.safeParse({
      disclaimerAcknowledged: true,
      discomfortTypes: ["stress", "stress"],
      bodyRegions: ["whole_body"],
      intensity: "mild",
    });
    expect(r.success).toBe(false);
  });

  it("rejects false disclaimer", () => {
    const r = routineRequestSchema.safeParse({
      disclaimerAcknowledged: false,
      discomfortTypes: ["stress"],
      bodyRegions: ["whole_body"],
      intensity: "mild",
    });
    expect(r.success).toBe(false);
  });
});

describe("routineResponseSchema", () => {
  it("accepts safe_routine with yogaStyle and media", () => {
    const r = routineResponseSchema.safeParse({
      kind: "safe_routine",
      disclaimer: "x",
      routine: {
        title: "Test",
        totalDurationMinutes: 10,
        yogaStyle: { category: "Hatha", rationale: "Gentle pacing." },
        steps: [
          {
            poseId: "a",
            instruction: "b",
            durationSeconds: 60,
            media: {
              imageUrl: "https://picsum.photos/seed/a/480/320",
              videoLabel: "Search: a yoga",
            },
          },
        ],
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
