"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import type { FatigueResult } from "@/lib/materials/fatigue/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<FatigueResult> | null;
  alternatingUnit: string;
};

export default function FatigueResults({ result, alternatingUnit }: Props) {
  const status: "safe" | "warning" | "danger" | undefined = result
    ? result.designStatus === "safe"
      ? "safe"
      : result.designStatus === "warning"
        ? "warning"
        : "danger"
    : undefined;

  return (
    <CalculatorResultsShell
      moduleId="fatigue"
      fileName="fatigue"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Fatigue results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Enter loading and material values, then run the calculation."
      heading="Fatigue Results"
      csvRows={
        result
          ? [
              {
                metric: "allowableStress",
                value: result.allowableStress,
                unit: alternatingUnit,
              },
              { metric: "predictedCycles", value: result.predictedCycles },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Allowable alternating stress"
              value={`${result.allowableStress.toFixed(1)} ${alternatingUnit}`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Predicted life"
              value={`${result.predictedCycles.toLocaleString()} cycles`}
              tone="purple"
              size="lg"
            />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Design status"
            value={result.designStatus}
            status={status}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
