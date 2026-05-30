"use client";

import type { ReactNode } from "react";

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
  value: ReactNode;
  tone?: MetricTone;
  status?: MetricStatus;
  size?: "sm" | "lg";
  className?: string;
};

const toneValueClass: Record<MetricTone, string> = {
  default: "text-gray-900",
  blue: "text-blue-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
  amber: "text-amber-600",
  green: "text-green-600",
};

const statusStyles: Record<
  MetricStatus,
  { card: string; value: string }
> = {
  safe: { card: "bg-green-50 border-green-200", value: "text-green-600" },
  warning: { card: "bg-amber-50 border-amber-200", value: "text-amber-600" },
  danger: { card: "bg-red-50 border-red-200", value: "text-red-600" },
};

export default function CalculatorMetricCard({
  label,
  value,
  tone = "default",
  status,
  size = "sm",
  className = "",
}: Props) {
  const cardStyle = status
    ? statusStyles[status].card
    : "bg-gray-50 border-gray-200";
  const valueStyle = status
    ? statusStyles[status].value
    : toneValueClass[tone];
  const valueSize = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div
      className={`rounded-xl border p-3 ${cardStyle} ${className}`.trim()}
    >
      <div className="mb-1 text-xs text-gray-500">{label}</div>
      <div className={`font-bold ${valueSize} ${valueStyle}`}>{value}</div>
    </div>
  );
}
