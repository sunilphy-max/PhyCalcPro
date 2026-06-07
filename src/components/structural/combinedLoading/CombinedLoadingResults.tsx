"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";

type Props = {
  result: WithCalculationSpec<CombinedLoadingResult> | null;
};

export default function CombinedLoadingResults({ result }: Props) {
  const statusTone =
    result?.designStatus === "safe"
      ? "green"
      : result?.designStatus === "warning"
        ? "orange"
        : "red";

  return (
    <CalculatorResultsShell
      moduleId="combined-loading"
      fileName="combined-loading"
      title="Export Combined Loading results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Run the calculation to review combined stresses and safety factor."
      heading="Combined loading results"
      result={result ?? undefined}
      csvRows={
        result
          ? [
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "axialStress", value: result.axialStress },
              { metric: "bendingStress", value: result.bendingStress },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Von Mises stress"
              value={formatEngineeringValue(result.vonMisesStress, "MPa")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              tone={result.safetyFactor >= 1 ? "green" : "red"}
            />
            <CalculatorMetricCard
              label="Axial stress"
              value={formatEngineeringValue(result.axialStress, "MPa")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bending stress"
              value={formatEngineeringValue(result.bendingStress, "MPa")}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Design status"
            value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
            tone={statusTone}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
