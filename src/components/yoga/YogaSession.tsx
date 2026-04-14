"use client";

import { useCallback, useEffect, useState } from "react";
import { DisclaimerGate } from "@/components/disclaimer/DisclaimerGate";
import { IntakeFlow } from "@/components/intake/IntakeFlow";
import { RoutineResult } from "@/components/routine/RoutineResult";
import { routineResponseSchema, type RoutineResponse } from "@/lib/contracts/routine-zod";
import type { BodyRegion, DiscomfortType } from "@/lib/types/intake";
import type { IntakeFormState } from "@/lib/intake/state";

type Phase = "disclaimer" | "intake" | "result";

function parseIntakeFromBody(body: Record<string, unknown> | null): IntakeFormState | null {
  if (!body) return null;
  const dt = body.discomfortTypes;
  const br = body.bodyRegions;
  if (!Array.isArray(dt) || !Array.isArray(br)) return null;
  const intensity = body.intensity;
  if (intensity !== "mild" && intensity !== "moderate" && intensity !== "severe") {
    return null;
  }
  return {
    discomfortTypes: [...dt] as DiscomfortType[],
    bodyRegions: [...br] as BodyRegion[],
    intensity,
    optionalNote: typeof body.optionalNote === "string" ? body.optionalNote : "",
  };
}

export function YogaSession() {
  const [phase, setPhase] = useState<Phase>("disclaimer");
  const [loading, setLoading] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoutineResponse | null>(null);
  const [lastBody, setLastBody] = useState<Record<string, unknown> | null>(null);
  const [intakeInitial, setIntakeInitial] = useState<IntakeFormState | null>(null);

  useEffect(() => {
    if (!loading) {
      setSlowHint(false);
      return;
    }
    const t = setTimeout(() => setSlowHint(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  const fetchRoutine = useCallback(async (body: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setLastBody(body);
    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: unknown = await res.json();
      if (!res.ok) {
        setError(typeof json === "object" && json && "error" in json ? String((json as { error: string }).error) : "Request failed");
        return;
      }
      const parsed = routineResponseSchema.safeParse(json);
      if (!parsed.success) {
        setError("Unexpected response from server.");
        return;
      }
      setResult(parsed.data);
      setPhase("result");
    } catch {
      setError("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastBody) void fetchRoutine(lastBody);
  }, [lastBody, fetchRoutine]);

  const handleStartOver = useCallback(() => {
    setResult(null);
    setError(null);
    setLastBody(null);
    setIntakeInitial(null);
    setPhase("disclaimer");
  }, []);

  const handleEditSelections = useCallback(() => {
    const parsed = parseIntakeFromBody(lastBody);
    setIntakeInitial(parsed);
    setResult(null);
    setError(null);
    setPhase("intake");
  }, [lastBody]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">Yoga.ai</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">10-minute gentle movement</h1>
        <p className="mt-2 text-sm text-slate-600">
          A short intake helps us suggest a supportive, non-medical routine.
        </p>
      </header>

      {phase === "disclaimer" && (
        <DisclaimerGate onAcknowledged={() => setPhase("intake")} />
      )}

      {phase === "intake" && (
        <IntakeFlow
          onSubmitIntake={fetchRoutine}
          isLoading={loading}
          initialState={intakeInitial ?? undefined}
          showSlowLoadingHint={slowHint}
        />
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {error}
        </div>
      )}

      {phase === "result" && result && (
        <RoutineResult
          response={result}
          onRetry={handleRetry}
          onStartOver={handleStartOver}
          onEditSelections={handleEditSelections}
        />
      )}
    </div>
  );
}
