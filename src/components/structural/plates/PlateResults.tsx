"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import PlateHeatmap from "./PlateHeatmap";
import type { PlateResult } from "@/lib/structural/plates/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<PlateResult> | null;
};

export default function PlateResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="plates"
      fileName="plate"
      calculationSpec={result?.calculationSpec}
      title="Export Plate results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the plate analysis to display deflection and moment results."
      heading="Plate Results"
      csvRows={
        result
          ? [
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "maxMoment", value: result.maxMoment },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Max deflection"
              value={`${result.maxDeflection.toExponential(3)} m`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Peak bending moment"
              value={`${result.maxMoment.toExponential(3)} N·m`}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlot
            title="Mid-span deflection along length"
            x={result.x}
            y={result.deflectionAlongLength}
            yLabel="Deflection"
            xLabel="Length"
            xUnit="m"
            unitLabel="m"
          />
          <EngineeringPlot
            title="Mid-span deflection along width"
            x={result.y}
            y={result.deflectionAlongWidth}
            yLabel="Deflection"
            xLabel="Width"
            xUnit="m"
            unitLabel="m"
          />
          <PlateHeatmap
            title="Deflection surface"
            x={result.x}
            y={result.y}
            z={result.w}
            xUnit="m"
            yUnit="m"
            zUnit="m"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
