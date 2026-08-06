"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  Layers,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  defaultStageForIntent,
  stageDescription,
  stageLabel,
  stagesForIntent,
  type BearingDesignerIntent,
  type BearingDesignerStageId,
} from "@/lib/machine/bearings/bearingProject";

const STAGE_ICONS: Record<BearingDesignerStageId, LucideIcon> = {
  system: Layers,
  duty: Gauge,
  size: Search,
  verify: ShieldCheck,
  report: ClipboardList,
};

type Props = {
  intent: BearingDesignerIntent;
  children: (activeStage: BearingDesignerStageId) => ReactNode;
  defaultStage?: BearingDesignerStageId;
  /** Controlled stage (e.g. from URL `panel=`). */
  stage?: BearingDesignerStageId;
  onStageChange?: (stage: BearingDesignerStageId) => void;
};

export default function BearingDesignerSpine({
  intent,
  children,
  defaultStage,
  stage: controlledStage,
  onStageChange,
}: Props) {
  const stages = useMemo(() => stagesForIntent(intent), [intent]);
  const fallbackStage = defaultStage ?? defaultStageForIntent(intent);
  const [internalStage, setInternalStage] = useState<BearingDesignerStageId>(fallbackStage);
  const activeStage = controlledStage ?? internalStage;
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeStage)
  );
  const activeDef = stages[activeIndex] ?? stages[0]!;

  const goTo = (next: BearingDesignerStageId) => {
    if (onStageChange) onStageChange(next);
    else setInternalStage(next);
  };

  const goPrev = () => {
    if (activeIndex > 0) goTo(stages[activeIndex - 1]!.id);
  };
  const goNext = () => {
    if (activeIndex < stages.length - 1) goTo(stages[activeIndex + 1]!.id);
  };

  return (
    <div className="space-y-5">
      <nav aria-label="Bearing selection process steps">
        <ol className="bearing-input-step-rail grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {stages.map((step, index) => {
            const active = step.id === activeStage;
            const complete = index < activeIndex;
            const Icon = STAGE_ICONS[step.id];
            const label = stageLabel(step, intent);
            const processHint =
              intent === "design" && step.processSteps.length > 0
                ? step.processSteps.length === 1
                  ? `Step ${step.processSteps[0]}`
                  : `Steps ${step.processSteps[0]}–${step.processSteps[step.processSteps.length - 1]}`
                : null;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => goTo(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-cyan-400/80 bg-cyan-50/90 shadow-sm ring-2 ring-cyan-500/20 dark:border-cyan-600/60 dark:bg-cyan-950/30 dark:ring-cyan-500/25"
                      : complete
                        ? "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                        : "border-slate-200/80 bg-white/80 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-900/50 dark:hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-cyan-600 text-white"
                        : complete
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {complete && !active ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                        {index + 1}. {label}
                      </span>
                      {processHint ? (
                        <span className="rounded bg-slate-200/80 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {processHint}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                      {stageDescription(step, intent)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {stageLabel(activeDef, intent)}
          <span className="ml-2 font-normal text-slate-500">
            — {stageDescription(activeDef, intent)}
          </span>
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={activeIndex <= 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={activeIndex >= stages.length - 1}
            className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-900 disabled:opacity-40 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-100"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>{children(activeStage)}</div>
    </div>
  );
}
