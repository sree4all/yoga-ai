import type { RoutineResponse } from "@/lib/contracts/routine-zod";

interface Props {
  data: Extract<RoutineResponse, { kind: "safe_routine" }>;
}

export function SafeRoutineView({ data }: Props) {
  const { routine } = data;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">{data.disclaimer}</p>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{routine.title}</h2>
      <p className="mt-1 text-sm text-slate-600">
        About {routine.totalDurationMinutes} minutes · move gently and skip anything that does not feel right.
      </p>
      <ol className="mt-4 list-decimal space-y-4 pl-5">
        {routine.steps.map((s, i) => (
          <li key={`${s.poseId}-${i}`} className="text-slate-800">
            <span className="font-medium text-slate-900">{s.poseId.replace(/_/g, " ")}</span>
            {s.durationSeconds ? (
              <span className="text-slate-500"> · ~{Math.round(s.durationSeconds / 60) || 1} min</span>
            ) : null}
            <p className="mt-1 text-sm leading-relaxed">{s.instruction}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
