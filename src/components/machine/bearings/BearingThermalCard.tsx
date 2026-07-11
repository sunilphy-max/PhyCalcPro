"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Thermal float check for locating + floating systems. */
export default function BearingThermalCard({ result }: Props) {
  const t = result.thermalExpansion;
  if (!t) return null;

  const statusColor =
    t.status === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : t.status === "marginal"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
          Thermal expansion compensation
        </p>
        <span className={`text-xs font-bold uppercase ${statusColor}`}>{t.status}</span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">ΔT</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.deltaTempK)} K</dd>
        </div>
        <div>
          <dt className="text-slate-400">Required float</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.requiredFloatMm)} mm</dd>
        </div>
        <div>
          <dt className="text-slate-400">Available float</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.availableFloatMm)} mm</dd>
        </div>
        <div>
          <dt className="text-slate-400">Margin</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(t.floatMarginMm)} mm</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{t.note}</p>
    </div>
  );
}
