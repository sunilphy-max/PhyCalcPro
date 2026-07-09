import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { SafetyFactorResult } from "@/lib/fasteners/safetyFactor/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<SafetyFactorResult> | null;
  lengthUnit: string;
  forceUnit: string;
  momentUnit: string;
  torqueUnit: string;
  stressUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function SafetyFactorResults({
  result,
  lengthUnit,
  forceUnit,
  momentUnit,
  torqueUnit,
  stressUnit,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="safety-factor"
      fileName="safety-factor"
      calculationSpec={result?.calculationSpec}
      title="Export Safety Factor results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter member geometry and loads to calculate combined stress and factor of safety."
      heading="Safety factor results"
      csvRows={
        result
          ? [
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactorYield", value: result.safetyFactorYield },
              { metric: "governingFactor", value: result.governingFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Diameter"
              numericValue={fromBase(result.diameter, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Gross area"
              numericValue={result.area} unit="m²"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Polar moment"
              numericValue={result.polarMoment} unit="m⁴"
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Axial stress"
              numericValue={fromBase(result.axialStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bending stress"
              numericValue={fromBase(result.bendingStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Torsional shear"
              numericValue={fromBase(result.torsionalStress, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Shear stress"
              numericValue={fromBase(result.shearStress, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Von Mises stress"
              numericValue={fromBase(result.vonMisesStress, "stress", stressUnit)} unit={stressUnit}
              tone="red"
              size="lg"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Governing safety factor"
              numericValue={result.governingFactor} unit="—"
              tone={safetyTone(result.governingFactor)}
              size="lg"
            />
            <CalculatorMetricCard
              label="Yield factor"
              numericValue={result.safetyFactorYield} unit="—"
              tone={safetyTone(result.safetyFactorYield)}
            />
            <CalculatorMetricCard
              label="Ultimate factor"
              numericValue={result.safetyFactorUltimate} unit="—"
              tone={safetyTone(result.safetyFactorUltimate)}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricCard
            label="Design status"
            value={`${result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)} (${result.governingLimit})`}
            tone={statusTone(result.designStatus)}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
