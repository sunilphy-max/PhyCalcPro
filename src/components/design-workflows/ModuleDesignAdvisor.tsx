"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calculator, CheckCircle2, GitBranch, Lightbulb, Table2 } from "lucide-react";
import { allModules } from "@/data/modules";
import { getComputedDesignSet } from "@/lib/design-workflows/computedCandidates";
import type { DesignWorkflowMode, ModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

type Props = {
  workflow: ModuleDesignWorkflow;
};

const maturityLabel: Record<ModuleDesignWorkflow["maturity"], string> = {
  workflow: "Workflow scaffold",
  "solver-backed": "Solver-backed",
  "catalog-backed": "Catalog-backed",
};

export default function ModuleDesignAdvisor({ workflow }: Props) {
  const [mode, setMode] = useState<DesignWorkflowMode>("design");
  const activeMode = workflow.modes.find((item) => item.id === mode) ?? workflow.modes[0];
  const computedDesign = getComputedDesignSet(workflow.moduleId);
  const linkedModules = workflow.linkedWorkflowModuleIds
    .map((id) => allModules.find((catalogModule) => catalogModule.id === id || catalogModule.route.endsWith(`/${id}`)))
    .filter((catalogModule): catalogModule is NonNullable<typeof catalogModule> => Boolean(catalogModule));

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
      <div className="border-b border-cyan-100 bg-cyan-50/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Design workflow
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Design / Check / Select for {workflow.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This layer turns the module into a design worksheet: define targets, compare
              candidate sizes, use standard/catalog tables, and continue into linked checks.
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 shadow-sm">
            {maturityLabel[workflow.maturity]}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {workflow.modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === item.id
                  ? "border-cyan-500 bg-white text-slate-950 shadow-sm"
                  : "border-cyan-100 bg-cyan-50 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="mt-1 text-xs leading-5">{item.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5 border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              Active mode: {activeMode?.label}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{activeMode?.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">Design inputs to define</h3>
            <ul className="mt-2 grid gap-2 text-sm text-slate-600">
              {workflow.designInputs.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">Automatic design targets</h3>
            <ul className="mt-2 grid gap-2 text-sm text-slate-600">
              {workflow.autoSizingTargets.map((item) => (
                <li key={item} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {computedDesign ? (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Calculator className="h-4 w-4 text-cyan-700" />
                Computed design candidates
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{computedDesign.method}</p>
              <div className="mt-3 overflow-x-auto rounded-xl border border-cyan-200 bg-white">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-cyan-50 text-cyan-900">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Option</th>
                      <th className="px-3 py-2 font-semibold">Size</th>
                      <th className="px-3 py-2 font-semibold">Util.</th>
                      <th className="px-3 py-2 font-semibold">Margin</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Governing</th>
                      <th className="px-3 py-2 font-semibold">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-100">
                    {computedDesign.candidates.map((item) => (
                      <tr key={item.option}>
                        <td className="px-3 py-2 font-medium text-slate-900">{item.option}</td>
                        <td className="px-3 py-2 text-slate-600">{item.size}</td>
                        <td className="px-3 py-2 text-slate-600">{item.utilization.toFixed(2)}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {Number.isFinite(item.margin) ? item.margin.toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${
                              item.status === "pass"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "review"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{item.governing}</td>
                        <td className="px-3 py-2 text-slate-600">{item.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm font-medium text-cyan-950">
                Recommendation: {computedDesign.recommendation}
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
                    Assumptions
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                    {computedDesign.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
                    Equations
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                    {computedDesign.equations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Table2 className="h-4 w-4 text-cyan-600" />
              Workflow candidate strategy
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Candidate</th>
                    <th className="px-3 py-2 font-semibold">Basis</th>
                    <th className="px-3 py-2 font-semibold">Pass criteria</th>
                    <th className="px-3 py-2 font-semibold">Tradeoff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {workflow.candidates.map((candidate) => (
                    <tr key={candidate.option}>
                      <td className="px-3 py-2 font-medium text-slate-900">{candidate.option}</td>
                      <td className="px-3 py-2 text-slate-600">{candidate.basis}</td>
                      <td className="px-3 py-2 text-slate-600">{candidate.pass}</td>
                      <td className="px-3 py-2 text-slate-600">{candidate.tradeoff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Candidate columns to calculate: {workflow.candidateColumns.join(", ")}.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <BookOpen className="h-4 w-4 text-cyan-600" />
                Tables to use
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {workflow.catalogTables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <GitBranch className="h-4 w-4 text-cyan-600" />
                Continue workflow
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {linkedModules.map((catalogModule) => (
                  <Link
                    key={catalogModule.id}
                    href={catalogModule.route}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:text-cyan-700"
                  >
                    {catalogModule.title}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <Lightbulb className="h-4 w-4" />
              Expert notes and remaining gaps
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-900">
              {workflow.expertNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {workflow.gaps.map((item) => (
                <li key={item}>Gap: {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
