"use client";

import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { resolveWorkflowLinkedModules } from "@/lib/design-workflows/resolveWorkflowLinkedModules";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

/** In-page “next steps” block — normal document flow (no fixed/sticky positioning). */
export default function ModuleContinueWorkflowBar({ workflow }: Props) {
  const linkedModules = resolveWorkflowLinkedModules(workflow.linkedWorkflowModuleIds);
  if (!linkedModules.length) return null;

  return (
    <section
      className="rounded-xl border border-slate-200 border-l-4 border-l-cyan-500 bg-white p-4 shadow-sm dark:border-slate-700 dark:border-l-cyan-600 dark:bg-slate-900"
      aria-label="Continue workflow"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/50">
            <GitBranch className="h-4 w-4 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">
              Continue workflow
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Typical next steps after {workflow.title}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Related calculators">
          {linkedModules.map((catalogModule) => (
            <Link
              key={catalogModule.id}
              href={catalogModule.route}
              prefetch
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-cyan-700 dark:hover:bg-slate-700"
            >
              {catalogModule.title}
              <ArrowRight className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
