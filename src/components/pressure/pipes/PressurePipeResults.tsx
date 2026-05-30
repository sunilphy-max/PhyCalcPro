"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressurePipeResult } from "@/lib/pressure/pipes/types";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<PressurePipeResult> | null;
};

export default function PressurePipeResults({ result }: Props) {
  const angles =
    result?.angles.map((theta) =>
      (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI)
    ) ?? [];

  return (
    <CalculatorResultsShell
      moduleId="pipes"
      fileName="pressure-pipe"
      calculationSpec={result?.calculationSpec}
      title="Export Pressure Pipe results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the pipe model to see hoop stress and radial displacement around the circumference."
      heading="Pipe Results"
      csvRows={
        result
          ? [
              { metric: "maxRadialDisplacement", value: result.maxRadialDisplacement },
              { metric: "maxHoopStress", value: result.maxHoopStress },
              { metric: "segments", value: result.segments },
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
              label="Circumference nodes"
              value={result.segments}
              tone="purple"
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlot
            title="Radial displacement around circumference"
            x={angles}
            y={result.radialDisplacement}
            yLabel="Radial displacement"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="m"
          />
          <EngineeringPlot
            title="Hoop stress distribution"
            x={angles}
            y={result.hoopStress}
            yLabel="Hoop stress"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="Pa"
          />
          <FEAColorStrip
            title="Hoop Stress Intensity"
            x={angles}
            values={result.hoopStress}
            unit="Pa"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
