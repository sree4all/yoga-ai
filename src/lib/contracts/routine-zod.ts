import { z } from "zod";

export const routineRequestSchema = z
  .object({
    disclaimerAcknowledged: z.literal(true),
    discomfortType: z.string().min(1),
    bodyRegion: z.string().min(1),
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

const routineStepSchema = z
  .object({
    poseId: z.string(),
    instruction: z.string(),
    durationSeconds: z.number().min(0).optional(),
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
