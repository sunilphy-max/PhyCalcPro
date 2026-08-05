"use client";

import type { BearingDesignerIntent } from "@/lib/machine/bearings/bearingProject";

type Props = {
  intent: BearingDesignerIntent;
  onChange: (intent: BearingDesignerIntent) => void;
};

export default function BearingIntentToggle({ intent, onChange }: Props) {
  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900"
      role="group"
      aria-label="Designer intent"
    >
      <button
        type="button"
        onClick={() => onChange("design")}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          intent === "design"
            ? "bg-cyan-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        Design a system
      </button>
      <button
        type="button"
        onClick={() => onChange("service")}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          intent === "service"
            ? "bg-cyan-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        }`}
      >
        Check / diagnose
      </button>
    </div>
  );
}
