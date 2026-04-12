"use client";

import { MEDICAL_DISCLAIMER_SHORT } from "@/lib/copy/disclaimer";

interface DisclaimerGateProps {
  onAcknowledged: () => void;
}

export function DisclaimerGate({ onAcknowledged }: DisclaimerGateProps) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="disclaimer-heading"
    >
      <h1 id="disclaimer-heading" className="text-xl font-semibold text-slate-900">
        Before we begin
      </h1>
      <p className="mt-3 text-slate-700 leading-relaxed">{MEDICAL_DISCLAIMER_SHORT}</p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAcknowledged();
        }}
      >
        <label className="flex cursor-pointer items-start gap-3 text-slate-800">
          <input
            type="checkbox"
            name="ack"
            required
            className="mt-1 h-5 w-5 rounded border-slate-400 text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          />
          <span className="text-sm leading-snug">
            I understand this is not medical advice and I will stop if something feels wrong.
          </span>
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto"
        >
          Continue to intake
        </button>
      </form>
    </section>
  );
}
