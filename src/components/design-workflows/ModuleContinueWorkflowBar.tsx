"use client";

import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { allModules } from "@/data/modules";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

function resolveLinkedModules(workflow: ModuleDesignWorkflow) {
  return workflow.linkedWorkflowModuleIds
    .map((id) =>
      allModules.find(
        (catalogModule) => catalogModule.id === id || catalogModule.route.endsWith(`/${id}`)
      )
    )
    .filter((catalogModule): catalogModule is NonNullable<typeof catalogModule> => Boolean(catalogModule));
}

/** Sticky bottom bar — suggested next calculators in the design chain. */
export default function ModuleContinueWorkflowBar({ workflow }: Props) {
  const linkedModules = resolveLinkedModules(workflow);
  if (!linkedModules.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:left-72"
      aria-label="Continue workflow"
    >
      <div className="pointer-events-auto border-t border-emerald-300/80 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-3 shadow-[0_-8px_30px_rgba(16,185,129,0.25)] backdrop-blur-sm dark:border-emerald-500/40 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
              <GitBranch className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-50/90">
                Continue workflow
              </p>
              <p className="truncate text-sm font-medium text-white">
                Typical next steps after {workflow.title}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {linkedModules.map((catalogModule) => (
              <Link
                key={catalogModule.id}
                href={catalogModule.route}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-white hover:shadow-md dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900"
              >
                {catalogModule.title}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
