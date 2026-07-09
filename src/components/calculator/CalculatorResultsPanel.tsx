"use client";

import type { ReactNode } from "react";
import CalculatorResultsTable from "./CalculatorResultsTable";
import { ResultsTableProvider } from "./ResultsTableContext";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

/** Primary results container — unified metrics table plus charts and module-specific output. */
export default function CalculatorResultsPanel({
  title,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`calculator-results-panel relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className}`.trim()}
    >
      {title ? (
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      ) : null}
      <ResultsTableProvider>
        <div className="grid min-w-0 grid-cols-1 gap-5">
          <CalculatorResultsTable />
          {children}
        </div>
      </ResultsTableProvider>
    </div>
  );
}
