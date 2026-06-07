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
      className={`rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Workflow mode</p>
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
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? "border-cyan-500 bg-white text-slate-950 shadow-sm ring-1 ring-cyan-200"
                  : "border-cyan-100 bg-cyan-50/80 text-slate-600 hover:border-cyan-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-700" : "text-cyan-500"}`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {!compact ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
