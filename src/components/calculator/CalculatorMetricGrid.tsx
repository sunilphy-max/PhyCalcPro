"use client";

import type { ReactNode } from "react";
import { useResultsTableSectionRegistration } from "./ResultsTableContext";

type Props = {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
  /** Optional section heading row in the unified results table. */
  section?: string;
};

/** Groups metrics for the unified results table; renders no layout chrome. */
export default function CalculatorMetricGrid({
  children,
  section,
  className = "",
}: Props) {
  useResultsTableSectionRegistration(section);

  return <div className={`contents ${className}`.trim()}>{children}</div>;
}
