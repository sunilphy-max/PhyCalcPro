"use client";

import {
  METHOD_LADDER,
  type BearingMethodLadderStep,
} from "@/lib/machine/bearings/bearingProject";
import type { BearingLifeMethod } from "@/lib/machine/bearings/types";

type Props = {
  lifeMethod: BearingLifeMethod;
  onChange: (method: BearingLifeMethod) => void;
};

const TIER_STYLE: Record<BearingMethodLadderStep["tier"], string> = {
  catalog: "border-cyan-200 bg-cyan-50/80 dark:border-cyan-900/50 dark:bg-cyan-950/30",
  modified: "border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/30",
  screen: "border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/25",
  handoff: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50",
};

export default function BearingMethodLadder({ lifeMethod, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Method ladder</p>
      <p className="text-xs text-slate-500">
        Climb only as far as the decision needs. Screening tiers are not OEM release tools.
      </p>
      <ol className="space-y-2">
        {METHOD_LADDER.map((step, index) => {
          const selectable = step.id !== "oem_fea";
          const active = selectable && step.id === lifeMethod;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!selectable}
                onClick={() => {
                  if (selectable) onChange(step.id as BearingLifeMethod);
                }}
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  TIER_STYLE[step.tier]
                } ${
                  active ? "ring-2 ring-cyan-500/30" : ""
                } ${selectable ? "hover:brightness-[0.98]" : "cursor-default opacity-90"}`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[11px] font-bold text-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {step.label}
                    </span>
                    {active ? (
                      <span className="rounded-full bg-cyan-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Active
                      </span>
                    ) : null}
                    {step.tier === "handoff" ? (
                      <span className="rounded-full border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:border-slate-600 dark:text-slate-300">
                        External
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
