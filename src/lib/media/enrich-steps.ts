import "server-only";

import type { GeneratedRoutinePayload, GeneratedRoutineStep } from "@/lib/gen/orchestrator";
import {
  MEDIA_ENRICH_CONCURRENCY,
  mediaEnrichBudgetMs,
  mediaStepTimeoutMs,
} from "@/lib/media/types";
import { searchYoutubeTutorial } from "@/lib/media/youtube-search";

function stepSignal(parent: AbortSignal, deadlineMs: number): AbortSignal {
  const remaining = Math.max(0, deadlineMs - Date.now());
  return AbortSignal.any([parent, AbortSignal.timeout(Math.min(remaining, 60_000))]);
}

async function withOptionalRetry<T>(
  run: () => Promise<T>,
  isRetriable: (err: unknown) => boolean,
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (!isRetriable(err)) throw err;
    return await run();
  }
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const idx = next++;
      if (idx >= items.length) break;
      results[idx] = await fn(items[idx], idx);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

export async function enrichGeneratedRoutine(
  payload: GeneratedRoutinePayload,
  options: { signal: AbortSignal; youtubeApiKey?: string },
): Promise<GeneratedRoutinePayload> {
  const budgetEnd = Date.now() + mediaEnrichBudgetMs();
  const stepTimeout = mediaStepTimeoutMs();
  const ytKey = options.youtubeApiKey?.trim() ?? "";

  const steps = await mapPool(
    payload.steps,
    MEDIA_ENRICH_CONCURRENCY,
    async (step) => enrichStep(step, {
      signal: options.signal,
      budgetEnd,
      stepTimeout,
      youtubeApiKey: ytKey,
    }),
  );

  return { ...payload, steps };
}

async function enrichStep(
  step: GeneratedRoutineStep,
  ctx: {
    signal: AbortSignal;
    budgetEnd: number;
    stepTimeout: number;
    youtubeApiKey: string;
  },
): Promise<GeneratedRoutineStep> {
  const sig = stepSignal(ctx.signal, ctx.budgetEnd);

  let imageUrl = step.media.imageUrl;
  let imageAttribution = step.media.imageAttribution;
  let videoUrl = step.media.videoUrl;
  let videoTitle = step.media.videoTitle;
  const videoLabel = step.media.videoLabel;

  if (!imageUrl.trim()) {
    imageUrl = "about:blank";
  }
  if (!imageUrl.startsWith("/")) {
    imageUrl = "about:blank";
    imageAttribution = undefined;
  }

  if (ctx.youtubeApiKey) {
    try {
      const yt = await withOptionalRetry(
        () =>
          searchYoutubeTutorial(
            step.poseId,
            ctx.youtubeApiKey,
            AbortSignal.any([sig, AbortSignal.timeout(ctx.stepTimeout)]),
          ),
        (err) =>
          err instanceof Error && /YouTube HTTP (429|50[0-9])/.test(err.message),
      );
      if (yt) {
        videoUrl = yt.watchUrl;
        videoTitle = yt.title;
      }
    } catch {
      /* keep model-provided or empty */
    }
  }

  return {
    ...step,
    media: {
      imageUrl,
      videoLabel,
      imageAttribution,
      videoUrl,
      videoTitle,
    },
  };
}
