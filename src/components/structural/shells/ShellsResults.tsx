import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ShellResult } from "@/lib/structural/shells/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (ShellResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function ShellsResults({ result, lengthUnit, stressUnit }: Props) {
  const formatStress = (v: number) => formatEngineeringValue(fromBase(v, "stress", stressUnit), stressUnit);

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
            <CalculatorMetricCard label="Hoop stress" value={formatStress(result.hoopStress)} tone="purple" />
            <CalculatorMetricCard label="Axial stress" value={formatStress(result.axialStress)} tone="blue" />
            <CalculatorMetricCard label="Bending stress" value={formatStress(result.bendingStress)} tone="orange" />
            <CalculatorMetricCard label="von Mises stress" value={formatStress(result.vonMisesStress)} tone="red" />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              tone={result.safetyFactor >= 2 ? "green" : result.safetyFactor >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label="Max deflection (indicative)"
              value={formatEngineeringValue(fromBase(result.maxDeflection, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard label="Status" value={result.status} tone="blue" size="lg" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
