"use client";

import type { ReactNode } from "react";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

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
    card: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900/50",
    value: "text-green-600 dark:text-green-400",
  },
  warning: {
    card: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50",
    value: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    card: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/50",
    value: "text-red-600 dark:text-red-400",
  },
};

export default function CalculatorMetricCard({
  label,
  value,
  numericValue,
  tone = "default",
  status,
  size = "sm",
  className = "",
}: Props) {
  const cardStyle = status
    ? statusStyles[status].card
    : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700";
  const valueStyle = status
    ? statusStyles[status].value
    : toneValueClass[tone];
  const valueSize = size === "lg" ? "text-2xl" : "text-lg";
  const display =
    numericValue !== undefined
      ? formatDisplayNumber(numericValue)
      : value;

  return (
    <div
      className={`rounded-xl border p-3 ${cardStyle} ${className}`.trim()}
    >
      <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div
        className={`break-all font-bold leading-tight ${valueSize} ${valueStyle}`}
      >
        {display}
      </div>
    </div>
  );
}
