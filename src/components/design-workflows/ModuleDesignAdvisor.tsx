"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Calculator, ChevronDown, GitBranch, Lightbulb, Table2 } from "lucide-react";
import { allModules } from "@/data/modules";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getComputedDesignSet } from "@/lib/design-workflows/computedCandidates";
import type { ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

const maturityLabel: Record<ModuleDesignWorkflow["maturity"], string> = {
  workflow: "UI only — Check runs the solver",
  "solver-backed": "Design auto-sizes before check",
  "catalog-backed": "Design ranks catalog entries",
};

export default function ModuleDesignAdvisor({ workflow }: Props) {
  const [open, setOpen] = useState(false);
  const { mode, userInputs, applyDesignCandidate } = useDesignWorkflow();
  const computedDesign = getComputedDesignSet(workflow.moduleId, userInputs);
  const linkedModules = workflow.linkedWorkflowModuleIds
    .map((id) => allModules.find((catalogModule) => catalogModule.id === id || catalogModule.route.endsWith(`/${id}`)))
    .filter((catalogModule): catalogModule is NonNullable<typeof catalogModule> => Boolean(catalogModule));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={open}
        aria-controls="module-design-advisor-panel"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Sizing candidates & standards reference
            {computedDesign?.candidates?.length ? (
              <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-200">
                {computedDesign.candidates.length} sizing options
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {mode === "select"
              ? "Compare options and Apply a candidate to the form"
              : "Catalog tables, workflow strategy, linked modules — optional detail"}
            {" · "}
            <span className="text-cyan-700 dark:text-cyan-400">{maturityLabel[workflow.maturity]}</span>
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div id="module-design-advisor-panel" className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-700">
          {computedDesign ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                <Calculator className="h-4 w-4 text-cyan-700" />
                Live sizing candidates
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{computedDesign.method}</p>
              <div className="mt-3 overflow-x-auto rounded-lg border border-cyan-200 bg-white dark:border-cyan-900/40 dark:bg-slate-950">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-cyan-50 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Option</th>
                      <th className="px-2.5 py-2 font-semibold">Size</th>
                      <th className="px-2.5 py-2 font-semibold">Util.</th>
                      <th className="px-2.5 py-2 font-semibold">Status</th>
                      <th className="px-2.5 py-2 font-semibold">Governing</th>
                      {mode === "select" ? (
                        <th className="px-2.5 py-2 font-semibold">Apply</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-100 dark:divide-slate-800">
                    {computedDesign.candidates.map((item) => (
                      <tr key={item.option}>
                        <td className="px-2.5 py-2 font-medium text-slate-900 dark:text-white">
                          {item.option}
                        </td>
                        <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{item.size}</td>
                        <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">
                          {item.utilization.toFixed(2)}
                        </td>
                        <td className="px-2.5 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              item.status === "pass"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : item.status === "review"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{item.governing}</td>
                        {mode === "select" ? (
                          <td className="px-2.5 py-2">
                            {item.fields ? (
                              <button
                                type="button"
                                onClick={() => applyDesignCandidate(item.fields!)}
                                className="rounded-md border border-cyan-400 bg-white px-2 py-1 text-[11px] font-semibold text-cyan-800 hover:bg-cyan-50 dark:border-cyan-700 dark:bg-slate-900 dark:text-cyan-200"
                              >
                                Apply
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs font-medium text-cyan-950 dark:text-cyan-100">
                Recommendation: {computedDesign.recommendation}
              </p>
            </div>
          ) : (mode === "design" || mode === "select") && workflow.maturity === "workflow" ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
              Design and Select show reference strategy only for this module — run Check to verify your inputs.
              Auto-sizing candidates appear when a solver-backed workflow is registered.
            </p>
          ) : null}

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
              <Table2 className="h-4 w-4 text-slate-500" />
              Candidate strategy (reference)
            </div>
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
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
                      <td className="px-2.5 py-2 font-medium text-slate-900 dark:text-white">
                        {candidate.option}
                      </td>
                      <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.basis}</td>
                      <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.pass}</td>
                      <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">{candidate.tradeoff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <BookOpen className="h-3.5 w-3.5" />
                Standards & tables
              </div>
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-600 dark:text-slate-400">
                {workflow.catalogTables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <GitBranch className="h-3.5 w-3.5" />
                Continue workflow
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {linkedModules.map((catalogModule) => (
                  <Link
                    key={catalogModule.id}
                    href={catalogModule.route}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-cyan-300 hover:text-cyan-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {catalogModule.title}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-950 dark:text-amber-100">
              <Lightbulb className="h-3.5 w-3.5" />
              Expert notes
            </div>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs leading-5 text-amber-900 dark:text-amber-200/90">
              {workflow.expertNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
