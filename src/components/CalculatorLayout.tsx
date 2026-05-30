"use client";

import { ReactNode } from "react";
import DesignCodeSelector from "@/components/shared/DesignCodeSelector";
import ReleaseTierBadge from "@/components/qa/ReleaseTierBadge";
import { getBenchmarkStatsFromLastRun } from "@/lib/qa/lastRun";
import { computeReleaseTier } from "@/lib/qa/maturityGates";
import { getModuleStandardProfile } from "@/lib/standards/moduleCatalog";

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
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.06),transparent_40%),#f8fafc] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm md:p-6">
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

        <div
          className={`grid grid-cols-1 gap-6 ${
            inputColumn ? "lg:grid-cols-[minmax(300px,420px)_1fr]" : "lg:grid-cols-1"
          }`}
        >
          {inputColumn ? <div className="space-y-4">{inputColumn}</div> : null}
          {resultColumn ? <div className="space-y-4 min-w-0">{resultColumn}</div> : null}
        </div>
        {footer ? <div>{footer}</div> : null}
      </div>
    </div>
  );
}
