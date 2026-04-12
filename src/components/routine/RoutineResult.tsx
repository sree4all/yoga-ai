"use client";

import type { RoutineResponse } from "@/lib/contracts/routine-zod";
import { SafeRoutineView } from "@/components/routine/SafeRoutineView";
import { GenerationFallbackView } from "@/components/routine/GenerationFallbackView";
import { RestrictedRoutineView } from "@/components/routine/RestrictedRoutineView";

interface Props {
  response: RoutineResponse;
  onRetry: () => void;
  onStartOver: () => void;
}

export function RoutineResult({ response, onRetry, onStartOver }: Props) {
  return (
    <div className="space-y-4">
      {response.kind === "safe_routine" && <SafeRoutineView data={response} />}
      {response.kind === "generation_fallback" && (
        <GenerationFallbackView data={response} onRetry={onRetry} />
      )}
      {response.kind === "restricted" && <RestrictedRoutineView data={response} />}
      <button
        type="button"
        onClick={onStartOver}
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
      >
        Start over
      </button>
    </div>
  );
}
