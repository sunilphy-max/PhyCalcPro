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
import type { TimingBeltResult } from "@/lib/powerTransmission/timing-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (TimingBeltResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function TimingBeltsResults({ result, lengthUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const loadMultipliers = Array.from({ length: 11 }, (_, i) => 0.5 + i * 0.1);
    const util = loadMultipliers.map((m) => result.powerUtilization * m);
    const shaftLoad = loadMultipliers.map((m) => result.shaftLoadEstimate * m);

    return [
      {
        id: "utilization",
        label: "Power utilization",
        content: (
          <EngineeringPlot
            title="Power utilization vs load multiplier"
            x={loadMultipliers}
            y={util}
            yLabel="Power utilization"
            xLabel="Load multiplier"
            xUnit="—"
            unitLabel="—"
            probeX={1}
            showPeak={false}
          />
        ),
      },
      {
        id: "shaft-load",
        label: "Shaft load",
        content: (
          <EngineeringPlot
            title="Estimated shaft load vs load multiplier"
            x={loadMultipliers}
            y={shaftLoad}
            yLabel="Shaft load"
            xLabel="Load multiplier"
            xUnit="—"
            unitLabel="N"
            probeX={1}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result]);

  return (
    <CalculatorResultsShell
      moduleId="timing-belts"
      fileName="timing-belt-drive"
      title="Export timing belt results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley data and calculate the drive."
      heading="Timing belt drive results"
      csvRows={
        result
          ? [
              { metric: "ratio", value: result.ratio },
              { metric: "beltLength", value: result.beltLength },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "tangentialForce", value: result.tangentialForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Speed ratio" numericValue={result.ratio} unit="—" tone="purple" />
            <CalculatorMetricCard label="Driven speed" numericValue={result.drivenSpeed} unit="rpm" tone="blue" />
            <CalculatorMetricCard
              label="Pitch diameter (driver)"
              numericValue={fromBase(result.pitchDiameterDriver, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Pitch diameter (driven)"
              numericValue={fromBase(result.pitchDiameterDriven, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Center distance"
              numericValue={fromBase(result.centerDistance, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Belt length (teeth)"
              numericValue={result.beltLengthTeeth}
              unit="—"
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization}
            unit="—"
            tone={result.powerUtilization > 1 ? "red" : "green"}
            size="lg"
          />
          <CalculatorMetricCard label="Tangential force" numericValue={result.tangentialForce} unit="N" tone="orange" />
          <CalculatorMetricCard
            label="Shaft load (est.)"
            numericValue={result.shaftLoadEstimate}
            unit="N"
            tone="orange"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="utilization" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
