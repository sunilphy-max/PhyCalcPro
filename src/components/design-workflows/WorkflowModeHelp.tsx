"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

const MODE_STEPS: Record<
  ModuleDesignWorkflow["modes"][number]["id"],
  { headline: string; steps: string[] }
> = {
  check: {
    headline: "Check — verify what you entered",
    steps: [
      "Enter geometry, loads, and material in the inputs panel.",
      "Click Calculate to run the forward solver.",
      "Review numeric results, charts, and engineering checks for your design standard.",
    ],
  },
  design: {
    headline: "Design — auto-size from your targets",
    steps: [
      "Set design targets (limits, safety factor, life, etc.) in the inputs panel.",
      "Click Calculate — the module searches catalog or reverse-sizes, applies the best candidate, then runs the check.",
      "Review the updated geometry and utilization in the results.",
    ],
  },
  select: {
    headline: "Select — compare options before committing",
    steps: [
      "Open “Sizing candidates & reference” below to see ranked catalog options.",
      "Click Apply on a row to load that size into the form (switches to Check mode).",
      "Run Calculate again to verify the chosen option in detail.",
    ],
  },
};

export default function WorkflowModeHelp({ workflow }: Props) {
  const { mode } = useDesignWorkflow();
  const active = workflow.modes.find((m) => m.id === mode) ?? workflow.modes[0];
  const copy = MODE_STEPS[active?.id ?? "check"];

  const maturityNote =
    workflow.maturity === "workflow"
      ? "This module shows workflow UI only — Design/Select change the button label but do not auto-size yet. Use Check for analysis."
      : workflow.maturity === "catalog-backed"
        ? "Design mode ranks catalog entries; Select lets you apply a row before checking."
        : "Design mode runs a solver-backed sizing search before the detailed check.";

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="font-semibold text-slate-900 dark:text-white">{copy.headline}</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600 dark:text-slate-300">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{maturityNote}</p>
    </div>
  );
}
