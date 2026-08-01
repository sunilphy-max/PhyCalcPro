"use client";

import {
  calculatorPrimaryButtonClass,
  calculatorSecondaryButtonClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
import PackageUploadPanel from "@/components/manufacturing/drawing/PackageUploadPanel";
import type { DrawingPackage } from "@/lib/manufacturing/package";

type Props = {
  onPackage: (pkg: DrawingPackage) => void;
  onChooseSimple: () => void;
  projectName: string;
  setProjectName: (name: string) => void;
  savedCount: number;
  onShowSaved?: () => void;
};

/** Calm empty state before any drawing package is loaded. */
export default function ToleranceWelcome({
  onPackage,
  onChooseSimple,
  projectName,
  setProjectName,
  savedCount,
  onShowSaved,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 px-6 py-8 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-400">
          Tolerance stack-up
        </p>
        <h2 className="mt-2 max-w-lg text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          From drawing package to auditable stack
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Upload a ZIP with <span className="font-medium text-slate-800 dark:text-slate-200">BOM.xlsx</span>{" "}
          and PDFs, pick contributors in order, confirm the chain, then run verified WC / RSS / Monte Carlo.
        </p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { n: "1", t: "Upload", d: "BOM + drawings" },
            { n: "2", t: "Build", d: "Select dimensions" },
            { n: "3", t: "Solve", d: "Review results" },
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60"
            >
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                Step {step.n}
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{step.t}</p>
              <p className="text-xs text-slate-500">{step.d}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2">
        <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
          Study name
          <input
            className={calculatorTextInputClass}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Gearbox endplay Rev C"
          />
        </label>
      </div>

      <PackageUploadPanel onPackage={onPackage} />

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
        <button type="button" className={calculatorSecondaryButtonClass} onClick={onChooseSimple}>
          Enter tolerances manually
        </button>
        {savedCount > 0 && onShowSaved ? (
          <button type="button" className={calculatorSecondaryButtonClass} onClick={onShowSaved}>
            Open saved ({savedCount})
          </button>
        ) : null}
        <a
          className={`${calculatorPrimaryButtonClass} !w-auto px-4 py-2 text-center`}
          href="/templates/PhyCalcPro-BOM-template.csv"
          download
        >
          Download BOM template
        </a>
      </div>
    </div>
  );
}
