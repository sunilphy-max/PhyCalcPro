"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

/** Primary results container — matches column buckling module styling. */
export default function CalculatorResultsPanel({
  title,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`min-w-0 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-700 ${className}`.trim()}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      ) : null}
      <div className="grid min-w-0 grid-cols-1 gap-4">{children}</div>
    </div>
  );
}
