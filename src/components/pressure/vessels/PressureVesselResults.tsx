"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressureVesselResult } from "@/lib/pressure/vessels/types";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<PressureVesselResult> | null;
};

export default function PressureVesselResults({ result }: Props) {
  const angleDegrees =
    result?.angles.map(
      (theta) => (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI)
    ) ?? [];

  return (
    <CalculatorResultsShell
      moduleId="vessels"
      fileName="pressure-vessel"
      calculationSpec={result?.calculationSpec}
      title="Export Pressure Vessel results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the pressure vessel model to see hoop stress and radial deflection."
      heading="Pressure Vessel Results"
      csvRows={
        result
          ? [
              { metric: "maxRadialDisplacement", value: result.maxRadialDisplacement },
              { metric: "maxHoopStress", value: result.maxHoopStress },
              { metric: "pressure", value: result.pressure },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Max radial displacement"
              value={`${result.maxRadialDisplacement.toExponential(3)} m`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max hoop stress"
              value={`${result.maxHoopStress.toExponential(3)} Pa`}
              tone="orange"
              size="lg"
            />
            <CalculatorMetricCard
              label="Internal pressure"
              value={`${result.pressure.toFixed(0)} Pa`}
              tone="purple"
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlot
            title="Radial displacement around circumference"
            x={angleDegrees}
            y={result.radialDisplacement}
            yLabel="Radial displacement"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="m"
          />
          <EngineeringPlot
            title="Hoop stress distribution"
            x={angleDegrees}
            y={result.hoopStress}
            yLabel="Hoop stress"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="Pa"
          />
          <FEAColorStrip
            title="Vessel Hoop Stress Intensity"
            x={angleDegrees}
            values={result.hoopStress}
            unit="Pa"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
