"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Compass } from "lucide-react";
import type { BearingResult } from "@/lib/machine/bearings/types";
import {
  buildBearingDecisionDashboard,
  type DashboardTone,
} from "@/lib/machine/bearings/bearingDecisionDashboard";
import BearingMarginGauge from "@/components/machine/bearings/BearingMarginGauge";

type Props = {
  result: BearingResult;
};

const TONE_DOT: Record<DashboardTone, string> = {
  safe: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-slate-400",
};

const TONE_ICON = {
  safe: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  neutral: MinusCircle,
} as const;

const TONE_ROW: Record<DashboardTone, string> = {
  safe: "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
  warning: "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20",
  critical: "border-red-200/80 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20",
  neutral: "border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/40",
};

export default function BearingDecisionDashboard({ result }: Props) {
  const dash = useMemo(() => buildBearingDecisionDashboard(result), [result]);

  return (
    <section className="space-y-4 rounded-2xl border border-cyan-200/70 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 p-4 shadow-sm dark:border-cyan-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-300">
            Engineering Decision Dashboard
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Design status at a glance
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Answers the questions engineers ask after every ISO 281 / ISO 76 screen — not just raw
            outputs.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-800 dark:border-cyan-800 dark:bg-slate-950/60 dark:text-cyan-200">
          <Compass className="h-3 w-3" aria-hidden />
          PEDS screening
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-700 dark:bg-slate-950/50">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
              <th className="px-3 py-2 font-semibold">Metric</th>
              <th className="px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {dash.metrics.map((m) => {
              const Icon = TONE_ICON[m.tone];
              return (
                <tr
                  key={m.id}
                  className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${TONE_ROW[m.tone]}`}
                >
                  <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                    {m.label}
                    {m.detail ? (
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                        {m.detail}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 font-semibold tabular-nums text-slate-900 dark:text-white">
                      <span
                        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[m.tone]}`}
                        aria-hidden
                      />
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          m.tone === "safe"
                            ? "text-emerald-600"
                            : m.tone === "warning"
                              ? "text-amber-600"
                              : m.tone === "critical"
                                ? "text-red-600"
                                : "text-slate-400"
                        }`}
                        aria-hidden
                      />
                      {m.value}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BearingMarginGauge
          label="Life SF"
          value={
            result.lifeSafetyFactor != null && result.lifeSafetyFactor > 0
              ? result.lifeSafetyFactor
              : result.lifeUtilization > 0
                ? 1 / result.lifeUtilization
                : null
          }
          target={1.2}
          format={(v) => v.toFixed(2)}
        />
        <BearingMarginGauge
          label="Dynamic P/C"
          value={result.dynamicUtilization}
          target={0.85}
          invert
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <BearingMarginGauge
          label="Static s₀"
          value={result.staticSafetyFactor}
          target={1.2}
          format={(v) => v.toFixed(2)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DecisionAnswer
          question="Will this bearing meet the target life?"
          answer={dash.meetsTargetLifeAnswer}
          tone={dash.meetsTargetLife ? "safe" : "critical"}
        />
        <DecisionAnswer
          question="What is the governing limitation?"
          answer={dash.governingLimitationAnswer}
          tone={
            dash.governingLimitation === "All checks pass"
              ? "safe"
              : result.designStatus === "critical"
                ? "critical"
                : "warning"
          }
        />
        <DecisionAnswer
          question="How much design margin remains?"
          answer={dash.designMarginAnswer}
          tone={
            dash.limitingMargin == null
              ? "neutral"
              : dash.limitingMargin < 1
                ? "critical"
                : dash.limitingMargin < 1.25
                  ? "warning"
                  : "safe"
          }
        />
        <DecisionAnswer
          question="What single change would most improve life?"
          answer={dash.bestLeverAnswer}
          tone={dash.bestLever === "none" ? "safe" : "warning"}
        />
      </div>
    </section>
  );
}

function DecisionAnswer({
  question,
  answer,
  tone,
}: {
  question: string;
  answer: string;
  tone: DashboardTone;
}) {
  return (
    <div className={`rounded-xl border p-3 ${TONE_ROW[tone]}`}>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{question}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{answer}</p>
    </div>
  );
}
