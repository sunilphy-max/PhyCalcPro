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

/** In-page “next steps” block — normal document flow, no fixed/sticky positioning. */
export default function ModuleContinueWorkflowBar({ workflow }: Props) {
  const linkedModules = resolveLinkedModules(workflow);
  if (!linkedModules.length) return null;

  return (
    <section
      className="rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 shadow-md dark:border-emerald-600"
      aria-label="Continue workflow"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <GitBranch className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-50/90">
              Continue workflow
            </p>
            <p className="text-sm font-medium text-white">
              Typical next steps after {workflow.title}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {linkedModules.map((catalogModule) => (
            <Link
              key={catalogModule.id}
              href={catalogModule.route}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-50 dark:hover:bg-emerald-900"
            >
              {catalogModule.title}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
