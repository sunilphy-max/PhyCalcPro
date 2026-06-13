"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import BucklingDashboard from "./BucklingDashboard";
import type { BucklingResult } from "@/lib/structural/columns/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<BucklingResult> | null;
  projectName: string;
};

export default function BucklingResults({ result, projectName }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="columns"
      fileName={projectName || "buckling"}
      calculationSpec={result?.calculationSpec}
      title="Export Buckling results"
      description="Export a detailed report of the current analysis."
      empty={!result}
      emptyMessage="Define column geometry and axial load, then run the buckling check."
      heading="Buckling Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "Pcr", value: result.Pcr },
              { metric: "criticalLoad", value: result.criticalLoad },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "slenderness", value: result.slenderness },
            ]
          : undefined
      }
    >
      {result ? <BucklingDashboard result={result} /> : null}
    </CalculatorResultsShell>
  );
}
