import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { CircularPlateResult } from "@/lib/structural/circular-plates/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: (CircularPlateResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function CircularPlatesResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="circular-plates"
      fileName="circular-plate"
      title="Export circular plate results"
      description="Export deflection, stress and flexural rigidity."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter plate geometry and pressure, then calculate."
      heading="Circular plate results"
      csvRows={
        result
          ? [
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "maxStress", value: result.maxStress },
              { metric: "rigidity", value: result.rigidity },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Max deflection (center)"
              numericValue={fromBase(result.maxDeflection, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Max bending stress"
              numericValue={fromBase(result.maxStress, "stress", stressUnit)} unit={stressUnit}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Flexural rigidity D"
            numericValue={result.rigidity} unit="N·m"
            tone="blue"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Roark deflection (reference)"
              numericValue={fromBase(result.roarkMaxDeflection, "length", lengthUnit)}
              unit={lengthUnit}
              tone="green"
            />
            <CalculatorMetricCard
              label="FDM vs Roark error"
              numericValue={result.femDeflectionErrorPercent} unit="%"
              tone={result.femDeflectionErrorPercent < 15 ? "green" : "orange"}
            />
          </CalculatorMetricGrid>
          <p className="text-sm text-slate-500">
            Mesh segments: {result.meshSegments}. Refine mesh to converge toward Roark closed-form.
          </p>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
