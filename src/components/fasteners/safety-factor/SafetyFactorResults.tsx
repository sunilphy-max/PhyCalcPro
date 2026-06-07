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
              value={formatEngineeringValue(fromBase(result.diameter, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Gross area"
              value={formatEngineeringValue(result.area, "m²")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Polar moment"
              value={formatEngineeringValue(result.polarMoment, "m⁴")}
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Axial stress"
              value={formatEngineeringValue(fromBase(result.axialStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bending stress"
              value={formatEngineeringValue(fromBase(result.bendingStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Torsional shear"
              value={formatEngineeringValue(fromBase(result.torsionalStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Shear stress"
              value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Von Mises stress"
              value={formatEngineeringValue(fromBase(result.vonMisesStress, "stress", stressUnit), stressUnit)}
              tone="red"
              size="lg"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Governing safety factor"
              numericValue={result.governingFactor}
              tone={safetyTone(result.governingFactor)}
              size="lg"
            />
            <CalculatorMetricCard
              label="Yield factor"
              numericValue={result.safetyFactorYield}
              tone={safetyTone(result.safetyFactorYield)}
            />
            <CalculatorMetricCard
              label="Ultimate factor"
              numericValue={result.safetyFactorUltimate}
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
