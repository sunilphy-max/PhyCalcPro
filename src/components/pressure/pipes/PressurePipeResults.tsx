"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressurePipeResult } from "@/lib/pressure/pipes/types";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<PressurePipeResult> | null;
};

export default function PressurePipeResults({ result }: Props) {
  const angles =
    result?.angles.map((theta) =>
      (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI)
    ) ?? [];

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    return [
      {
        id: "hoop-stress",
        label: "Hoop stress",
        content: (
          <EngineeringPlot
            title="Hoop stress distribution"
            x={angles}
            y={result.hoopStress}
            yLabel="Hoop stress"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="Pa"
          />
        ),
      },
      {
        id: "radial-disp",
        label: "Radial displacement",
        content: (
          <EngineeringPlot
            title="Radial displacement around circumference"
            x={angles}
            y={result.radialDisplacement}
            yLabel="Radial displacement"
            xLabel="Circumference angle"
            xUnit="deg"
            unitLabel="m"
          />
        ),
      },
      {
        id: "intensity",
        label: "Stress intensity",
        content: (
          <FEAColorStrip title="Hoop stress intensity" x={angles} values={result.hoopStress} unit="Pa" />
        ),
      },
    ];
  }, [angles, result]);

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
      qualityOverrides={chartModuleQuality()}
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
              value={formatEngineeringValue(result.maxRadialDisplacement, "m")}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max hoop stress"
              value={formatEngineeringValue(result.maxHoopStress, "Pa")}
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
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="hoop-stress" label="Result chart" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
