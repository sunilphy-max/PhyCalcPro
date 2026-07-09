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
              numericValue={fromBase(result.rivetDiameter, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Plate thickness"
              numericValue={fromBase(result.plateThickness, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard label="Quantity" numericValue={result.quantity} unit="—" tone="blue" />
            <CalculatorMetricCard
              label="Rivet type"
              value={result.rivetType.replace("_", " ")}
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Shear stress"
              numericValue={fromBase(result.shearStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Axial stress"
              numericValue={fromBase(result.axialStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bearing stress"
              numericValue={fromBase(result.bearingStress, "stress", stressUnit)} unit={stressUnit}
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
              label="Overall safety factor"
              numericValue={result.safetyFactorOverall} unit="—"
              tone={safetyTone(result.safetyFactorOverall)}
              size="lg"
            />
            <CalculatorMetricCard
              label="Shear SF"
              numericValue={result.safetyFactorShear} unit="—"
              tone={safetyTone(result.safetyFactorShear)}
            />
            <CalculatorMetricCard
              label="Bearing SF"
              numericValue={result.safetyFactorBearing} unit="—"
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
