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
              value={formatEngineeringValue(fromBase(result.weldSize, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Throat size"
              value={formatEngineeringValue(fromBase(result.throatSize, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Throat area"
              value={formatEngineeringValue(result.totalThroatArea, "m²")}
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Direct shear"
              value={formatEngineeringValue(fromBase(result.directShearStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Moment shear"
              value={formatEngineeringValue(fromBase(result.momentShearStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Combined shear"
              value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Axial stress"
              value={formatEngineeringValue(fromBase(result.axialStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Resultant stress"
              value={formatEngineeringValue(fromBase(result.resultantStress, "stress", stressUnit), stressUnit)}
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
              label="Axial SF"
              numericValue={result.safetyFactorAxial}
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
