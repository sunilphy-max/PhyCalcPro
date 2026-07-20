"use client";

import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";
import {
  getModuleDocumentationHref,
  getReferenceDocumentationEntries,
} from "@/lib/design-workflows/referenceDocumentationLinks";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

/** Hyperlinked standards, catalogs, and module docs for the current calculator. */
export default function ModuleReferenceDocumentation({ workflow }: Props) {
  const moduleDocHref = getModuleDocumentationHref(workflow.moduleId);
  const entries = getReferenceDocumentationEntries(workflow.catalogTables, workflow.moduleId);

  if (!entries.length) return null;

  return (
    <section className="rounded-lg border border-slate-200/80 p-3 dark:border-slate-700/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
            <BookOpen className="h-4 w-4 text-slate-500" />
            Reference documentation
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Standards, catalogs, and technical write-ups relevant to this module.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/documentation/workflow-modes"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Workflow modes →
          </Link>
          <Link
            href={moduleDocHref}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Full module reference →
          </Link>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {entries.map(({ label, link }) => (
          <li key={label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-cyan-800 underline decoration-cyan-300 underline-offset-2 transition hover:text-cyan-950 dark:text-cyan-300 dark:decoration-cyan-700 dark:hover:text-cyan-100"
              >
                {label}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-cyan-800 underline decoration-cyan-300 underline-offset-2 transition hover:text-cyan-950 dark:text-cyan-300 dark:decoration-cyan-700 dark:hover:text-cyan-100"
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
