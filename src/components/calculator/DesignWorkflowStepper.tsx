"use client";

import { ArrowRight, Check, Circle } from "lucide-react";

export type DesignWorkflowStepId =
  | "problem"
  | "geometry"
  | "material"
  | "loads"
  | "results"
  | "verification"
  | "report";

export type DesignWorkflowStep = {
  id: DesignWorkflowStepId;
  label: string;
  /** Anchor element id for in-form scroll (input stages). */
  anchorId?: string;
  /** True when this stage is considered complete. */
  complete?: boolean;
  /** Disable click (e.g. Results before first solve). */
  disabled?: boolean;
};

type Props = {
  steps: DesignWorkflowStep[];
  activeStepId?: DesignWorkflowStepId;
  onStepSelect?: (step: DesignWorkflowStep) => void;
  ariaLabel?: string;
};

/**
 * Sticky design-first step rail. Engineers can jump freely — not a blocking wizard.
 * Input stages scroll to anchors; Results / Verification / Report are wired by the page.
 */
export default function DesignWorkflowStepper({
  steps,
  activeStepId,
  onStepSelect,
  ariaLabel = "Design workflow",
}: Props) {
  return (
    <nav
      className="sticky top-0 z-10 -mx-1 rounded-xl border border-slate-200/80 bg-white/95 px-2 py-2 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95"
      aria-label={ariaLabel}
    >
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Design workflow
      </p>
      <ol className="flex flex-wrap items-center gap-1">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const done = Boolean(step.complete);
          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                disabled={step.disabled}
                aria-current={isActive ? "step" : undefined}
                onClick={() => {
                  if (step.disabled) return;
                  if (step.anchorId) {
                    document
                      .getElementById(step.anchorId)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  onStepSelect?.(step);
                }}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                  isActive
                    ? "border-cyan-500 bg-cyan-600 text-white"
                    : done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
                      : step.disabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/50"
                        : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <Circle className="h-3 w-3 opacity-50" aria-hidden />
                )}
                <span className="tabular-nums opacity-70">{index + 1}.</span>
                {step.label}
              </button>
              {index < steps.length - 1 ? (
                <ArrowRight className="hidden h-3 w-3 text-slate-300 sm:block dark:text-slate-600" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const BEAM_DESIGN_STEPS: Omit<DesignWorkflowStep, "complete" | "disabled">[] = [
  { id: "problem", label: "Problem", anchorId: "design-step-problem" },
  { id: "geometry", label: "Geometry", anchorId: "design-step-geometry" },
  { id: "material", label: "Material", anchorId: "design-step-material" },
  { id: "loads", label: "Loads", anchorId: "design-step-loads" },
  { id: "results", label: "Results" },
  { id: "verification", label: "Verification" },
  { id: "report", label: "Report" },
];
