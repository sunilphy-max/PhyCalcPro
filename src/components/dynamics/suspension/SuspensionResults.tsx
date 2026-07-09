"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { SuspensionResult } from "@/lib/dynamics/suspension/types";

type Props = {
  result: WithCalculationSpec<SuspensionResult> | null;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function SuspensionResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="suspension"
      fileName="suspension"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Suspension results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Run the calculation to see roll angle and load transfer."
      heading="Suspension stability results"
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Lateral force"
              numericValue={result.lateralForce} unit="N"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Roll moment"
              numericValue={result.rollMoment} unit="N·m"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Roll angle"
              numericValue={result.rollAngleDegrees} unit="°"
              tone="orange"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Stability"
            value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
            tone={statusTone(result.designStatus)}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
