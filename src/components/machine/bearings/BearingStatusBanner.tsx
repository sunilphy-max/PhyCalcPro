"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";

const STATUS_STYLES = {
  safe: {
    label: "PASS",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
  warning: {
    label: "MARGINAL",
    className:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  },
  critical: {
    label: "FAIL",
    className:
      "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100",
  },
} as const;

type Props = {
  result: BearingResult;
};

export default function BearingStatusBanner({ result }: Props) {
  const style = STATUS_STYLES[result.designStatus];

  return (
    <div className={`rounded-xl border px-4 py-3 ${style.className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-lg font-bold tracking-wide">{style.label}</span>
        <span className="text-sm font-medium">{result.governingFailureMode}</span>
      </div>
    </div>
  );
}
