"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, X } from "lucide-react";
import {
  clearHandoff,
  peekHandoff,
  type CalcHandoff,
} from "@/lib/design-workflows/crossCalcHandoff";

type Props = {
  moduleId: string;
  /** Receives the base-SI handoff params; apply them to the form state. */
  onApply: (params: Record<string, number>, handoff: CalcHandoff) => void;
};

/** Banner offering to import results published by an upstream calculator. */
export default function CrossCalcHandoffBanner({ moduleId, onApply }: Props) {
  const [handoff, setHandoff] = useState<CalcHandoff | null>(null);
  const [autoApplied, setAutoApplied] = useState(false);

  useEffect(() => {
    const pending = peekHandoff(moduleId);
    setHandoff(pending);
    if (pending?.autoApply && !autoApplied) {
      onApply(pending.params, pending);
      clearHandoff(moduleId);
      setHandoff(null);
      setAutoApplied(true);
    }
  }, [moduleId, onApply, autoApplied]);

  if (!handoff) return null;

  const dismiss = () => {
    clearHandoff(moduleId);
    setHandoff(null);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
      <div className="text-sm text-indigo-950 dark:text-indigo-100">
        <div className="font-semibold">Results available from {handoff.fromTitle}</div>
        <div className="mt-0.5 text-indigo-900/80 dark:text-indigo-200/80">{handoff.summary}</div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onApply(handoff.params, handoff);
            dismiss();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />
          Apply to inputs
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss import"
          className="rounded-lg border border-indigo-200 bg-white p-1.5 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
