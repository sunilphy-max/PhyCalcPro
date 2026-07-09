import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ShellResult } from "@/lib/structural/shells/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (ShellResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function ShellsResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="shells"
      fileName="shell"
      title="Export shell results"
      description="Export membrane and bending stress summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter shell geometry and loads, then calculate."
      heading="Shell stress results"
      csvRows={
        result
          ? [
              { metric: "hoopStress", value: result.hoopStress },
              { metric: "axialStress", value: result.axialStress },
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Hoop stress"
              numericValue={fromBase(result.hoopStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Axial stress"
              numericValue={fromBase(result.axialStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bending stress"
              numericValue={fromBase(result.bendingStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="von Mises stress"
              numericValue={fromBase(result.vonMisesStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="red"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              unit="—"
              tone={result.safetyFactor >= 2 ? "green" : result.safetyFactor >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label="Max deflection (indicative)"
              numericValue={fromBase(result.maxDeflection, "length", lengthUnit)} unit={lengthUnit}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard label="Status" value={result.status} tone="blue" size="lg" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
