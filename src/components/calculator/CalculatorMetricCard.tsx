"use client";

import type { ReactNode } from "react";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { useResultsTableMetricRegistration, useResultsTableOptional } from "./ResultsTableContext";

export type MetricTone =
  | "default"
  | "blue"
  | "purple"
  | "orange"
  | "red"
  | "amber"
  | "green";

export type MetricStatus = "safe" | "warning" | "danger";

type Props = {
  label: string;
  value?: ReactNode;
  /** When set, value is auto-formatted (scientific for large/small magnitudes). */
  numericValue?: number | null;
  /** Display unit in the results table unit column. */
  unit?: string;
  tone?: MetricTone;
  status?: MetricStatus;
  size?: "sm" | "lg";
  className?: string;
};

const toneValueClass: Record<MetricTone, string> = {
  default: "text-slate-900 dark:text-slate-100",
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  amber: "text-amber-600 dark:text-amber-400",
  green: "text-green-600 dark:text-green-400",
};

const statusStyles: Record<
  MetricStatus,
  { card: string; value: string }
> = {
  safe: {
    card: "border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:border-green-900/50 dark:from-green-950/40 dark:to-emerald-950/20",
    value: "text-green-700 dark:text-green-400",
  },
  warning: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 dark:border-amber-900/50 dark:from-amber-950/40 dark:to-orange-950/20",
    value: "text-amber-700 dark:text-amber-400",
  },
  danger: {
    card: "border-red-200/80 bg-gradient-to-br from-red-50 to-rose-50/40 dark:border-red-900/50 dark:from-red-950/40 dark:to-rose-950/20",
    value: "text-red-700 dark:text-red-400",
  },
};

/** Registers a row in the unified results table when inside CalculatorResultsPanel. */
export default function CalculatorMetricCard({
  label,
  value,
  numericValue,
  unit,
  tone = "default",
  status,
  size = "sm",
  className = "",
}: Props) {
  const tableContext = useResultsTableOptional();

  useResultsTableMetricRegistration({
    label,
    value,
    numericValue,
    unit,
    tone,
    status,
  });

  if (tableContext) return null;

  const cardStyle = status
    ? statusStyles[status].card
    : "border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-white dark:border-slate-700/60 dark:from-slate-800/40 dark:to-slate-900/30";
  const valueStyle = status
    ? statusStyles[status].value
    : toneValueClass[tone];
  const valueSize = size === "lg" ? "text-2xl" : "text-xl";
  const display =
    numericValue !== undefined
      ? formatDisplayNumber(numericValue)
      : value;

  return (
    <div
      className={`min-w-0 rounded-xl border p-4 shadow-sm ${cardStyle} ${className}`.trim()}
    >
      <div className="mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div
        className={`break-all font-semibold tabular-nums leading-tight ${valueSize} ${valueStyle}`}
      >
        {display}
        {unit ? ` ${unit}` : null}
      </div>
    </div>
  );
}
