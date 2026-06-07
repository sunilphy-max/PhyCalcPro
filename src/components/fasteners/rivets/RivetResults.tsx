import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { RivetResult } from "@/lib/fasteners/rivets/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<RivetResult> | null;
  lengthUnit: string;
  forceUnit: string;
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

export default function RivetResults({ result, lengthUnit, forceUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="rivets"
      fileName="rivet"
      calculationSpec={result?.calculationSpec}
      title="Export Rivet results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the evaluation to see stress distribution and the controlling failure mode."
      heading="Rivet joint results"
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactorOverall", value: result.safetyFactorOverall },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Diameter"
              value={formatEngineeringValue(fromBase(result.rivetDiameter, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Plate thickness"
              value={formatEngineeringValue(fromBase(result.plateThickness, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard label="Quantity" numericValue={result.quantity} tone="blue" />
            <CalculatorMetricCard
              label="Rivet type"
              value={result.rivetType.replace("_", " ")}
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Shear stress"
              value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Axial stress"
              value={formatEngineeringValue(fromBase(result.axialStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bearing stress"
              value={formatEngineeringValue(fromBase(result.bearingStress, "stress", stressUnit), stressUnit)}
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
              label="Overall safety factor"
              numericValue={result.safetyFactorOverall}
              tone={safetyTone(result.safetyFactorOverall)}
              size="lg"
            />
            <CalculatorMetricCard
              label="Shear SF"
              numericValue={result.safetyFactorShear}
              tone={safetyTone(result.safetyFactorShear)}
            />
            <CalculatorMetricCard
              label="Bearing SF"
              numericValue={result.safetyFactorBearing}
              tone={safetyTone(result.safetyFactorBearing)}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricCard
            label="Design status"
            value={`${result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)} (${result.governingMode})`}
            tone={statusTone(result.designStatus)}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
