"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { CamResult } from "@/lib/machine/cams/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { metricsModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<CamResult> | null;
  lengthUnit: string;
};

export default function CamResults({ result, lengthUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result?.angleDegrees?.length) return [];

    const angles = result.angleDegrees;
    const disp = result.displacement.map((d) => fromBase(d, "length", lengthUnit));
    const vel = result.velocity.map((v) => fromBase(v, "length", lengthUnit));
    const acc = result.acceleration.map((a) => fromBase(a, "length", lengthUnit));

    return [
      {
        id: "displacement",
        label: "Displacement",
        content: (
          <EngineeringPlot
            title="Follower displacement vs cam angle"
            x={angles}
            y={disp}
            yLabel="Displacement"
            xLabel="Cam angle"
            xUnit="deg"
            unitLabel={lengthUnit}
            showPeak
          />
        ),
      },
      {
        id: "velocity",
        label: "Velocity",
        content: (
          <EngineeringPlot
            title="Follower velocity vs cam angle"
            x={angles}
            y={vel}
            yLabel="Velocity"
            xLabel="Cam angle"
            xUnit="deg"
            unitLabel={`${lengthUnit}/rad`}
            showPeak
          />
        ),
      },
      {
        id: "acceleration",
        label: "Acceleration",
        content: (
          <EngineeringPlot
            title="Follower acceleration vs cam angle"
            x={angles}
            y={acc}
            yLabel="Acceleration"
            xLabel="Cam angle"
            xUnit="deg"
            unitLabel={`${lengthUnit}/rad²`}
            showPeak
          />
        ),
      },
    ];
  }, [lengthUnit, result]);

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
        <div className="space-y-4">
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Lift"
              numericValue={fromBase(result.lift, "length", lengthUnit)}
              unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Base circle"
              numericValue={fromBase(result.baseCircle, "length", lengthUnit)}
              unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Follower radius"
              numericValue={fromBase(result.radius, "length", lengthUnit)}
              unit={lengthUnit}
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
              numericValue={fromBase(result.peakVelocity, "length", lengthUnit)}
              unit={`${lengthUnit}/rad`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak acceleration"
              numericValue={fromBase(result.peakAcceleration, "length", lengthUnit)}
              unit={`${lengthUnit}/rad²`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Peak pressure angle"
              numericValue={result.peakPressureAngle * (180 / Math.PI)}
              unit="°"
              tone="red"
              size="lg"
            />
            <CalculatorMetricCard
              label="Rise angle"
              numericValue={result.riseAngle}
              unit="°"
              tone="green"
            />
          </CalculatorMetricGrid>
          {plotTabs.length > 0 ? (
            <EngineeringPlotPicker
              tabs={plotTabs}
              defaultTabId="displacement"
              label="Kinematic charts"
              variant="segmented"
            />
          ) : null}
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
