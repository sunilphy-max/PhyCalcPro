import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CompositeResult } from "@/lib/materials/composites/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<CompositeResult> | null;
  stressUnit: string;
  densityUnit: string;
};

export default function CompositeResults({ result, stressUnit, densityUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="composites"
      fileName="composite"
      calculationSpec={result?.calculationSpec}
      title="Export Composite results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter fiber and matrix properties to estimate composite stiffness, strength, and density."
      heading="Composite property results"
      csvRows={
        result
          ? [
              { metric: "E_longitudinal", value: result.E_longitudinal },
              { metric: "E_transverse", value: result.E_transverse },
              { metric: "density", value: result.density },
              { metric: "stiffnessRatio", value: result.stiffnessRatio },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Fiber volume fraction"
              numericValue={result.fiberVolumeFraction * 100} unit="%"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Matrix volume fraction"
              numericValue={result.matrixVolumeFraction * 100} unit="%"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Density"
              numericValue={fromBase(result.density, "density", densityUnit)} unit={densityUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Poisson's ratio"
              numericValue={result.poissonRatio} unit="—"
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Longitudinal modulus"
              numericValue={fromBase(result.E_longitudinal, "stress", stressUnit)} unit={stressUnit}
              tone="green"
            />
            <CalculatorMetricCard
              label="Transverse modulus"
              numericValue={fromBase(result.E_transverse, "stress", stressUnit)} unit={stressUnit}
              tone="green"
            />
            <CalculatorMetricCard
              label="Longitudinal strength"
              numericValue={fromBase(result.strength_longitudinal, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Transverse strength"
              numericValue={fromBase(result.strength_transverse, "stress", stressUnit)} unit={stressUnit}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Modulus at ply angle"
              numericValue={fromBase(result.E_atPlyAngle, "stress", stressUnit)} unit={stressUnit}
              tone="green"
            />
            <CalculatorMetricCard
              label="Tsai-Hill utilization"
              numericValue={result.tsaiHillUtilization} unit="—"
              tone={result.tsaiHillUtilization > 1 ? "red" : "green"}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Stiffness ratio vs matrix"
            numericValue={result.stiffnessRatio} unit="—"
            tone="red"
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
