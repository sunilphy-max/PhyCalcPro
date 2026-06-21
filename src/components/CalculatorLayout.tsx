"use client";

import { ReactNode } from "react";
import DesignCodeSelector from "@/components/shared/DesignCodeSelector";
import ReleaseTierBadge from "@/components/qa/ReleaseTierBadge";
import DesignModeToggle from "@/components/design-workflows/DesignModeToggle";
import DesignTargetFields from "@/components/design-workflows/DesignTargetFields";
import ModuleDesignAdvisor from "@/components/design-workflows/ModuleDesignAdvisor";
import ModuleCandidateStrategy from "@/components/design-workflows/ModuleCandidateStrategy";
import ModuleReferenceDocumentation from "@/components/design-workflows/ModuleReferenceDocumentation";
import ModuleContinueWorkflowBar from "@/components/design-workflows/ModuleContinueWorkflowBar";
import WorkflowModeHelp from "@/components/design-workflows/WorkflowModeHelp";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";
import { DesignWorkflowProvider } from "@/contexts/DesignWorkflowContext";
import { CalculatorReportProvider, useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import { getModuleQualityChecklist } from "@/lib/calculation/moduleQualityDefaults";
import { getBenchmarkStatsFromLastRun } from "@/lib/qa/lastRun";
import { computeReleaseTier } from "@/lib/qa/maturityGates";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import { allModules } from "@/data/modules";
import { calculatorWorkspaceClass } from "@/components/calculator/styles";

/**
 * Module layout: inputs left (after app sidebar), results and charts right (wide column).
 */
type Props = {
  inputs?: ReactNode;
  results?: ReactNode;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  title: string;
  footer?: ReactNode;
  moduleId?: string;
};

function ModuleDocumentStatus({ moduleId }: { moduleId?: string }) {
  const report = useCalculatorReportOptional();
  const checklist =
    report?.qualityChecklist ??
    (moduleId ? getModuleQualityChecklist(moduleId) : null);

  if (!checklist) return null;

  return (
    <CalculationQualityChecklist title="Document status" checklist={checklist} />
  );
}

function CalculatorLayoutBody({
  inputs,
  results,
  left,
  center,
  right,
  title,
  footer,
  moduleId,
}: Props) {
  const profile = moduleId ? getModuleStandardProfile(moduleId) : undefined;
  const benchmarkStats = moduleId
    ? getBenchmarkStatsFromLastRun()[moduleId]
    : undefined;
  const releaseTier = moduleId
    ? computeReleaseTier(moduleId, benchmarkStats)
    : undefined;
  const designWorkflow = moduleId ? getModuleDesignWorkflow(moduleId) : undefined;
  const isScreeningModule = moduleId
    ? allModules.find((m) => m.id === moduleId)?.category === "advanced-systems"
    : false;

  const inputColumn =
    inputs ??
    (left || center ? (
      <div className="space-y-4">
        {left}
        {center}
      </div>
    ) : null);

  const resultColumn = results ?? right;

  return (
    <>
      <div className="min-h-full bg-slate-50 p-4 md:p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-[1600px] space-y-4">
          {/* Header: title + design standard + workflow modes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Engineering module
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">
                  {title}
                </h1>
                {profile ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {releaseTier ? <ReleaseTierBadge tier={releaseTier} /> : null}
                    <span className="text-sm capitalize text-slate-500">
                      Catalog: {profile.validationStatus}
                    </span>
                  </div>
                ) : null}
              </div>
              {moduleId ? (
                <div className="w-full shrink-0 xl:max-w-[220px]">
                  <DesignCodeSelector moduleId={moduleId} compact />
                </div>
              ) : null}
            </div>

            {designWorkflow ? (
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                <DesignModeToggle workflow={designWorkflow} compact />
                <WorkflowModeHelp workflow={designWorkflow} />
              </div>
            ) : null}
          </div>

          {isScreeningModule ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
              <span className="font-semibold">Screening-level module.</span> First-order estimates for
              feasibility — validate with detailed analysis before release.
            </div>
          ) : null}

          {/* Inputs left, results right */}
          <div
            className={`grid grid-cols-1 gap-4 ${
              inputColumn && resultColumn
                ? "lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]"
                : ""
            }`}
          >
            {inputColumn ? (
              <aside className={`${calculatorWorkspaceClass} max-w-full`}>
                {moduleId ? <DesignTargetFields moduleId={moduleId} /> : null}
                {inputColumn}
              </aside>
            ) : null}
            {resultColumn ? <div className="min-w-0 space-y-4">{resultColumn}</div> : null}
          </div>

          {designWorkflow ? <ModuleDesignAdvisor workflow={designWorkflow} /> : null}

          {footer ? <div>{footer}</div> : null}

          {designWorkflow ? <ModuleReferenceDocumentation workflow={designWorkflow} /> : null}

          {designWorkflow ? <ModuleCandidateStrategy workflow={designWorkflow} /> : null}

          <ModuleDocumentStatus moduleId={moduleId} />

          {designWorkflow ? <ModuleContinueWorkflowBar workflow={designWorkflow} /> : null}
        </div>
      </div>
    </>
  );
}

export default function CalculatorLayout(props: Props) {
  return (
    <DesignWorkflowProvider moduleId={props.moduleId}>
      <CalculatorReportProvider moduleId={props.moduleId}>
        <CalculatorLayoutBody {...props} />
      </CalculatorReportProvider>
    </DesignWorkflowProvider>
  );
}
