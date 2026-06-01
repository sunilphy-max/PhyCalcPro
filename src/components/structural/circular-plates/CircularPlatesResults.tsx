import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { CircularPlateResult } from "@/lib/structural/circular-plates/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

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
              value={formatEngineeringValue(
                fromBase(result.maxDeflection, "length", lengthUnit),
                lengthUnit
              )}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Max bending stress"
              value={formatEngineeringValue(fromBase(result.maxStress, "stress", stressUnit), stressUnit)}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Flexural rigidity D"
            value={formatEngineeringValue(result.rigidity, "N·m")}
            tone="blue"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Roark deflection (reference)"
              value={formatEngineeringValue(
                fromBase(result.roarkMaxDeflection, "length", lengthUnit),
                lengthUnit
              )}
              tone="green"
            />
            <CalculatorMetricCard
              label="FDM vs Roark error"
              value={`${result.femDeflectionErrorPercent.toFixed(1)}%`}
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
