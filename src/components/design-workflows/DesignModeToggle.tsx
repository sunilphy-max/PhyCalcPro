"use client";

import Link from "next/link";
import { CheckCircle2, GitCompare, HelpCircle, Ruler, Stethoscope } from "lucide-react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

const modeIcons: Partial<Record<import("@/lib/design-workflows/workflowModeLabels").DesignWorkflowMode, typeof Ruler>> = {
  design: Ruler,
  check: CheckCircle2,
  select: GitCompare,
  diagnose: Stethoscope,
};

export default function DesignModeToggle({ workflow }: Props) {
  const { mode, setMode } = useDesignWorkflow();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 shadow-inner backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
        {workflow.modes.map((item) => {
          const Icon = modeIcons[item.id] ?? CheckCircle2;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              title={item.label}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-white text-cyan-800 shadow-sm ring-1 ring-cyan-200/80 dark:bg-slate-950 dark:text-cyan-100 dark:ring-cyan-600/40"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`}
                aria-hidden
              />
              {item.label}
            </button>
          );
        })}
      </div>
      <Link
        href="/documentation/workflow-modes"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-300"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden />
        How workflow modes work
      </Link>
    </div>
  );
}
