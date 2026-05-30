"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ShaftDashboard from "./ShaftDashboard";
import type { ShaftResult } from "@/lib/machine/shafts/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";

type Props = {
  result: WithCalculationSpec<ShaftResult> | null;
  projectName: string;
};

export default function ShaftResults({ result, projectName }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="shafts"
      fileName={projectName || "shaft"}
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Shaft results"
      description="Export the current summary and charts for review."
      empty={!result}
      heading="Shaft Results"
      qualityOverrides={{
        unitIntegrity: true,
        physicsValidation: true,
        chartConformance: true,
        pictorialCoverage: true,
        exportConsistency: true,
      }}
      csvRows={
        result
          ? [
              { metric: "maxStress", value: result.maxStress },
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "criticalSpeed", value: result.criticalSpeed },
            ]
          : undefined
      }
    >
      {result ? <ShaftDashboard result={result} /> : null}
    </CalculatorResultsShell>
  );
}
