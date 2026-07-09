"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { TemperaturePropertiesResult } from "@/lib/materials/temperatureProperties/types";

type Props = {
  result: WithCalculationSpec<TemperaturePropertiesResult> | null;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function TemperaturePropertiesResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="temperature-properties"
      fileName="temperature-properties"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Temperature Properties results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Run the calculation to see adjusted strength and expansion values."
      heading="Temperature-adjusted properties"
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Adjusted yield strength"
              numericValue={result.adjustedYield} unit="MPa"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Adjusted modulus"
              numericValue={result.adjustedModulus} unit="GPa"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Thermal expansion per meter"
              numericValue={result.expansionPerMeter} unit="/°C"
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
