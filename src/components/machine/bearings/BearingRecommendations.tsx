"use client";

import type { RankedBearing } from "@/lib/machine/bearings/catalogSelection";
import {
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
} from "@/data/catalogs/bearingCatalog";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  recommendations: RankedBearing[];
  onSelect?: (designation: string) => void;
};

export default function BearingRecommendations({ recommendations, onSelect }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
      <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">Recommended catalog options</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Ranked by dynamic utilization (P/C) for current loads and speed.
      </p>
      <ul className="mt-3 space-y-2">
        {recommendations.map((row) => (
          <li
            key={row.entry.designation}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {BEARING_MANUFACTURER_LABELS[row.entry.manufacturer]} {row.entry.designation}
              </span>
              <span className="ml-2 text-xs text-slate-500">
                {BEARING_TYPE_LABELS[row.entry.type]} · d={row.entry.boreMm} mm
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span>P/C {formatDisplayNumber(row.dynamicUtilization)}</span>
              <span>s₀ margin {formatDisplayNumber(row.staticUtilization > 0 ? 1 / row.staticUtilization : 0)}</span>
              <span>n_lim/n {formatDisplayNumber(row.speedMargin)}</span>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(row.entry.designation)}
                  className="rounded-md bg-cyan-700 px-2 py-1 font-semibold text-white hover:bg-cyan-800"
                >
                  Apply
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
