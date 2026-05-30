"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import FrameDiagram from "./FrameDiagram";
import type { FrameResult } from "@/lib/structural/frames/types";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<FrameResult> | null;
};

export default function FrameResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="frames"
      fileName="frame"
      calculationSpec={result?.calculationSpec}
      title="Export Frame results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the frame analysis to visualize deflection and internal action."
      heading="Frame Results"
      csvRows={
        result
          ? [
              { metric: "maxDisplacement", value: result.maxDisplacement },
              { metric: "maxAxial", value: result.maxAxial },
              { metric: "maxMoment", value: result.maxMoment },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Max displacement"
              value={`${result.maxDisplacement.toExponential(3)} m`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max axial"
              value={`${result.maxAxial.toExponential(3)} N`}
              tone="purple"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max moment"
              value={`${result.maxMoment.toExponential(3)} N·m`}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlot
            title="Beam midspan deflection"
            x={result.topNodesX}
            y={result.topDeflections}
            yLabel="Deflection"
            xLabel="Position along top chord"
            xUnit="m"
            unitLabel="m"
          />
          <FrameDiagram result={result} />
          <FEAColorStrip
            title="Frame Deflection Intensity"
            x={result.topNodesX}
            values={result.topDeflections}
            unit="m"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
