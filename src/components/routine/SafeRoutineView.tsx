"use client";

import { useState } from "react";
import type { RoutineResponse } from "@/lib/contracts/routine-zod";

const WELLNESS_MEDIA_COPY =
  "References are for general movement education only — not medical advice. Stop if anything hurts.";

interface Props {
  data: Extract<RoutineResponse, { kind: "safe_routine" }>;
}

const POSE_LABELS: Record<string, string> = {
  easy_seated: "Easy Seated",
  cat: "Cat Pose",
  cow: "Cow Pose",
  balancing_table: "Balancing Table",
  childs_pose: "Child's Pose",
  downward_facing_dog: "Downward Facing Dog",
  standing_forward_fold: "Standing Forward Fold",
  bound_angle: "Bound Angle Pose",
  supine_twist: "Supine Twist",
  happy_baby: "Happy Baby",
  seated_spinal_twist: "Seated Spinal Twist",
  seated_forward_fold: "Seated Forward Fold",
  high_lunge: "High Lunge",
  warrior_1: "Warrior I",
  warrior_2: "Warrior II",
  reverse_warrior: "Reverse Warrior",
  triangle: "Triangle Pose",
  half_moon: "Half Moon Pose",
  lizard: "Lizard Pose",
  pigeon: "Pigeon Pose",
  boat: "Boat Pose",
  locust: "Locust Pose",
  dolphin: "Dolphin Pose",
  camel: "Camel Pose",
  goddess: "Goddess Pose",
  tree: "Tree Pose",
  savasana: "Savasana",
};

function isLocalImageUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

function friendlyPoseLabel(poseId: string): string {
  return (
    POSE_LABELS[poseId] ??
    poseId
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function StepPoseImage({
  poseLabel,
  imageUrl,
  onImageError,
}: {
  poseLabel: string;
  imageUrl: string;
  onImageError: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  /* Plain <img> avoids Next/Image optimizer for local corpus assets. */
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static image URL from corpus
    <img
      src={imageUrl}
      alt={poseLabel}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => {
        setFailed(true);
        onImageError();
      }}
    />
  );
}

export function SafeRoutineView({ data }: Props) {
  const { routine } = data;
  const { yogaStyle } = routine;
  const [hiddenImageCards, setHiddenImageCards] = useState<Record<number, boolean>>({});

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
          const poseLabel = friendlyPoseLabel(s.poseId);
          const hasVideo = Boolean(s.media.videoUrl?.trim());
          const showLocalImage = isLocalImageUrl(s.media.imageUrl) && !hiddenImageCards[i];
          return (
            <li key={`${s.poseId}-${i}`} className="text-slate-800">
              <span className="font-medium text-slate-900">{poseLabel}</span>
              {s.durationSeconds ? (
                <span className="text-slate-500">
                  {" "}
                  · ~{Math.round(s.durationSeconds / 60) || 1} min
                </span>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed">{s.instruction}</p>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">{WELLNESS_MEDIA_COPY}</p>

              <div className={`mt-3 grid gap-4 ${showLocalImage ? "sm:grid-cols-2" : ""}`}>
                {showLocalImage ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/90">
                    <div className="relative aspect-[4/3] w-full bg-slate-200">
                      <StepPoseImage
                        poseLabel={poseLabel}
                        imageUrl={s.media.imageUrl}
                        onImageError={() =>
                          setHiddenImageCards((prev) => ({ ...prev, [i]: true }))
                        }
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
                ) : null}
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
