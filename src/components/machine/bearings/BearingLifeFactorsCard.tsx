"use client";

import type { BearingLifeMethod, BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

const METHOD_LABEL: Record<BearingLifeMethod, string> = {
  iso281: "ISO 281 / aSKF",
  iso16281_screen: "ISO 16281 screen",
  stress_life_screen: "Stress-life screen (not GBLM)",
};

/** ISO 281 / SKF modified life factor breakdown (L10, Lnm, a₁, aSKF, κ, ηc, ν). */
export default function BearingLifeFactorsCard({ result }: Props) {
  const f = result.modifiedLifeFactors;
  const adv = result.advancedLifeFactors;
  const method = result.lifeMethod ?? "iso281";

  const rows = [
    {
      label: "Life method",
      value: METHOD_LABEL[method],
      note: "Screening ceiling",
    },
    {
      label: "Basic rating life L₁₀",
      value: `${formatDisplayNumber(result.expectedLife)} h`,
      note: "a₁ · (C/P)^p",
    },
    {
      label: "Modified rating life Lnm",
      value: `${formatDisplayNumber(result.modifiedLife)} h`,
      note:
        method === "stress_life_screen"
          ? "a₁ · aISO · a_stress · a_adv · (C/P)^p"
          : method === "iso16281_screen"
            ? "a₁ · aISO · (C/P_adj)^p"
            : "a₁ · aSKF · (C/P)^p",
    },
    {
      label: "Reliability factor a₁",
      value: formatDisplayNumber(result.a1),
      note: "ISO 281 Table 12",
    },
    {
      label: "Life modification (effective)",
      value: formatDisplayNumber(result.aIso),
      note: "Includes aISO · a_advanced",
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
    ...(adv
      ? [
          {
            label: "Misalignment",
            value: `${formatDisplayNumber(adv.misalignmentUsedMrad)} mrad`,
            note: `Capacity ${formatDisplayNumber(adv.misalignmentCapacityMrad)} mrad`,
          },
          {
            label: "f_clearance",
            value: formatDisplayNumber(adv.fClearance),
            note: "ISO 16281 screen",
          },
          {
            label: "f_misalign",
            value: formatDisplayNumber(adv.fMisalign),
            note: "Load or derate path",
          },
          {
            label: "f_distrib",
            value: formatDisplayNumber(adv.fDistrib),
            note: "Edge-load proxy",
          },
          {
            label: "a_stress",
            value: formatDisplayNumber(adv.aStress),
            note: "Not SKF GBLM / AFC",
          },
          {
            label: "a_mis",
            value: formatDisplayNumber(adv.aMis),
            note: "Misalignment life derate",
          },
          {
            label: "Hybrid life factor",
            value: formatDisplayNumber(adv.hybridLifeFactor),
            note: "ISO 20056-inspired",
          },
          {
            label: "P_base → P_adj",
            value: `${formatDisplayNumber(adv.PbaseN / 1000)} → ${formatDisplayNumber(adv.PadjN / 1000)} kN`,
            note: "Equivalent load",
          },
        ]
      : []),
    {
      label: "Life safety Lnm/Lreq",
      value: formatDisplayNumber(
        result.lifeSafetyFactor ?? (result.lifeUtilization > 0 ? 1 / result.lifeUtilization : 0)
      ),
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
        Modified life — {METHOD_LABEL[method]}
      </p>
      {adv?.note ? (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{adv.note}</p>
      ) : null}
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
