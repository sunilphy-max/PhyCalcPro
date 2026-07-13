"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";

export type BearingCompareRow = {
  designation: string;
  result: BearingResult;
  costIndex?: number;
};

type Props = {
  rows: BearingCompareRow[];
  loadUnit?: string;
  onRemove?: (designation: string) => void;
};

/** Side-by-side comparison of bearing candidates under the same duty. */
export default function BearingCompareTable({ rows, onRemove }: Props) {
  if (rows.length < 2) return null;

  const metrics: {
    label: string;
    value: (r: BearingCompareRow) => string;
  }[] = [
    { label: "Family", value: (r) => BEARING_TYPE_LABELS[r.result.bearingType] },
    {
      label: "C (kN)",
      value: (r) => formatDisplayNumber(r.result.dynamicLoadRatingN / 1000),
    },
    {
      label: "C₀ (kN)",
      value: (r) => formatDisplayNumber(r.result.staticLoadRatingN / 1000),
    },
    {
      label: "P/C",
      value: (r) => formatDisplayNumber(r.result.dynamicUtilization),
    },
    {
      label: "Lnm (h)",
      value: (r) => formatDisplayNumber(r.result.modifiedLife),
    },
    {
      label: "s₀",
      value: (r) => formatDisplayNumber(r.result.staticSafetyFactor),
    },
    {
      label: "n_lim/n",
      value: (r) =>
        r.result.speedMargin != null ? formatDisplayNumber(r.result.speedMargin) : "—",
    },
    {
      label: "n_θ/n",
      value: (r) =>
        r.result.adjustedReferenceSpeed && r.result.adjustedReferenceSpeed.nAdjRpm > 0
          ? formatDisplayNumber(r.result.adjustedReferenceSpeed.nAdjMargin)
          : "—",
    },
    {
      label: "Grease / relub (h)",
      value: (r) =>
        r.result.relubrication && r.result.relubrication.intervalHours > 0
          ? formatDisplayNumber(r.result.relubrication.intervalHours)
          : "—",
    },
    {
      label: "Status",
      value: (r) => r.result.designStatus,
    },
    {
      label: "Cost index",
      value: (r) => (r.costIndex != null ? formatDisplayNumber(r.costIndex) : "—"),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-950/40">
      <div className="border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Side-by-side comparison (same duty)
        </p>
      </div>
      <table className="min-w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-3 py-2 font-medium text-slate-500">Metric</th>
            {rows.map((row) => (
              <th key={row.designation} className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <span>{row.designation}</span>
                  {onRemove ? (
                    <button
                      type="button"
                      onClick={() => onRemove(row.designation)}
                      className="text-[10px] font-normal text-slate-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label} className="border-b border-slate-100 dark:border-slate-800">
              <td className="px-3 py-1.5 text-slate-500">{m.label}</td>
              {rows.map((row) => (
                <td key={row.designation} className="px-3 py-1.5 font-medium tabular-nums">
                  {m.value(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
