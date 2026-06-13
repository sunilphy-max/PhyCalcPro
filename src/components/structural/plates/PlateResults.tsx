"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import PlateHeatmap from "./PlateHeatmap";
import type { PlateResult } from "@/lib/structural/plates/types";
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
  result: WithCalculationSpec<PlateResult> | null;
};

export default function PlateResults({ result }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    return [
      {
        id: "heatmap",
        label: "Deflection surface",
        content: (
          <PlateHeatmap
            title="Deflection surface"
            x={result.x}
            y={result.y}
            z={result.w}
            xUnit="m"
            yUnit="m"
            zUnit="m"
          />
        ),
      },
      {
        id: "along-length",
        label: "Deflection along length",
        content: (
          <EngineeringPlot
            title="Mid-span deflection along length"
            x={result.x}
            y={result.deflectionAlongLength}
            yLabel="Deflection"
            xLabel="Length"
            xUnit="m"
            unitLabel="m"
          />
        ),
      },
      {
        id: "along-width",
        label: "Deflection along width",
        content: (
          <EngineeringPlot
            title="Mid-span deflection along width"
            x={result.y}
            y={result.deflectionAlongWidth}
            yLabel="Deflection"
            xLabel="Width"
            xUnit="m"
            unitLabel="m"
          />
        ),
      },
    ];
  }, [result]);

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
      qualityOverrides={chartModuleQuality()}
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
              value={formatEngineeringValue(result.maxDeflection, "m")}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Peak bending moment"
              value={formatEngineeringValue(result.maxMoment, "N·m")}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="heatmap" label="Result chart" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
