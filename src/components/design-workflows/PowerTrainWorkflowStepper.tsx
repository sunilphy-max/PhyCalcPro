"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, SkipForward } from "lucide-react";
import {
  POWER_TRAIN_STEPS,
  stepIdForModule,
  getPowerTrainStepRoute,
  type PowerTrainAssembly,
} from "@/lib/design-workflows/powerTrainAssembly";
import { usePowerTrainAssemblyOptional } from "@/contexts/PowerTrainAssemblyContext";

type Props = {
  moduleId?: string;
  assembly: PowerTrainAssembly;
};

export default function PowerTrainWorkflowStepper({ moduleId, assembly }: Props) {
  const ctx = usePowerTrainAssemblyOptional();
  const currentStepId = moduleId ? stepIdForModule(moduleId) : null;
  const currentIndex = currentStepId
    ? POWER_TRAIN_STEPS.findIndex((s) => s.id === currentStepId)
    : -1;

  return (
    <section
      className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white p-4 shadow-sm dark:border-cyan-900 dark:from-cyan-950/40 dark:to-slate-900"
      aria-label="Power train workflow"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
            Power train assembly
          </p>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{assembly.name}</p>
        </div>
        <button
          type="button"
          onClick={() => ctx?.clearAssembly()}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          Exit workflow
        </button>
      </div>

      <ol className="mt-4 flex flex-wrap gap-2">
        {POWER_TRAIN_STEPS.map((step, index) => {
          const state = assembly.steps[step.id];
          const isCurrent = step.id === currentStepId;
          const done = state.status === "complete";
          const skipped = state.status === "skipped";
          const href = `${getPowerTrainStepRoute(step.moduleId)}?assembly=${assembly.id}`;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <Link
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  isCurrent
                    ? "border-cyan-500 bg-cyan-600 text-white"
                    : done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
                      : skipped
                        ? "border-slate-200 bg-slate-100 text-slate-500 line-through dark:border-slate-700 dark:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <Circle className="h-3 w-3 opacity-50" aria-hidden />
                )}
                {step.label}
                {step.optional ? <span className="font-normal opacity-70">(opt)</span> : null}
              </Link>
              {step.optional && isCurrent && ctx ? (
                <button
                  type="button"
                  title="Skip optional step"
                  onClick={() => ctx.skipStep(step.id)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <SkipForward className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
              {index < POWER_TRAIN_STEPS.length - 1 ? (
                <ArrowRight className="hidden h-3 w-3 text-slate-400 sm:block" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      {currentIndex >= 0 && currentIndex < POWER_TRAIN_STEPS.length - 1 ? (
        <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
          Step {currentIndex + 1} of {POWER_TRAIN_STEPS.length}. After Calculate, continue to{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {POWER_TRAIN_STEPS[currentIndex + 1]?.label}
          </span>
          .
        </p>
      ) : null}
    </section>
  );
}
