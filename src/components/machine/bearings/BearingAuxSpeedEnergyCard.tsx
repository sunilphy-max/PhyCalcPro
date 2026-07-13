"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Adjusted reference speed n_θ and energy / CO₂ screening. */
export default function BearingAuxSpeedEnergyCard({ result }: Props) {
  const nAdj = result.adjustedReferenceSpeed;
  const co2 = result.energyCo2;
  if (!nAdj && !co2) return null;

  return (
    <div className="space-y-3">
      {nAdj ? (
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/40 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
            Adjusted reference speed
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <p className="text-[10px] text-slate-500">n_ref base</p>
              <p className="text-sm font-bold tabular-nums">
                {nAdj.nRefBaseRpm > 0 ? `${formatDisplayNumber(nAdj.nRefBaseRpm)} rpm` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">n_θ adjusted</p>
              <p className="text-sm font-bold tabular-nums text-sky-800 dark:text-sky-200">
                {nAdj.nAdjRpm > 0 ? `${formatDisplayNumber(nAdj.nAdjRpm)} rpm` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">n_θ / n</p>
              <p className="text-sm font-bold tabular-nums">{formatDisplayNumber(nAdj.nAdjMargin)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">f_load · f_ν · f_seal</p>
              <p className="text-sm font-bold tabular-nums">
                {formatDisplayNumber(nAdj.loadFactor)} · {formatDisplayNumber(nAdj.viscosityFactor)} ·{" "}
                {formatDisplayNumber(nAdj.sealFactor)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">{nAdj.note}</p>
        </div>
      ) : null}

      {co2 ? (
        <div className="rounded-xl border border-lime-200/80 bg-lime-50/40 p-3 dark:border-lime-900/40 dark:bg-lime-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-lime-800 dark:text-lime-200">
            Friction energy &amp; CO₂
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <p className="text-[10px] text-slate-500">Power loss</p>
              <p className="text-sm font-bold tabular-nums">{formatDisplayNumber(co2.powerLossW)} W</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Annual energy</p>
              <p className="text-sm font-bold tabular-nums">
                {formatDisplayNumber(co2.annualEnergyKwh)} kWh
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Annual CO₂</p>
              <p className="text-sm font-bold tabular-nums text-lime-800 dark:text-lime-200">
                {formatDisplayNumber(co2.annualCo2Kg)} kg
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Duty</p>
              <p className="text-sm font-bold tabular-nums">
                {co2.operatingHoursPerYear} h/y · {co2.gridKgCo2PerKwh} kg/kWh
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400">{co2.note}</p>
        </div>
      ) : null}
    </div>
  );
}
