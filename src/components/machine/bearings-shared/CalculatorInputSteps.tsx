"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CalculatorInputStep = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type Props = {
  steps: CalculatorInputStep[];
  children: (activeTab: string) => ReactNode;
  defaultTab?: string;
  ariaLabel?: string;
};

/**
 * Generic multi-step input wizard (rolling-bearing style) for plain / housing.
 */
export default function CalculatorInputSteps({
  steps,
  children,
  defaultTab,
  ariaLabel = "Input steps",
}: Props) {
  const initial = defaultTab ?? steps[0]?.id ?? "";
  const [activeTab, setActiveTab] = useState(initial);
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeTab)
  );
  const activeStep = steps[activeIndex] ?? steps[0];

  if (!activeStep || steps.length === 0) return null;

  const goTo = (tab: string) => setActiveTab(tab);
  const goPrev = () => {
    if (activeIndex > 0) goTo(steps[activeIndex - 1]!.id);
  };
  const goNext = () => {
    if (activeIndex < steps.length - 1) goTo(steps[activeIndex + 1]!.id);
  };

  return (
    <div className="space-y-5">
      <nav aria-label={ariaLabel}>
        <ol className="grid grid-cols-2 gap-2">
          {steps.map((step, index) => {
            const active = step.id === activeTab;
            const complete = index < activeIndex;
            const Icon = step.icon;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => goTo(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-cyan-400/80 bg-cyan-50/90 shadow-sm ring-2 ring-cyan-500/20 dark:border-cyan-600/60 dark:bg-cyan-950/30 dark:ring-cyan-500/25"
                      : complete
                        ? "border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                        : "border-slate-200/80 bg-white/80 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-900/50 dark:hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      active
                        ? "bg-cyan-600 text-white"
                        : complete
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
                      {step.label}
                    </span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-slate-500 dark:text-slate-400 sm:block">
                      {step.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        role="tabpanel"
        className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-slate-700/60 dark:bg-slate-900/30 md:p-5"
      >
        <div className="mb-4 border-b border-slate-200/70 pb-3 dark:border-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-700 dark:text-cyan-400">
            Step {activeIndex + 1} of {steps.length}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{activeStep.label}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{activeStep.description}</p>
        </div>

        {children(activeTab)}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/60">
          <button
            type="button"
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">{activeStep.label}</span>
          <button
            type="button"
            onClick={goNext}
            disabled={activeIndex === steps.length - 1}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-600/30 bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
