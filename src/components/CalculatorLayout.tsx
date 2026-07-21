"use client";

import { Suspense, ReactNode } from "react";
import DesignCodeSelector from "@/components/shared/DesignCodeSelector";
import ApplicationPresetSelector from "@/components/shared/ApplicationPresetSelector";
import { moduleSupportsApplicationPreset } from "@/lib/applications";
import DesignModeToggle from "@/components/design-workflows/DesignModeToggle";
import DesignTargetFields from "@/components/design-workflows/DesignTargetFields";
import ModuleDesignAdvisor from "@/components/design-workflows/ModuleDesignAdvisor";
import ModuleCandidateStrategy from "@/components/design-workflows/ModuleCandidateStrategy";
import ModuleReferenceDocumentation from "@/components/design-workflows/ModuleReferenceDocumentation";
import ModuleContinueWorkflowBar from "@/components/design-workflows/ModuleContinueWorkflowBar";
import PowerTrainWorkflowStepper from "@/components/design-workflows/PowerTrainWorkflowStepper";
import PowerTrainAssemblyBootstrap from "@/components/design-workflows/PowerTrainAssemblyBootstrap";
import { DesignWorkflowProvider } from "@/contexts/DesignWorkflowContext";
import { PowerTrainAssemblyProvider, usePowerTrainAssemblyOptional } from "@/contexts/PowerTrainAssemblyContext";
import { CalculatorReportProvider, useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import { stepIdForModule } from "@/lib/design-workflows/powerTrainAssembly";
import { allModules } from "@/data/modules";
import { calculatorSidebarClass, calculatorWorkspaceClass } from "@/components/calculator/styles";

/**
 * Module layout: full-width inputs before first calculation; inputs left + results right after.
 * Optional `summary` renders a persistent sticky Design Summary rail on the right.
 */
type Props = {
  inputs?: ReactNode;
  results?: ReactNode;
  /** Persistent right-rail Design Summary (always visible when provided). */
  summary?: ReactNode;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  title: string;
  footer?: ReactNode;
  moduleId?: string;
  /** Override automatic stage detection from CalculatorResultsShell. */
  hasResults?: boolean;
};

function CalculatorLayoutBody({
  inputs,
  results,
  summary,
  left,
  center,
  right,
  title,
  footer,
  moduleId,
  hasResults,
}: Props) {
  const reportContext = useCalculatorReportOptional();
  const resultsStageActive = hasResults ?? reportContext?.resultsStageActive ?? false;
  const profile = moduleId ? getModuleStandardProfile(moduleId) : undefined;
  const designWorkflow = moduleId ? getModuleDesignWorkflow(moduleId) : undefined;
  const powerTrainAssembly = usePowerTrainAssemblyOptional()?.assembly ?? null;
  const showPowerTrainStepper =
    Boolean(moduleId && powerTrainAssembly && stepIdForModule(moduleId));
  const isScreeningModule = moduleId
    ? allModules.find((m) => m.id === moduleId)?.category === "advanced-systems"
    : false;
  const showApplicationPreset = moduleId
    ? moduleSupportsApplicationPreset(moduleId)
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
  const showSplitLayout = Boolean(inputColumn && resultColumn && resultsStageActive);
  const showSummaryRail = Boolean(summary);

  const stageGridClass = [
    "calculator-stage-grid grid min-w-0 grid-cols-1 gap-5 transition-[grid-template-columns] duration-300 ease-out",
    showSplitLayout && showSummaryRail
      ? "xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(240px,280px)]"
      : showSplitLayout
        ? "xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]"
        : showSummaryRail && inputColumn
          ? "xl:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]"
          : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="calculator-module-shell min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] min-w-0 space-y-5">
          {/* Header */}
          <div className="calculator-module-header rounded-xl border border-slate-200/70 bg-white px-4 py-4 md:px-5 dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl dark:text-white">
                  {title}
                </h1>
                {profile ? (
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.6875rem] font-medium capitalize ${
                      profile.validationStatus === "draft"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {profile.validationStatus}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                {moduleId ? (
                  <div className="w-full sm:w-auto sm:min-w-[11rem]">
                    <DesignCodeSelector moduleId={moduleId} compact />
                  </div>
                ) : null}
                {designWorkflow ? <DesignModeToggle workflow={designWorkflow} /> : null}
              </div>
            </div>
          </div>

          {isScreeningModule ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 backdrop-blur-sm dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
              <span className="font-semibold">Screening-level module.</span> First-order estimates for
              feasibility — validate with detailed analysis before release.
            </div>
          ) : null}

          {profile?.validationStatus === "draft" ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              <span className="font-semibold">Draft module.</span> Results are indicative only — review
              assumptions and limitations in the calculation basis before design use.
            </div>
          ) : null}

          {moduleId ? (
            <Suspense fallback={null}>
              <PowerTrainAssemblyBootstrap moduleId={moduleId} />
            </Suspense>
          ) : null}

          {showPowerTrainStepper && powerTrainAssembly ? (
            <PowerTrainWorkflowStepper moduleId={moduleId} assembly={powerTrainAssembly} />
          ) : null}

          {/* Input stage: full-width inputs (+ optional summary). Output: inputs | results | summary. */}
          <div className={stageGridClass}>
            {inputColumn ? (
              <aside
                className={`${calculatorWorkspaceClass} max-w-full min-w-0 transition-all duration-300 ease-out ${
                  showSplitLayout
                    ? `${calculatorSidebarClass} calculator-sidebar-scroll xl:sticky xl:top-[7rem] xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:overscroll-contain`
                    : "calculator-workspace--expanded"
                }`}
              >
                {showApplicationPreset && moduleId ? (
                  <ApplicationPresetSelector moduleId={moduleId} />
                ) : null}
                {moduleId ? <DesignTargetFields moduleId={moduleId} /> : null}
                {inputColumn}
              </aside>
            ) : null}
            {resultColumn ? (
              <div
                className={
                  showSplitLayout
                    ? "@container/results calculator-results-enter min-w-0 space-y-5"
                    : "hidden"
                }
                aria-hidden={!showSplitLayout}
              >
                {resultColumn}
              </div>
            ) : null}
            {summary ? (
              <aside
                className="calculator-design-summary order-first min-w-0 xl:sticky xl:top-[7rem] xl:order-none xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:overscroll-contain"
              >
                {summary}
              </aside>
            ) : null}
          </div>

          {designWorkflow ? <ModuleDesignAdvisor workflow={designWorkflow} /> : null}

          {footer ? <div>{footer}</div> : null}

          {designWorkflow ? <ModuleContinueWorkflowBar workflow={designWorkflow} /> : null}

          {designWorkflow ? (
            <details className="group rounded-xl border border-slate-200/70 bg-white open:shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700 marker:content-none dark:text-slate-200 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  Design help & reference
                  <span className="text-xs font-normal text-slate-400 group-open:hidden">Show</span>
                  <span className="hidden text-xs font-normal text-slate-400 group-open:inline">Hide</span>
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-200/70 px-4 py-4 dark:border-slate-700/60">
                <ModuleReferenceDocumentation workflow={designWorkflow} />
                <ModuleCandidateStrategy workflow={designWorkflow} />
              </div>
            </details>
          ) : null}
        </div>
      </div>
  );
}

export default function CalculatorLayout(props: Props) {
  return (
    <PowerTrainAssemblyProvider>
      <DesignWorkflowProvider moduleId={props.moduleId}>
        <CalculatorReportProvider moduleId={props.moduleId}>
          <CalculatorLayoutBody {...props} />
        </CalculatorReportProvider>
      </DesignWorkflowProvider>
    </PowerTrainAssemblyProvider>
  );
}
