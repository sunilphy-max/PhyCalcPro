import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CamResult } from "@/lib/machine/cams/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<CamResult> | null;
  lengthUnit: string;
};

export default function CamResults({ result, lengthUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="cams"
      fileName="cam"
      calculationSpec={result?.calculationSpec}
      title="Export Cam results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the analysis to preview peak velocity, acceleration, and pressure angle."
      heading="Cam analysis results"
      csvRows={
        result
          ? [
              { metric: "peakVelocity", value: result.peakVelocity },
              { metric: "peakAcceleration", value: result.peakAcceleration },
              { metric: "peakPressureAngle", value: result.peakPressureAngle },
              { metric: "riseAngle", value: result.riseAngle },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Lift"
              value={formatEngineeringValue(fromBase(result.lift, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Base circle"
              value={formatEngineeringValue(fromBase(result.baseCircle, "length", lengthUnit), lengthUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Follower radius"
              value={formatEngineeringValue(fromBase(result.radius, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Motion law"
              value={result.motionLaw.replace(/_/g, " ")}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Peak velocity"
              value={formatEngineeringValue(result.peakVelocity, `${lengthUnit}/rad`)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak acceleration"
              value={formatEngineeringValue(result.peakAcceleration, `${lengthUnit}/rad²`)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak pressure angle"
              value={formatEngineeringValue(result.peakPressureAngle * (180 / Math.PI), "°")}
              tone="red"
              size="lg"
            />
            <CalculatorMetricCard
              label="Rise angle"
              value={formatEngineeringValue(result.riseAngle, "°")}
              tone="green"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
