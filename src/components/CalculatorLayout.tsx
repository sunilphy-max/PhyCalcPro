"use client";

import { ReactNode } from "react";
import DesignCodeSelector from "@/components/shared/DesignCodeSelector";
import ReleaseTierBadge from "@/components/qa/ReleaseTierBadge";
import DesignModeToggle from "@/components/design-workflows/DesignModeToggle";
import DesignTargetFields from "@/components/design-workflows/DesignTargetFields";
import ModuleDesignAdvisor from "@/components/design-workflows/ModuleDesignAdvisor";
import { DesignWorkflowProvider } from "@/contexts/DesignWorkflowContext";
import { getBenchmarkStatsFromLastRun } from "@/lib/qa/lastRun";
import { computeReleaseTier } from "@/lib/qa/maturityGates";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import { allModules } from "@/data/modules";
import { calculatorWorkspaceClass } from "@/components/calculator/styles";

/**
 * Two-column module layout (used beside products sidebar):
 * - `inputs` — parameters, mesh, calculate (or legacy `left` + `center` merged)
 * - `results` — plots, checks, export (or legacy `right`)
 */
type Props = {
  inputs?: ReactNode;
  results?: ReactNode;
  /** @deprecated Merged into `inputs` column */
  left?: ReactNode;
  /** @deprecated Use `inputs` */
  center?: ReactNode;
  /** @deprecated Use `results` */
  right?: ReactNode;
  title: string;
  footer?: ReactNode;
  moduleId?: string;
};

export default function CalculatorLayout({
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
    <DesignWorkflowProvider moduleId={moduleId}>
    <div className="min-h-full bg-slate-50 p-4 md:p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Engineering module</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h1>
              {profile ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {releaseTier ? <ReleaseTierBadge tier={releaseTier} /> : null}
                  <span className="text-sm text-slate-500 capitalize">
                    Catalog: {profile.validationStatus}
                  </span>
                </div>
              ) : null}
            </div>
            {moduleId ? (
              <div className="w-full max-w-xs shrink-0">
                <DesignCodeSelector moduleId={moduleId} />
              </div>
            ) : null}
          </div>
        </div>

        {isScreeningModule ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <span className="font-semibold">Screening-level module.</span> These advanced-systems tools
            use first-order closed-form estimates for early feasibility studies — not detailed design
            verification. Validate governing results with a dedicated analysis or the applicable standard
            before release.
          </div>
        ) : null}

        {designWorkflow ? <ModuleDesignAdvisor workflow={designWorkflow} /> : null}

        <div
          className={`grid grid-cols-1 gap-5 ${
            inputColumn ? "lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]" : "lg:grid-cols-1"
          }`}
        >
          {inputColumn ? (
            <div className={calculatorWorkspaceClass}>
              {designWorkflow ? <DesignModeToggle workflow={designWorkflow} /> : null}
              {moduleId ? <DesignTargetFields moduleId={moduleId} /> : null}
              {inputColumn}
            </div>
          ) : null}
          {resultColumn ? <div className="space-y-4 min-w-0">{resultColumn}</div> : null}
        </div>
        {footer ? <div>{footer}</div> : null}
      </div>
    </div>
    </DesignWorkflowProvider>
  );
}
