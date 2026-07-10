"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** ISO 281 / SKF modified life factor breakdown (L10, Lnm, a₁, aSKF, κ, ηc). */
export default function BearingLifeFactorsCard({ result }: Props) {
  const f = result.modifiedLifeFactors;

  const rows = [
    { label: "Basic rating life L₁₀", value: `${formatDisplayNumber(result.expectedLife)} h`, note: `a₁ = ${result.a1}` },
    { label: "SKF rating life Lnm", value: `${formatDisplayNumber(result.modifiedLife)} h`, note: `aSKF = ${formatDisplayNumber(result.aIso)}` },
    { label: "Reliability factor a₁", value: formatDisplayNumber(result.a1), note: "ISO 281 Table 12" },
    { label: "Life modification aSKF", value: formatDisplayNumber(result.aIso), note: "ISO 281:2007 (κ, ηc, Pu/P)" },
    { label: "Viscosity ratio κ", value: formatDisplayNumber(f.kappa), note: f.nu1Cst > 0 ? `ν₁ ≈ ${formatDisplayNumber(f.nu1Cst)} cSt` : "—" },
    { label: "Contamination ηc", value: formatDisplayNumber(f.eC), note: "Cleanliness class" },
    { label: "Fatigue Pu / P", value: formatDisplayNumber(f.puOverP), note: "Pu screening estimate" },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-700/60 dark:bg-slate-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Modified life (ISO 281 / SKF)
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
