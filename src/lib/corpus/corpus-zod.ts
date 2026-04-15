import { z } from "zod";

const BANNED_SPIRITUAL_TERMS = [
  "chakra",
  "kundalini",
  "scripture",
  "deity",
  "mantra",
  "sutra",
  "religion",
  "spiritual doctrine",
];

const enrichmentTypeSchema = z.enum([
  "quote",
  "breath",
  "mindfulness",
  "sanskrit_gloss",
]);

export const corpusStepSchema = z
  .object({
    poseId: z.string().min(1),
    durationSeconds: z.number().int().min(5).max(600),
    cues: z.array(z.string().min(1)).min(1),
    sanskritName: z.string().min(1).optional(),
    quoteRef: z.string().min(1).optional(),
  })
  .strict();

export const curatedRoutineSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    totalDurationSeconds: z.number().int().min(300).max(900),
    catalogTags: z.array(z.string().min(1)).min(1),
    steps: z.array(corpusStepSchema).min(1),
    enrichmentRefs: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const poseAssetEntrySchema = z
  .object({
    displayName: z.string().min(1),
    sanskritName: z.string().min(1).optional(),
    stillImage: z
      .object({
        path: z.string().min(1).optional(),
        sourceTrainingDataPath: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
    fallback: z.boolean().optional(),
  })
  .strict();

export const enrichmentSnippetSchema = z
  .object({
    id: z.string().min(1),
    type: enrichmentTypeSchema,
    text: z.string().min(1),
    attribution: z.string().min(1).optional(),
  })
  .strict();

export const corpusBundleSchema = z
  .object({
    bundleVersion: z
      .string()
      .regex(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/,
        "bundleVersion must be semver",
      ),
    schemaVersion: z.number().int().min(1),
    routines: z.array(curatedRoutineSchema).min(1),
    intakeMapping: z.record(z.array(z.string().min(1))),
    poseAssetIndex: z.record(poseAssetEntrySchema),
    enrichmentLibrary: z.array(enrichmentSnippetSchema).optional(),
    safetySubstitutions: z.record(z.string().min(1)).optional(),
  })
  .strict();

export type CorpusBundle = z.infer<typeof corpusBundleSchema>;
export type CuratedRoutine = z.infer<typeof curatedRoutineSchema>;
export type CorpusStep = z.infer<typeof corpusStepSchema>;
export type EnrichmentSnippet = z.infer<typeof enrichmentSnippetSchema>;

export interface CorpusValidationIssue {
  code: string;
  message: string;
}

export function durationTotalSeconds(steps: CorpusStep[]): number {
  return steps.reduce((acc, step) => acc + step.durationSeconds, 0);
}

export function validateRoutineDuration(
  routine: CuratedRoutine,
  toleranceSeconds = 30,
): CorpusValidationIssue[] {
  const sum = durationTotalSeconds(routine.steps);
  const min = 600 - toleranceSeconds;
  const max = 600 + toleranceSeconds;
  if (sum < min || sum > max) {
    return [
      {
        code: "duration_out_of_range",
        message: `Routine ${routine.id} totals ${sum}s (expected ${min}-${max}s)`,
      },
    ];
  }
  return [];
}

export function validateNoVideoFields(bundle: CorpusBundle): CorpusValidationIssue[] {
  const issues: CorpusValidationIssue[] = [];
  const videoPattern = /(youtube\.com|youtu\.be|\.mp4|videoUrl|videoTitle)/i;
  const serialized = JSON.stringify(bundle);
  if (videoPattern.test(serialized)) {
    issues.push({
      code: "video_forbidden",
      message: "Corpus bundle contains video-like fields or values",
    });
  }
  return issues;
}

export function validatePoseCoverage(bundle: CorpusBundle): CorpusValidationIssue[] {
  const issues: CorpusValidationIssue[] = [];
  const poseIds = new Set(Object.keys(bundle.poseAssetIndex));
  const substitutions = new Set(Object.keys(bundle.safetySubstitutions ?? {}));
  for (const routine of bundle.routines) {
    for (const step of routine.steps) {
      if (!poseIds.has(step.poseId) && !substitutions.has(step.poseId)) {
        issues.push({
          code: "unknown_pose_id",
          message: `Routine ${routine.id} references missing poseId '${step.poseId}'`,
        });
      }
    }
  }
  return issues;
}

export function validateSecularAndEnglish(bundle: CorpusBundle): CorpusValidationIssue[] {
  const issues: CorpusValidationIssue[] = [];
  const englishLike = /^[\x09\x0A\x0D\x20-\x7E]+$/;
  const snippets = bundle.enrichmentLibrary ?? [];
  for (const snippet of snippets) {
    const lowered = snippet.text.toLowerCase();
    if (BANNED_SPIRITUAL_TERMS.some((term) => lowered.includes(term))) {
      issues.push({
        code: "spiritual_term_forbidden",
        message: `Snippet '${snippet.id}' contains forbidden spiritual term`,
      });
    }
    if (!englishLike.test(snippet.text)) {
      issues.push({
        code: "non_english_text",
        message: `Snippet '${snippet.id}' appears non-English/non-ASCII`,
      });
    }
  }

  for (const routine of bundle.routines) {
    for (const cue of routine.steps.flatMap((s) => s.cues)) {
      const lowered = cue.toLowerCase();
      if (BANNED_SPIRITUAL_TERMS.some((term) => lowered.includes(term))) {
        issues.push({
          code: "spiritual_term_forbidden",
          message: `Routine '${routine.id}' cue contains forbidden spiritual term`,
        });
      }
    }
  }
  return issues;
}

export function validateCorpusBundle(
  bundle: CorpusBundle,
  toleranceSeconds = 30,
): CorpusValidationIssue[] {
  const issues: CorpusValidationIssue[] = [];
  for (const routine of bundle.routines) {
    issues.push(...validateRoutineDuration(routine, toleranceSeconds));
  }
  issues.push(...validateNoVideoFields(bundle));
  issues.push(...validatePoseCoverage(bundle));
  issues.push(...validateSecularAndEnglish(bundle));
  return issues;
}
