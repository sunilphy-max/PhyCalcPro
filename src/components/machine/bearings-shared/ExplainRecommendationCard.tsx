"use client";

import { useState, type ReactNode } from "react";
import { Lightbulb, Sparkles } from "lucide-react";

export type ExplainRecommendationModel = {
  summary: string;
  narrative: string;
  reasons: string[];
  costBand?: string;
  primaryLabel?: string;
  primaryTitle?: string;
  alternativeLabels?: string[];
};

type Props = {
  advisor: ExplainRecommendationModel;
  /** Optional slot below the expand panel (e.g. catalog cards). */
  children?: ReactNode;
  headline?: string;
  statusLabel?: string;
  statusTone?: "safe" | "warning" | "critical";
};

/**
 * Expandable Engineering Advisor — deterministic “Explain Recommendation” narrative.
 */
export default function ExplainRecommendationCard({
  advisor,
  children,
  headline = "Intelligent recommendation",
  statusLabel,
  statusTone = "safe",
}: Props) {
  const [explainOpen, setExplainOpen] = useState(false);

  const statusClass =
    statusTone === "safe"
      ? "text-emerald-600 dark:text-emerald-400"
      : statusTone === "warning"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{headline}</p>
          {statusLabel ? (
            <p className={`mt-1 text-2xl font-bold tracking-tight ${statusClass}`}>{statusLabel}</p>
          ) : null}
          {advisor.summary ? (
            <p className="mt-1 max-w-xl text-xs text-slate-600 dark:text-slate-400">{advisor.summary}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setExplainOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 shadow-sm hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {explainOpen ? "Hide explanation" : "Explain Recommendation"}
        </button>
      </div>

      {explainOpen ? (
        <div className="rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white p-3.5 dark:border-violet-900/50 dark:from-violet-950/40 dark:to-slate-950/60">
          <div className="flex items-start gap-2">
            <Lightbulb
              className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300"
              aria-hidden
            />
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                AI Engineering Advisor
              </p>
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {advisor.narrative}
              </p>
              {advisor.reasons.length > 0 ? (
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  {advisor.reasons.map((reason) => (
                    <li key={reason} className="flex gap-1.5">
                      <span className="text-violet-500">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-[10px] text-slate-400">
                Deterministic engineering narrative from duty inputs — not a generative LLM.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}
