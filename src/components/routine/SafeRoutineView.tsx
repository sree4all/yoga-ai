"use client";

import { useCallback, useState } from "react";
import type { RoutineResponse } from "@/lib/contracts/routine-zod";

const WELLNESS_MEDIA_COPY =
  "References are for general movement education only — not medical advice. Stop if anything hurts.";

interface Props {
  data: Extract<RoutineResponse, { kind: "safe_routine" }>;
}

function StepPoseImage({
  poseLabel,
  imageUrl,
  onRetry,
}: {
  poseLabel: string;
  imageUrl: string;
  onRetry: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/80 px-4 py-6 text-center">
        <p className="text-sm text-slate-600">Could not load this image.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            onRetry();
          }}
          className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          Retry
        </button>
      </div>
    );
  }

  /* Plain <img>: Next/Image runs server-side optimization via /_next/image; Wikimedia and many
   * CDNs block or throttle that fetch, so most pose images failed while one could load by chance.
   * Browser-direct load + no-referrer matches typical hotlink behavior Commons allows. */
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external pose URLs; avoid Image optimizer
    <img
      src={imageUrl}
      alt={poseLabel}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function SafeRoutineView({ data }: Props) {
  const { routine } = data;
  const { yogaStyle } = routine;
  const [retryKeys, setRetryKeys] = useState<Record<number, number>>({});

  const bumpRetry = useCallback((i: number) => {
    setRetryKeys((k) => ({ ...k, [i]: (k[i] ?? 0) + 1 }));
  }, []);

  return (
    <article className="yoga-panel p-6">
      <p className="text-sm leading-relaxed text-slate-600">{data.disclaimer}</p>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{routine.title}</h2>
      <p className="mt-1 text-sm text-slate-600">
        About {routine.totalDurationMinutes} minutes · move gently and skip anything that does not
        feel right.
      </p>

      <section
        className="mt-6 rounded-xl border border-teal-200/90 bg-teal-50/90 px-4 py-3"
        aria-labelledby="yoga-style-heading"
      >
        <h3 id="yoga-style-heading" className="text-sm font-semibold text-teal-900">
          Suggested style: {yogaStyle.category}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-teal-900/90">{yogaStyle.rationale}</p>
      </section>

      <ol className="mt-6 list-decimal space-y-8 pl-5 marker:font-medium marker:text-teal-800">
        {routine.steps.map((s, i) => {
          const poseLabel = s.poseId.replace(/_/g, " ");
          const hasVideo = Boolean(s.media.videoUrl?.trim());
          return (
            <li key={`${s.poseId}-${i}-${retryKeys[i] ?? 0}`} className="text-slate-800">
              <span className="font-medium text-slate-900">{poseLabel}</span>
              {s.durationSeconds ? (
                <span className="text-slate-500">
                  {" "}
                  · ~{Math.round(s.durationSeconds / 60) || 1} min
                </span>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed">{s.instruction}</p>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">{WELLNESS_MEDIA_COPY}</p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/90">
                  <div className="relative aspect-[4/3] w-full bg-slate-200">
                    <StepPoseImage
                      poseLabel={poseLabel}
                      imageUrl={s.media.imageUrl}
                      onRetry={() => bumpRetry(i)}
                    />
                  </div>
                  <p className="px-2 py-1 text-center text-xs text-slate-500">
                    {s.media.imageAttribution ? (
                      <span title={s.media.imageAttribution}>Image: {s.media.imageAttribution}</span>
                    ) : (
                      "Pose visual"
                    )}
                  </p>
                </div>
                <div className="flex flex-col justify-center rounded-xl border border-dashed border-violet-200/90 bg-violet-50/40 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Video reference
                  </p>
                  {hasVideo ? (
                    <>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {s.media.videoTitle ?? "YouTube"}
                      </p>
                      <a
                        href={s.media.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                      >
                        Open video in new tab
                      </a>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700">{s.media.videoLabel}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
