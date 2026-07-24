"use client";

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";

const RISK_STYLES = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  high: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200",
} as const;

type Props = {
  diagnosis: ModuleDiagnosis;
  /** Optional callbacks for Apply buttons on recommendations */
  onApply?: (recommendation: DiagnosisRecommendation) => void;
};

export default function GenericDiagnosisPanel({ diagnosis, onApply }: Props) {
  const { overallRisk, summary, findings, recommendations } = diagnosis;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl px-4 py-3 ${RISK_STYLES[overallRisk]}`}>
        <p className="text-sm font-bold uppercase tracking-wide">Failure risk — {overallRisk}</p>
        <p className="mt-1 text-sm">{summary}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Findings</p>
        {findings.length === 0 ? (
          <p className="text-sm text-slate-500">No adverse findings at current screening thresholds.</p>
        ) : (
          findings.map((finding, index) => {
            // Derive categoryLabel from category if missing
            const label = finding.categoryLabel || finding.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <div
                key={`${finding.category}-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${RISK_STYLES[finding.level]}`}>
                    {finding.level}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{finding.title}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{finding.detail}</p>
              </div>
            );
          })
        )}
      </div>

      {recommendations.length > 0 ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">Suggested adjustments</p>
          <ul className="mt-3 space-y-2">
            {recommendations.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{rec.label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{rec.detail}</p>
                </div>
                {rec.fields && onApply ? (
                  <button
                    type="button"
                    onClick={() => onApply(rec)}
                    className="rounded-md bg-violet-700 px-2 py-1 text-xs font-semibold text-white hover:bg-violet-800"
                  >
                    Apply
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
