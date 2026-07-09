import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CamResult } from "@/lib/machine/cams/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { metricsModuleQuality } from "@/lib/calculator/qualityOverrides";

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
      description="Export the current kinematic summary for review."
      empty={!result}
      emptyMessage="Run the analysis to preview peak velocity, acceleration, and pressure angle."
      heading="Cam analysis results"
      qualityOverrides={metricsModuleQuality()}
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
              numericValue={fromBase(result.lift, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Base circle"
              numericValue={fromBase(result.baseCircle, "length", lengthUnit)} unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Follower radius"
              numericValue={fromBase(result.radius, "length", lengthUnit)} unit={lengthUnit}
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
              numericValue={result.peakVelocity}
              unit={`${lengthUnit}/rad`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak acceleration"
              numericValue={result.peakAcceleration}
              unit={`${lengthUnit}/rad²`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak pressure angle"
              numericValue={result.peakPressureAngle * (180 / Math.PI)} unit="°"
              tone="red"
              size="lg"
            />
            <CalculatorMetricCard
              label="Rise angle"
              numericValue={result.riseAngle} unit="°"
              tone="green"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
