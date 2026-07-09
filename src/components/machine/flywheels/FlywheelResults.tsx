import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { FlywheelResult } from "@/lib/machine/flywheels/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<FlywheelResult> | null;
  lengthUnit: string;
  densityUnit: string;
  stressUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function FlywheelResults({ result, lengthUnit, densityUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="flywheels"
      fileName="flywheel"
      calculationSpec={result?.calculationSpec}
      title="Export Flywheel results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the calculation to review stored energy, inertia, and rim stress."
      heading="Flywheel results"
      csvRows={
        result
          ? [
              { metric: "storedEnergy", value: result.storedEnergy },
              { metric: "inertia", value: result.inertia },
              { metric: "hoopStress", value: result.hoopStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Outer diameter"
              numericValue={fromBase(result.outerDiameter, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Thickness"
              numericValue={fromBase(result.thickness, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Mass"
              numericValue={result.mass} unit="kg"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Inertia"
              numericValue={result.inertia} unit="kg·m²"
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Stored energy"
              numericValue={result.storedEnergy} unit="J"
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard
              label="Angular speed"
              numericValue={result.angularSpeed} unit="rad/s"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Hoop stress"
              numericValue={fromBase(result.hoopStress, "stress", stressUnit)} unit={stressUnit}
              tone="red"
            />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor} unit="—"
              tone={safetyTone(result.safetyFactor)}
              size="lg"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
