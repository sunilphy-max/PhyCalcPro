"use client";

import type { ReactNode } from "react";
import { calculatorGuidanceClass } from "./styles";

type Props = {
  title: string;
  children: ReactNode;
};

/** Standard center column: module overview, diagrams, or usage notes. */
export default function CalculatorGuidancePanel({ title, children }: Props) {
  return (
    <div className={calculatorGuidanceClass}>
      <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 text-sm leading-7">{children}</div>
    </div>
  );
}
