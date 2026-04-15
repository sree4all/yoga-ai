import "server-only";

import type { GeneratedRoutinePayload, GeneratedRoutineStep } from "@/lib/gen/orchestrator";
import {
  MEDIA_ENRICH_CONCURRENCY,
  mediaEnrichBudgetMs,
  mediaStepTimeoutMs,
} from "@/lib/media/types";
import { fetchCommonsImageForPose } from "@/lib/media/wikimedia";
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

const FALLBACK_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect fill="#e2e8f0" width="480" height="320"/><text x="240" y="160" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="15">Image unavailable</text></svg>`,
)}`;

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

  try {
    const commons = await withOptionalRetry(
      () =>
        fetchCommonsImageForPose(
          step.poseId,
          AbortSignal.any([sig, AbortSignal.timeout(ctx.stepTimeout)]),
        ),
      (err) =>
        err instanceof Error && /Commons HTTP (429|50[0-9])/.test(err.message),
    );
    if (commons) {
      imageUrl = commons.imageUrl;
      imageAttribution = commons.attribution;
    } else if (!imageUrl.startsWith("https://")) {
      imageUrl = FALLBACK_SVG;
      imageAttribution = undefined;
    }
  } catch {
    if (!imageUrl.startsWith("https://")) {
      imageUrl = FALLBACK_SVG;
    }
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
