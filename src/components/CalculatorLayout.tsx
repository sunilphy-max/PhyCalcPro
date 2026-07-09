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
import GuestHistoryBanner from "@/components/shared/GuestHistoryBanner";
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
  /** Override automatic stage detection from CalculatorResultsShell. */
  hasResults?: boolean;
};

function CalculatorLayoutBody({
  inputs,
  results,
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

  return (
    <div className="calculator-module-shell min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] min-w-0 space-y-5">
          {/* Header */}
          <div className="calculator-module-header overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-md md:p-6 dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                    Engineering module
                  </span>
                  {profile ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold capitalize tracking-wide ${
                        profile.validationStatus === "draft"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {profile.validationStatus}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.75rem] dark:text-white">
                  {title}
                </h1>
              </div>
              {moduleId ? (
                <div className="w-full shrink-0 xl:max-w-[220px]">
                  <DesignCodeSelector moduleId={moduleId} compact />
                </div>
              ) : null}
            </div>

            {designWorkflow ? (
              <div className="mt-5 border-t border-slate-200/70 pt-5 dark:border-slate-700/60">
                <DesignModeToggle workflow={designWorkflow} />
              </div>
            ) : null}
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

          <GuestHistoryBanner />

          {moduleId ? (
            <Suspense fallback={null}>
              <PowerTrainAssemblyBootstrap moduleId={moduleId} />
            </Suspense>
          ) : null}

          {showPowerTrainStepper && powerTrainAssembly ? (
            <PowerTrainWorkflowStepper moduleId={moduleId} assembly={powerTrainAssembly} />
          ) : null}

          {/* Input stage: full-width inputs. Output stage: inputs left, results right. */}
          <div
            className={`calculator-stage-grid grid min-w-0 grid-cols-1 gap-5 transition-[grid-template-columns] duration-300 ease-out ${
              showSplitLayout ? "xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]" : ""
            }`}
          >
            {inputColumn ? (
              <aside
                className={`${calculatorWorkspaceClass} max-w-full min-w-0 transition-all duration-300 ease-out ${
                  showSplitLayout
                    ? `${calculatorSidebarClass} calculator-sidebar-scroll xl:sticky xl:top-5 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:overscroll-contain`
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
          </div>

          {designWorkflow ? <ModuleDesignAdvisor workflow={designWorkflow} /> : null}

          {footer ? <div>{footer}</div> : null}

          {designWorkflow ? <ModuleReferenceDocumentation workflow={designWorkflow} /> : null}

          {designWorkflow ? <ModuleCandidateStrategy workflow={designWorkflow} /> : null}

          {designWorkflow ? <ModuleContinueWorkflowBar workflow={designWorkflow} /> : null}
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
