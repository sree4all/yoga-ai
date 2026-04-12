"use client";

import { useState } from "react";
import {
  DISCOMFORT_OPTIONS,
  REGION_OPTIONS,
  INTENSITY_OPTIONS,
  buildRoutineRequestBody,
  type IntakeFormState,
} from "@/lib/intake/state";

interface IntakeFlowProps {
  onSubmitIntake: (body: Record<string, unknown>) => void;
  isLoading: boolean;
}

const initial: IntakeFormState = {
  discomfortType: "",
  bodyRegion: "",
  intensity: "",
  optionalNote: "",
};

export function IntakeFlow({ onSubmitIntake, isLoading }: IntakeFlowProps) {
  const [state, setState] = useState<IntakeFormState>(initial);
  const [step, setStep] = useState(0);

  const update = (patch: Partial<IntakeFormState>) =>
    setState((s) => ({ ...s, ...patch }));

  const steps = [
    <div key="dt">
      <fieldset>
        <legend className="text-base font-medium text-slate-900">
          What best describes what you want to ease today?
        </legend>
        <div className="mt-3 grid gap-2">
          {DISCOMFORT_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="discomfortType"
                value={o.value}
                checked={state.discomfortType === o.value}
                onChange={() => update({ discomfortType: o.value })}
                className="h-4 w-4 text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              />
              <span className="text-sm text-slate-800">{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>,
    <div key="br">
      <fieldset>
        <legend className="text-base font-medium text-slate-900">Where do you feel it most?</legend>
        <div className="mt-3 grid gap-2">
          {REGION_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="bodyRegion"
                value={o.value}
                checked={state.bodyRegion === o.value}
                onChange={() => update({ bodyRegion: o.value })}
                className="h-4 w-4 text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              />
              <span className="text-sm text-slate-800">{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>,
    <div key="int">
      <fieldset>
        <legend className="text-base font-medium text-slate-900">How intense does it feel right now?</legend>
        <p id="int-help" className="mt-1 text-sm text-slate-600">
          If you choose <strong>Severe</strong>, we will only suggest gentle breathing and rest.
        </p>
        <div className="mt-3 grid gap-2" role="radiogroup" aria-describedby="int-help">
          {INTENSITY_OPTIONS.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="intensity"
                value={o.value}
                checked={state.intensity === o.value}
                onChange={() => update({ intensity: o.value })}
                className="h-4 w-4 text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              />
              <span className="text-sm text-slate-800">{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>,
    <div key="note">
      <label htmlFor="optional-note" className="text-base font-medium text-slate-900">
        Anything else we should know? <span className="font-normal text-slate-500">(optional)</span>
      </label>
      <textarea
        id="optional-note"
        name="optionalNote"
        rows={3}
        maxLength={500}
        value={state.optionalNote}
        onChange={(e) => update({ optionalNote: e.target.value })}
        placeholder="e.g., recent strain, context — not for diagnosis"
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />
    </div>,
  ];

  const canNext = () => {
    if (step === 0) return !!state.discomfortType;
    if (step === 1) return !!state.bodyRegion;
    if (step === 2) return !!state.intensity;
    return true;
  };

  const handleFinish = () => {
    const body = buildRoutineRequestBody(state);
    if (body) onSubmitIntake(body);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
      <h2 className="text-lg font-semibold text-slate-900">Quick intake</h2>
      <p className="mt-1 text-sm text-slate-600">
        Step {step + 1} of {steps.length}
      </p>
      <div className="mt-4">{steps[step]}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            type="button"
            disabled={!canNext()}
            onClick={() => canNext() && setStep((s) => s + 1)}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext() || isLoading}
            onClick={handleFinish}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            {isLoading ? "Preparing…" : "Get my routine"}
          </button>
        )}
      </div>
    </section>
  );
}
