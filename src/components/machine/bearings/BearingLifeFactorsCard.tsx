"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** ISO 281 / SKF modified life factor breakdown (L10, Lnm, a₁, aSKF, κ, ηc, ν). */
export default function BearingLifeFactorsCard({ result }: Props) {
  const f = result.modifiedLifeFactors;

  const rows = [
    {
      label: "Basic rating life L₁₀",
      value: `${formatDisplayNumber(result.expectedLife)} h`,
      note: "a₁ · (C/P)^p",
    },
    {
      label: "SKF rating life Lnm",
      value: `${formatDisplayNumber(result.modifiedLife)} h`,
      note: "a₁ · aSKF · (C/P)^p",
    },
    {
      label: "Reliability factor a₁",
      value: formatDisplayNumber(result.a1),
      note: "ISO 281 Table 12",
    },
    {
      label: "Life modification aSKF",
      value: formatDisplayNumber(result.aIso),
      note: "κ, ηc, Pu/P",
    },
    {
      label: "Operating viscosity ν",
      value: f.nuCst > 0 ? `${formatDisplayNumber(f.nuCst)} cSt` : "—",
      note: "At operating temperature",
    },
    {
      label: "Rated viscosity ν₁",
      value: f.nu1Cst > 0 ? `${formatDisplayNumber(f.nu1Cst)} cSt` : "—",
      note: "ISO 281 required",
    },
    {
      label: "Viscosity ratio κ",
      value: formatDisplayNumber(f.kappa),
      note: "ν / ν₁",
    },
    {
      label: "Contamination ηc",
      value: formatDisplayNumber(f.eC),
      note: "Cleanliness class",
    },
    {
      label: "Fatigue Pu / P",
      value: formatDisplayNumber(f.puOverP),
      note: f.fatigueLoadLimitN > 0 ? `Pu ≈ ${formatDisplayNumber(f.fatigueLoadLimitN / 1000)} kN` : "—",
    },
    {
      label: "Life safety Lnm/Lreq",
      value: formatDisplayNumber(result.lifeSafetyFactor ?? (result.lifeUtilization > 0 ? 1 / result.lifeUtilization : 0)),
      note: "≥ 1 required",
    },
    ...(result.weibullSystemLifeHours != null
      ? [
          {
            label: "Weibull system L_sys",
            value: `${formatDisplayNumber(result.weibullSystemLifeHours)} h`,
            note: "Multi-bearing ISO combination",
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-700/60 dark:bg-slate-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Modified life (ISO 281 / SKF) — a₁ · κ · ηc · lubrication
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-slate-50/80 px-2.5 py-2 dark:bg-slate-900/50">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{row.label}</p>
            <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{row.value}</p>
            <p className="text-[10px] text-slate-400">{row.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
