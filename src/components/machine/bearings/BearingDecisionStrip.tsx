"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { BearingResult } from "@/lib/machine/bearings/types";
import {
  buildBearingDecisionDashboard,
  type DashboardTone,
} from "@/lib/machine/bearings/bearingDecisionDashboard";
import type { BearingDesignerIntent } from "@/lib/machine/bearings/bearingProject";

type Props = {
  result: BearingResult;
  intent?: BearingDesignerIntent;
};

function overallTone(dash: ReturnType<typeof buildBearingDecisionDashboard>): DashboardTone {
  const tones = dash.metrics.map((m) => m.tone);
  if (tones.includes("critical")) return "critical";
  if (tones.includes("warning")) return "warning";
  if (tones.every((t) => t === "safe" || t === "neutral")) return "safe";
  return "warning";
}

const STRIP: Record<
  DashboardTone,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  safe: {
    label: "Pass",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Marginal",
    className:
      "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50",
    Icon: AlertTriangle,
  },
  critical: {
    label: "Fail",
    className:
      "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-50",
    Icon: XCircle,
  },
  neutral: {
    label: "Review",
    className:
      "border-slate-300 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100",
    Icon: AlertTriangle,
  },
};

export default function BearingDecisionStrip({ result, intent = "design" }: Props) {
  const dash = useMemo(() => buildBearingDecisionDashboard(result), [result]);
  const tone = overallTone(dash);
  const { label, className, Icon } = STRIP[tone];
  const action =
    intent === "service"
      ? dash.governingLimitationAnswer
      : dash.bestLeverAnswer || dash.governingLimitationAnswer;

  return (
    <section
      className={`rounded-2xl border px-4 py-3 shadow-sm md:px-5 md:py-4 ${className}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide dark:bg-black/20">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {intent === "service" ? "Service verdict" : "Design verdict"}
            {result.designation ? ` — ${result.designation}` : ""}
          </p>
          <p className="mt-1 text-xs leading-5 opacity-90">
            <span className="font-semibold">Governing limit:</span> {dash.governingLimitation}
          </p>
          <p className="mt-0.5 text-xs leading-5 opacity-90">
            <span className="font-semibold">Recommended action:</span> {action}
          </p>
        </div>
      </div>
    </section>
  );
}
