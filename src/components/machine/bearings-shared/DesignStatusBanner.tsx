"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export type DesignCheckStatus = "safe" | "warning" | "critical";

const STATUS_STYLES = {
  safe: {
    label: "PASS",
    icon: CheckCircle2,
    className:
      "border-emerald-300/80 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-950 dark:border-emerald-700/50 dark:from-emerald-950/50 dark:to-emerald-900/30 dark:text-emerald-50",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    label: "MARGINAL",
    icon: AlertTriangle,
    className:
      "border-amber-300/80 bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-950 dark:border-amber-700/50 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-50",
    accent: "text-amber-700 dark:text-amber-300",
  },
  critical: {
    label: "FAIL",
    icon: XCircle,
    className:
      "border-red-300/80 bg-gradient-to-br from-red-50 to-red-100/60 text-red-950 dark:border-red-700/50 dark:from-red-950/50 dark:to-red-900/30 dark:text-red-50",
    accent: "text-red-700 dark:text-red-300",
  },
} as const;

export type StatusHighlight = {
  label: string;
  value: string;
};

type Props = {
  designStatus: DesignCheckStatus;
  subtitle: string;
  detail?: string;
  highlights?: StatusHighlight[];
};

export default function DesignStatusBanner({
  designStatus,
  subtitle,
  detail,
  highlights = [],
}: Props) {
  const style = STATUS_STYLES[designStatus];
  const Icon = style.icon;

  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${style.className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-950/40 ${style.accent}`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">Design check</p>
            <p className="text-2xl font-bold tracking-tight">{style.label}</p>
            <p className="mt-1 text-sm font-medium opacity-90">{subtitle}</p>
            {detail ? <p className="mt-1 text-sm opacity-75">{detail}</p> : null}
          </div>
        </div>

        {highlights.length > 0 ? (
          <dl className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 md:max-w-xl">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-black/5 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-slate-950/30"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-bold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
