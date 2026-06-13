"use client";

import { CheckCircle2, GitCompare, Ruler } from "lucide-react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
  compact?: boolean;
};

const modeIcons = {
  check: CheckCircle2,
  design: Ruler,
  select: GitCompare,
} as const;

export default function DesignModeToggle({ workflow, compact = false }: Props) {
  const { mode, setMode } = useDesignWorkflow();

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/40 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Workflow mode
          </p>
          {!compact ? (
            <p className="mt-1 text-sm text-slate-600">
              Choose how this module sizes and verifies your design.
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-800 shadow-sm">
          {mode}
        </span>
      </div>

      <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-3" : "sm:grid-cols-3"}`}>
        {workflow.modes.map((item) => {
          const Icon = modeIcons[item.id];
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              title={item.description}
              className={`rounded-lg border px-2.5 py-2 text-left transition ${
                active
                  ? "border-cyan-500 bg-cyan-50 text-slate-950 shadow-sm ring-1 ring-cyan-200 dark:border-cyan-600 dark:bg-cyan-950/40 dark:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-cyan-700" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {!compact ? (
                <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
