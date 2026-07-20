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
    <section className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-700/60">
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">
        <Table2 className="h-4 w-4 text-slate-400" />
        Candidate strategy
      </div>
      <p className="px-3 pb-2 text-xs text-slate-500 dark:text-slate-400">
        Typical Auto-design directions for {workflow.title.toLowerCase()}.
      </p>
      <div className="overflow-x-auto border-t border-slate-200/80 dark:border-slate-700/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
            <tr>
              <th className="px-2.5 py-2 font-semibold">Option</th>
              <th className="px-2.5 py-2 font-semibold">Basis</th>
              <th className="px-2.5 py-2 font-semibold">Pass</th>
              <th className="px-2.5 py-2 font-semibold">Tradeoff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
