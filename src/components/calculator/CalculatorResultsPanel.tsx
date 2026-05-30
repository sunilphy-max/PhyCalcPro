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
    <div className={`rounded-xl bg-white p-4 shadow-sm ${className}`.trim()}>
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      ) : null}
      <div className="grid grid-cols-1 gap-4">{children}</div>
    </div>
  );
}
