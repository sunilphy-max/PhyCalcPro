"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { MetricStatus } from "@/components/calculator/CalculatorMetricCard";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import {
  governingUtilizationStatus,
  statusLabel,
} from "@/lib/structural/beams/utilizationStatus";
import type { BeamApplicationContext } from "@/lib/structural/beams/types";

type Props = {
  application: BeamApplicationContext;
  maxStress: number;
  maxDeflection: number;
  stressUnit: string;
  lengthUnit: string;
};

const STYLES: Record<
  MetricStatus,
  { card: string; accent: string; Icon: typeof CheckCircle2 }
> = {
  safe: {
    card: "border-emerald-300/80 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-950 dark:border-emerald-700/50 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:text-emerald-50",
    accent: "text-emerald-700 dark:text-emerald-300",
    Icon: CheckCircle2,
  },
  warning: {
    card: "border-amber-300/80 bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-950 dark:border-amber-700/50 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-50",
    accent: "text-amber-700 dark:text-amber-300",
    Icon: AlertTriangle,
  },
  danger: {
    card: "border-red-300/80 bg-gradient-to-br from-red-50 to-red-100/60 text-red-950 dark:border-red-700/50 dark:from-red-950/50 dark:to-red-900/30 dark:text-red-50",
    accent: "text-red-700 dark:text-red-300",
    Icon: XCircle,
  },
};

function whyText(
  status: MetricStatus,
  governing: "stress" | "deflection",
  application: BeamApplicationContext,
  maxStress: number,
  maxDeflection: number,
  stressUnit: string,
  lengthUnit: string
): string {
  const stressPct = (application.stressUtilization * 100).toFixed(0);
  const deflPct = (application.deflectionUtilization * 100).toFixed(0);
  const stressStr = formatEngineeringValue(maxStress, stressUnit, {
    useExponential: Math.abs(maxStress) >= 1e5 || Math.abs(maxStress) < 1e-3,
  });
  const allowStress = formatEngineeringValue(application.allowableStress, stressUnit, {
    useExponential:
      Math.abs(application.allowableStress) >= 1e5 ||
      Math.abs(application.allowableStress) < 1e-3,
  });
  const deflStr = formatEngineeringValue(maxDeflection, lengthUnit, { digits: 4 });
  const allowDefl = formatEngineeringValue(application.deflectionLimit, lengthUnit, {
    digits: 4,
  });

  if (governing === "stress") {
    if (status === "danger") {
      return `Bending stress ${stressStr} exceeds allowable ${allowStress} (${stressPct}% utilization). Increase section modulus or reduce load.`;
    }
    if (status === "warning") {
      return `Bending stress ${stressStr} is within ${stressPct}% of allowable ${allowStress}. Little reserve remains before the flexure limit.`;
    }
    return `Bending stress ${stressStr} is below allowable ${allowStress} (${stressPct}% utilization). Deflection at ${deflPct}% of L/${application.deflectionLimitRatio}.`;
  }

  if (status === "danger") {
    return `Deflection ${deflStr} exceeds the L/${application.deflectionLimitRatio} limit of ${allowDefl} (${deflPct}% utilization). Increase stiffness (I) or shorten span.`;
  }
  if (status === "warning") {
    return `Deflection ${deflStr} is within ${deflPct}% of the L/${application.deflectionLimitRatio} serviceability limit (${allowDefl}).`;
  }
  return `Deflection ${deflStr} is within the L/${application.deflectionLimitRatio} limit (${deflPct}% utilization). Stress at ${stressPct}% of allowable.`;
}

export default function BeamFailureBanner({
  application,
  maxStress,
  maxDeflection,
  stressUnit,
  lengthUnit,
}: Props) {
  const check = governingUtilizationStatus(
    application.stressUtilization,
    application.deflectionUtilization
  );
  const style = STYLES[check.status];
  const Icon = style.Icon;
  const label = statusLabel(check.status);
  const detail = whyText(
    check.status,
    check.governing,
    application,
    maxStress,
    maxDeflection,
    stressUnit,
    lengthUnit
  );

  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${style.card}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-950/40 ${style.accent}`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">
              Design check
            </p>
            <p className="text-2xl font-bold tracking-tight">{label}</p>
            <p className="mt-1 text-sm font-medium opacity-90">
              Governing:{" "}
              {check.governing === "stress" ? "Flexure / stress" : "Deflection"} ·{" "}
              {(check.util * 100).toFixed(0)}% utilization
            </p>
            <p className="mt-1 text-sm opacity-75">{detail}</p>
          </div>
        </div>

        <dl className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2 md:max-w-sm">
          <div className="rounded-xl border border-black/5 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/30">
            <dt className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              Stress util.
            </dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums">
              {(application.stressUtilization * 100).toFixed(0)}%
            </dd>
          </div>
          <div className="rounded-xl border border-black/5 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/30">
            <dt className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
              Deflection util.
            </dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums">
              {(application.deflectionUtilization * 100).toFixed(0)}%
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
