"use client";

import type { RoutineResponse } from "@/lib/contracts/routine-zod";
import { SafeRoutineView } from "@/components/routine/SafeRoutineView";
import { GenerationFallbackView } from "@/components/routine/GenerationFallbackView";
import { RestrictedRoutineView } from "@/components/routine/RestrictedRoutineView";

interface Props {
  response: RoutineResponse;
  onRetry: () => void;
  onStartOver: () => void;
  /** Return to intake with prior selections restored when possible (FR-008). */
  onEditSelections?: () => void;
}

export function RoutineResult({ response, onRetry, onStartOver, onEditSelections }: Props) {
  return (
    <div className="space-y-6 pb-8">
      {response.kind === "safe_routine" && <SafeRoutineView data={response} />}
      {response.kind === "generation_fallback" && (
        <GenerationFallbackView data={response} onRetry={onRetry} />
      )}
      {response.kind === "restricted" && <RestrictedRoutineView data={response} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        {onEditSelections ? (
          <button
            type="button"
            onClick={onEditSelections}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto"
          >
            Edit selections
          </button>
        ) : null}
        <button
          type="button"
          onClick={onStartOver}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
