import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { WeldResult } from "@/lib/fasteners/welds/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<WeldResult> | null;
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

export default function WeldResults({ result, lengthUnit, forceUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="welds"
      fileName="weld"
      calculationSpec={result?.calculationSpec}
      title="Export Weld results"
      description="Export the current weld analysis summary."
      empty={!result}
      emptyMessage="Run the evaluation to see governing weld stress and safety factors."
      heading="Weld analysis results"
      csvRows={
        result
          ? [
              { metric: "safetyFactorOverall", value: result.safetyFactorOverall },
              { metric: "resultantStress", value: fromBase(result.resultantStress, "stress", stressUnit) },
              { metric: "governingMode", value: result.governingMode },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Weld type"
              value={result.weldType.replace("_", " ")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Weld size"
              numericValue={fromBase(result.weldSize, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Throat size"
              numericValue={fromBase(result.throatSize, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Throat area"
              numericValue={result.totalThroatArea} unit="m²"
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Direct shear"
              numericValue={fromBase(result.directShearStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Moment shear"
              numericValue={fromBase(result.momentShearStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Combined shear"
              numericValue={fromBase(result.shearStress, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Axial stress"
              numericValue={fromBase(result.axialStress, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Resultant stress"
              numericValue={fromBase(result.resultantStress, "stress", stressUnit)} unit={stressUnit}
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
              label="Axial SF"
              numericValue={result.safetyFactorAxial} unit="—"
              tone={safetyTone(result.safetyFactorAxial)}
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
