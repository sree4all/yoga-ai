import type { RoutineResponse } from "@/lib/contracts/routine-zod";

interface Props {
  data: Extract<RoutineResponse, { kind: "restricted" }>;
}

export function RestrictedRoutineView({ data }: Props) {
  const { restricted } = data;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">{data.disclaimer}</p>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Gentle breathing & rest</h2>
      <p className="mt-2 text-sm text-slate-700">
        Based on your answers, we are not offering a full movement sequence here—only simple breath and rest
        ideas.
      </p>
      {restricted.careGuidance ? (
        <p className="mt-3 text-sm font-medium text-slate-900">{restricted.careGuidance}</p>
      ) : null}
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-800">
        {restricted.breathingSteps.map((b, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {b.instruction}
            {b.durationSeconds ? (
              <span className="text-slate-500"> · ~{Math.round(b.durationSeconds / 60) || 1} min</span>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}
