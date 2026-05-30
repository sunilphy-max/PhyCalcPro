"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function CalculatorPlotSection({ title, children }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {title ? (
        <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      ) : null}
      {children}
    </div>
  );
}
