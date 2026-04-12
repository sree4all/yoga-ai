import type { RoutineResponse } from "@/lib/contracts/routine-zod";

interface Props {
  data: Extract<RoutineResponse, { kind: "generation_fallback" }>;
  onRetry: () => void;
}

export function GenerationFallbackView({ data, onRetry }: Props) {
  const { fallback } = data;
  return (
    <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
      <p className="text-sm text-slate-700">{data.disclaimer}</p>
      <p className="mt-3 font-medium text-amber-900">{fallback.message}</p>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-800">
        {fallback.breathingSteps.map((b, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {b.instruction}
            {b.durationSeconds ? (
              <span className="text-slate-500"> · ~{Math.round(b.durationSeconds / 60) || 1} min</span>
            ) : null}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Retry personalized routine
      </button>
    </article>
  );
}
