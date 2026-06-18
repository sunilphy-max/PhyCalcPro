"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import { WORKFLOW_MODE_META } from "@/lib/design-workflows/workflowModeLabels";

type Props = {
  workflow: ModuleDesignWorkflow;
};

export default function WorkflowModeHelp({ workflow }: Props) {
  const { mode } = useDesignWorkflow();
  const active = workflow.modes.find((m) => m.id === mode) ?? workflow.modes[0];
  const copy = WORKFLOW_MODE_META[active?.id ?? "check"];

  const maturityNote =
    workflow.maturity === "workflow"
      ? "This module shows workflow UI only — Auto-design and Compare change the button label but do not auto-size yet. Use Validate for analysis."
      : workflow.maturity === "catalog-backed"
        ? "Auto-design ranks catalog entries; Compare lets you Apply a row, then Validate in detail."
        : "Auto-design runs a solver-backed sizing search, applies the best candidate, then runs the full validation check.";

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
