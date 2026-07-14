"use client";

import { Check, AlertTriangle, X } from "lucide-react";

export type DesignSummaryRowStatus = "ok" | "warn" | "fail" | "neutral";

export type DesignSummaryRow = {
  label: string;
  value: string;
  status?: DesignSummaryRowStatus;
};

type Props = {
  title?: string;
  rows: DesignSummaryRow[];
  /** Extra footer line under the checklist. */
  footer?: string;
  emptyMessage?: string;
  /** True once Calculate has locked a committed report. */
  committed?: boolean;
  empty?: boolean;
};

function StatusGlyph({ status }: { status: DesignSummaryRowStatus }) {
  if (status === "ok") {
    return <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  }
  if (status === "warn") {
    return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden />;
  }
  if (status === "fail") {
    return <X className="h-3.5 w-3.5 text-red-600" aria-hidden />;
  }
  return <span className="inline-block h-3.5 w-3.5" aria-hidden />;
}

function SummaryRow({ label, value, status = "neutral" }: DesignSummaryRow) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 py-2.5 last:border-b-0 dark:border-slate-700/50">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{value}</p>
      </div>
      {status !== "neutral" ? (
        <span
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            status === "ok"
              ? "bg-emerald-100 dark:bg-emerald-950/50"
              : status === "warn"
                ? "bg-amber-100 dark:bg-amber-950/40"
                : "bg-red-100 dark:bg-red-950/40"
          }`}
        >
          <StatusGlyph status={status} />
        </span>
      ) : null}
    </div>
  );
}

function overallShell(rows: DesignSummaryRow[]): string {
  const statuses = rows.map((r) => r.status ?? "neutral");
  if (statuses.includes("fail")) {
    return "border-red-300/70 bg-gradient-to-b from-red-50/90 to-white dark:border-red-800/40 dark:from-red-950/30 dark:to-slate-900/80";
  }
  if (statuses.includes("warn")) {
    return "border-amber-300/70 bg-gradient-to-b from-amber-50/90 to-white dark:border-amber-800/40 dark:from-amber-950/30 dark:to-slate-900/80";
  }
  if (statuses.includes("ok")) {
    return "border-emerald-300/70 bg-gradient-to-b from-emerald-50/90 to-white dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-slate-900/80";
  }
  return "border-slate-200/80 bg-white/90 dark:border-slate-700/60 dark:bg-slate-900/80";
}

/**
 * Persistent Design Summary rail — live checklist that updates as inputs change.
 */
export default function ModuleDesignSummaryPanel({
  title = "Design Summary",
  rows,
  footer,
  emptyMessage = "Enter duty parameters — this panel updates continuously.",
  committed = false,
  empty = false,
}: Props) {
  if (empty || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/80">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${overallShell(rows)}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <span className="text-[10px] font-medium text-slate-400">
          {committed ? "Live + report" : "Live"}
        </span>
      </div>
      <div className="mt-1">
        {rows.map((row) => (
          <SummaryRow key={`${row.label}:${row.value}`} {...row} />
        ))}
      </div>
      {footer ? (
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">{footer}</p>
      ) : null}
    </div>
  );
}
