"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CorrosionResult } from "@/lib/materials/corrosion/types";

type Props = {
  result: WithCalculationSpec<CorrosionResult> | null;
  thicknessUnit: string;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function CorrosionResults({ result, thicknessUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="corrosion"
      fileName="corrosion"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Corrosion results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Run the analysis to see allowance and required thickness results."
      heading="Corrosion allowance results"
      csvRows={
        result
          ? [
              { metric: "corrosionAllowance", value: result.corrosionAllowance, unit: thicknessUnit },
              { metric: "requiredThickness", value: result.requiredThickness, unit: thicknessUnit },
              { metric: "remainingThickness", value: result.remainingThickness, unit: thicknessUnit },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Corrosion allowance"
              value={formatEngineeringValue(result.corrosionAllowance, thicknessUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Required thickness"
              value={formatEngineeringValue(result.requiredThickness, thicknessUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Remaining thickness after life"
              value={formatEngineeringValue(result.remainingThickness, thicknessUnit)}
              tone="orange"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Design status"
            value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
            tone={statusTone(result.designStatus)}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
