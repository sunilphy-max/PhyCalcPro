"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Friction power → ΔT → equilibrium temperature. */
export default function BearingThermalEquilibriumCard({ result }: Props) {
  const t = result.thermalEquilibrium;
  if (!t) return null;

  return (
    <div className="rounded-xl border border-orange-200/80 bg-orange-50/40 p-3 dark:border-orange-900/40 dark:bg-orange-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 dark:text-orange-200">
        Thermal equilibrium
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Friction power</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.powerLossW)} W</dd>
        </div>
        <div>
          <dt className="text-slate-400">ΔT</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.deltaTempK)} K</dd>
        </div>
        <div>
          <dt className="text-slate-400">Equilibrium</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(t.equilibriumTempC)} °C
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">ν @ T_op</dt>
          <dd className="font-semibold tabular-nums">
            {t.viscosityCst != null ? `${formatDisplayNumber(t.viscosityCst)} cSt` : "—"}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{t.note}</p>
    </div>
  );
}
