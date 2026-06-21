"use client";

import { Table2 } from "lucide-react";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

/** Static sizing philosophy table — shown above document status on every workflow module. */
export default function ModuleCandidateStrategy({ workflow }: Props) {
  if (!workflow.candidates.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
          <Table2 className="h-4 w-4 text-slate-500" />
          Candidate strategy
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Typical Auto-design directions for {workflow.title.toLowerCase()} — compare light, balanced, and
          conservative sizing before committing to Validate.
        </p>
      </div>
      <div className="overflow-x-auto p-4 pt-3">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-2.5 py-2 font-semibold">Option</th>
              <th className="px-2.5 py-2 font-semibold">Basis</th>
              <th className="px-2.5 py-2 font-semibold">Pass</th>
              <th className="px-2.5 py-2 font-semibold">Tradeoff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {workflow.candidates.map((candidate) => (
              <tr key={candidate.option}>
                <td className="px-2.5 py-2 font-medium text-slate-900 dark:text-white">{candidate.option}</td>
                <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.basis}</td>
                <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.pass}</td>
                <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.tradeoff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
