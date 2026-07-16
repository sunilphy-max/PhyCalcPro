"use client";

import { useMemo } from "react";
import { fromBase } from "@/lib/units/conversions";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { MultiPulleyResult } from "@/lib/powerTransmission/multi-pulley/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (MultiPulleyResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function MultiPulleyResults({ result, lengthUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const indices = result.wrapAnglesDeg.map((_, i) => i + 1);

    const tabs: PlotPickerTab[] = [
      {
        id: "wrap",
        label: "Wrap angles",
        content: (
          <EngineeringPlot
            title="Wrap angle by pulley"
            x={indices}
            y={result.wrapAnglesDeg}
            yLabel="Wrap angle"
            xLabel="Pulley index"
            xUnit="—"
            unitLabel="°"
            showPeak
          />
        ),
      },
    ];

    if (result.radialLoads?.length) {
      tabs.push({
        id: "radial",
        label: "Radial loads",
        content: (
          <EngineeringPlot
            title="Radial shaft load by pulley"
            x={result.radialLoads.map((_, i) => i + 1)}
            y={result.radialLoads}
            yLabel="Radial load"
            xLabel="Pulley index"
            xUnit="—"
            unitLabel="N"
            showPeak
          />
        ),
      });
    }

    if (result.segmentLengths?.length) {
      tabs.push({
        id: "segments",
        label: "Segment lengths",
        content: (
          <EngineeringPlot
            title="Belt segment lengths"
            x={result.segmentLengths.map((_, i) => i + 1)}
            y={result.segmentLengths.map((v) => fromBase(v, "length", lengthUnit))}
            yLabel="Segment length"
            xLabel="Segment index"
            xUnit="—"
            unitLabel={lengthUnit}
            showPeak
          />
        ),
      });
    }

    return tabs;
  }, [lengthUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="multi-pulley"
      fileName="multi-pulley-layout"
      title="Export multi-pulley results"
      description="Export belt length and wrap angle summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley diameters and center distance."
      heading="Multi-pulley layout results"
      csvRows={
        result
          ? [
              { metric: "totalBeltLength", value: result.totalBeltLength },
              { metric: "minWrapAngle", value: result.minWrapAngle },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricCard
            label="Total belt length"
            numericValue={fromBase(result.totalBeltLength, "length", lengthUnit)}
            unit={lengthUnit}
            tone="blue"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            {result.wrapAnglesDeg.map((wrap, i) => (
              <CalculatorMetricCard
                key={i}
                label={`Wrap — pulley ${i + 1}`}
                numericValue={wrap}
                unit="°"
                tone={wrap < 120 ? "red" : "blue"}
              />
            ))}
          </CalculatorMetricGrid>
          {result.radialLoads?.length ? (
            <CalculatorMetricGrid cols={2}>
              {result.radialLoads.map((load, i) => (
                <CalculatorMetricCard
                  key={i}
                  label={`Radial load — pulley ${i + 1}`}
                  numericValue={load}
                  unit="N"
                />
              ))}
            </CalculatorMetricGrid>
          ) : null}
          <CalculatorMetricCard
            label="Minimum wrap angle"
            numericValue={result.minWrapAngle}
            unit="°"
            tone={result.minWrapAngle < 120 ? "red" : "green"}
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="wrap" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
