"use client";

import type { RoutineResponse } from "@/lib/contracts/routine-zod";

/** When true, show per-pose image and video-reference UI (needs real search / assets). */
const SHOW_POSE_MEDIA = false;

interface Props {
  data: Extract<RoutineResponse, { kind: "safe_routine" }>;
}

export function SafeRoutineView({ data }: Props) {
  const { routine } = data;
  const { yogaStyle } = routine;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm leading-relaxed text-slate-600">{data.disclaimer}</p>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">{routine.title}</h2>
      <p className="mt-1 text-sm text-slate-600">
        About {routine.totalDurationMinutes} minutes · move gently and skip anything that does not
        feel right.
      </p>

      <section
        className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3"
        aria-labelledby="yoga-style-heading"
      >
        <h3 id="yoga-style-heading" className="text-sm font-semibold text-emerald-900">
          Suggested style: {yogaStyle.category}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-emerald-900/90">{yogaStyle.rationale}</p>
      </section>

      <ol className="mt-6 list-decimal space-y-6 pl-5 marker:font-medium marker:text-emerald-800">
        {routine.steps.map((s, i) => (
          <li key={`${s.poseId}-${i}`} className="text-slate-800">
            <span className="font-medium text-slate-900">{s.poseId.replace(/_/g, " ")}</span>
            {s.durationSeconds ? (
              <span className="text-slate-500">
                {" "}
                · ~{Math.round(s.durationSeconds / 60) || 1} min
              </span>
            ) : null}
            <p className="mt-1 text-sm leading-relaxed">{s.instruction}</p>

            {SHOW_POSE_MEDIA ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="relative aspect-[4/3] w-full bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element -- gated until real assets */}
                    <img
                      src={s.media.imageUrl}
                      alt={`${s.poseId.replace(/_/g, " ")}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="px-2 py-1 text-center text-xs text-slate-500">Pose visual</p>
                </div>
                <div className="flex flex-col justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Video reference
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{s.media.videoLabel}</p>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}
