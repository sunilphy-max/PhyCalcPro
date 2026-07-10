"use client";

import type { ReactNode } from "react";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { useResultsTableActionsOptional, useResultsTableRows } from "./ResultsTableContext";
import type { MetricStatus, MetricTone } from "./CalculatorMetricCard";

const toneValueClass: Record<MetricTone, string> = {
  default: "text-slate-900 dark:text-slate-100",
  blue: "text-cyan-700 dark:text-cyan-400",
  purple: "text-purple-700 dark:text-purple-400",
  orange: "text-orange-700 dark:text-orange-400",
  red: "text-red-700 dark:text-red-400",
  amber: "text-amber-700 dark:text-amber-400",
  green: "text-emerald-700 dark:text-emerald-400",
};

const statusValueClass: Record<MetricStatus, string> = {
  safe: "text-emerald-700 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-red-700 dark:text-red-400",
};

const statusRowClass: Record<MetricStatus, string> = {
  safe: "bg-emerald-50/60 dark:bg-emerald-950/20",
  warning: "bg-amber-50/60 dark:bg-amber-950/20",
  danger: "bg-red-50/60 dark:bg-red-950/20",
};

function formatValueCell(row: {
  value?: ReactNode;
  numericValue?: number | null;
}): ReactNode {
  if (row.numericValue !== undefined) {
    return formatDisplayNumber(row.numericValue);
  }
  return row.value ?? "—";
}

function formatUnitCell(row: { unit?: string; numericValue?: number | null; value?: ReactNode }) {
  if (row.unit) return row.unit;
  if (row.numericValue !== undefined) return "—";
  return "—";
}

type Props = {
  /** `compact` uses tighter padding and smaller type — good for bearing modules with many rows. */
  variant?: "default" | "compact";
};

/** Unified results table — populated automatically from CalculatorMetricCard children. */
export default function CalculatorResultsTable({ variant = "default" }: Props) {
  const rows = useResultsTableRows();

  if (!rows.length) return null;

  const compact = variant === "compact";

  return (
    <div
      className={`calculator-results-table-wrap overflow-hidden rounded-xl border border-slate-200/70 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-slate-950/40 ${
        compact ? "calculator-results-table--compact" : ""
      }`}
    >
      <table
        className={`calculator-results-table w-full min-w-0 ${compact ? "text-xs" : "text-sm"}`}
      >
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/90 text-left dark:border-slate-700/60 dark:bg-slate-900/60">
            <th
              className={`font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 ${
                compact ? "px-2.5 py-1.5 text-[0.625rem]" : "px-4 py-3 text-[0.6875rem]"
              }`}
            >
              Parameter
            </th>
            <th
              className={`font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 ${
                compact ? "px-2.5 py-1.5 text-[0.625rem]" : "px-4 py-3 text-[0.6875rem]"
              }`}
            >
              Value
            </th>
            <th
              className={`font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 ${
                compact ? "w-16 px-2.5 py-1.5 text-[0.625rem]" : "w-28 px-4 py-3 text-[0.6875rem]"
              }`}
            >
              Unit
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === "section") {
              return (
                <tr key={row.id} className="border-t border-slate-200/70 dark:border-slate-700/50">
                  <td
                    colSpan={3}
                    className={`bg-slate-50/80 font-semibold uppercase tracking-[0.1em] text-slate-500 dark:bg-slate-900/50 dark:text-slate-400 ${
                      compact ? "px-2.5 py-1 text-[0.625rem]" : "px-4 py-2 text-xs"
                    }`}
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }

            const valueClass = row.status
              ? statusValueClass[row.status]
              : toneValueClass[row.tone ?? "default"];
            const rowClass = row.status ? statusRowClass[row.status] : "";

            return (
              <tr
                key={row.id}
                className={`border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800/80 dark:hover:bg-slate-900/40 ${rowClass}`}
              >
                <td
                  className={`font-medium text-slate-700 dark:text-slate-300 ${
                    compact ? "max-w-[11rem] px-2.5 py-1 text-[0.6875rem]" : "px-4 py-3"
                  }`}
                >
                  {row.label}
                </td>
                <td
                  className={`font-semibold tabular-nums ${valueClass} ${
                    compact ? "px-2.5 py-1 text-xs" : "px-4 py-3"
                  }`}
                >
                  {formatValueCell(row)}
                </td>
                <td
                  className={`text-slate-500 dark:text-slate-400 ${
                    compact ? "w-16 px-2.5 py-1 text-[0.6875rem]" : "px-4 py-3"
                  }`}
                >
                  {formatUnitCell(row)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
