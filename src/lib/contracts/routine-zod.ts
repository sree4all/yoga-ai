import { z } from "zod";

const discomfortTypeEnum = z.enum([
  "stress",
  "tension",
  "stiffness",
  "fatigue",
  "other",
]);

const bodyRegionEnum = z.enum([
  "neck",
  "shoulders",
  "back",
  "hips",
  "whole_body",
  "other",
]);

function uniqueNonEmptyArray<T extends z.ZodTypeAny>(item: T, label: string) {
  return z
    .array(item)
    .min(1, `${label} requires at least one selection`)
    .refine(
      (arr) => new Set(arr).size === arr.length,
      `${label} must not contain duplicates`,
    );
}

export const routineRequestSchema = z
  .object({
    disclaimerAcknowledged: z.literal(true),
    discomfortTypes: uniqueNonEmptyArray(discomfortTypeEnum, "discomfortTypes"),
    bodyRegions: uniqueNonEmptyArray(bodyRegionEnum, "bodyRegions"),
    intensity: z.enum(["mild", "moderate", "severe"]),
    optionalNote: z.string().max(500).optional(),
  })
  .strict();

export type RoutineRequest = z.infer<typeof routineRequestSchema>;

const breathingStepSchema = z
  .object({
    instruction: z.string(),
    durationSeconds: z.number().min(0).optional(),
  })
  .strict();

const optionalYoutubeHttpsUrl = z
  .string()
  .url()
  .refine(
    (u) =>
      u.startsWith("https://") &&
      (/youtube\.com\//i.test(u) || /youtu\.be\//i.test(u)),
    { message: "Must be an https YouTube watch or youtu.be URL" },
  );

const stepMediaSchema = z
  .object({
    imageUrl: z.string().min(1),
    imageAttribution: z.string().optional(),
    videoUrl: optionalYoutubeHttpsUrl.optional(),
    videoTitle: z.string().optional(),
    videoLabel: z.string().min(1),
  })
  .strict();

const routineStepSchema = z
  .object({
    poseId: z.string(),
    instruction: z.string(),
    durationSeconds: z.number().min(0).optional(),
    media: stepMediaSchema,
  })
  .strict();

const yogaStyleSchema = z
  .object({
    category: z.string().min(1),
    rationale: z.string().min(1),
  })
  .strict();

const safeRoutineSchema = z
  .object({
    kind: z.literal("safe_routine"),
    disclaimer: z.string(),
    routine: z
      .object({
        title: z.string(),
        totalDurationMinutes: z.number().min(1).max(30),
        yogaStyle: yogaStyleSchema,
        steps: z.array(routineStepSchema).min(1),
      })
      .strict(),
  })
  .strict();

const restrictedSchema = z
  .object({
    kind: z.literal("restricted"),
    disclaimer: z.string(),
    restricted: z
      .object({
        breathingSteps: z.array(breathingStepSchema).min(1),
        careGuidance: z.string().optional(),
      })
      .strict(),
  })
  .strict();

const generationFallbackSchema = z
  .object({
    kind: z.literal("generation_fallback"),
    disclaimer: z.string(),
    fallback: z
      .object({
        message: z.string(),
        breathingSteps: z.array(breathingStepSchema).min(1),
        retryAvailable: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const routineResponseSchema = z.discriminatedUnion("kind", [
  safeRoutineSchema,
  restrictedSchema,
  generationFallbackSchema,
]);

export type RoutineResponse = z.infer<typeof routineResponseSchema>;
