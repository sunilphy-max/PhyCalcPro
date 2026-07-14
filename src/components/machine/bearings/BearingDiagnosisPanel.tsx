"use client";

import type { BearingDiagnosis } from "@/lib/machine/bearings/diagnosis";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

const RISK_STYLES = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  high: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200",
} as const;

const CATEGORY_LABELS = {
  overload: "Overload",
  lubrication: "Lubrication",
  misalignment: "Misalignment",
  speed: "Speed",
  contamination: "Contamination",
  min_load: "Min load",
  thermal: "Thermal",
  arrangement: "Arrangement",
} as const;

type Props = {
  diagnosis: BearingDiagnosis;
  onSelectReplacement?: (designation: string) => void;
};

export default function BearingDiagnosisPanel({ diagnosis, onSelectReplacement }: Props) {
  return (
    <div className="space-y-4">
      <div className={`rounded-xl px-4 py-3 ${RISK_STYLES[diagnosis.overallRisk]}`}>
        <p className="text-sm font-bold uppercase tracking-wide">Failure risk — {diagnosis.overallRisk}</p>
        <p className="mt-1 text-sm">{diagnosis.summary}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Findings</p>
        {diagnosis.findings.map((finding, index) => (
          <div
            key={`${finding.category}-${index}`}
            className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${RISK_STYLES[finding.level]}`}>
                {finding.level}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {CATEGORY_LABELS[finding.category]}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{finding.title}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{finding.detail}</p>
          </div>
        ))}
      </div>

      {diagnosis.replacements.length > 0 ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">Recommended replacements</p>
          <ul className="mt-3 space-y-2">
            {diagnosis.replacements.map((option) => (
              <li
                key={option.designation}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="font-semibold">
                  {option.manufacturer} {option.designation}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <span>Lnm ≈ {formatDisplayNumber(option.modifiedLifeHours)} h</span>
                  <span>P/C {formatDisplayNumber(option.dynamicUtilization)}</span>
                  <span className={option.passes ? "text-emerald-700" : "text-red-700"}>
                    {option.passes ? "Passes" : "Review"}
                  </span>
                  {onSelectReplacement ? (
                    <button
                      type="button"
                      onClick={() => onSelectReplacement(option.designation)}
                      className="rounded-md bg-violet-700 px-2 py-1 font-semibold text-white hover:bg-violet-800"
                    >
                      Apply
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
