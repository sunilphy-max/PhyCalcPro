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
import type { RollerChainResult } from "@/lib/powerTransmission/roller-chains/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (RollerChainResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  powerUnit: string;
};

export default function RollerChainsResults({ result, lengthUnit, powerUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const loadMultipliers = Array.from({ length: 11 }, (_, i) => 0.5 + i * 0.1);
    const util = loadMultipliers.map((m) => result.powerUtilization * m);
    const life = loadMultipliers.map((m) => result.estimatedLifeHours / Math.max(m, 1e-9) ** 3);
    const tension = loadMultipliers.map((m) => result.chainTension * m);

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
        id: "life",
        label: "Estimated life",
        content: (
          <EngineeringPlot
            title="Estimated chain life vs load multiplier"
            x={loadMultipliers}
            y={life}
            yLabel="Estimated life"
            xLabel="Load multiplier"
            xUnit="—"
            unitLabel="hr"
            probeX={1}
            showPeak={false}
          />
        ),
      },
      {
        id: "tension",
        label: "Chain tension",
        content: (
          <EngineeringPlot
            title="Chain tension vs load multiplier"
            x={loadMultipliers}
            y={tension}
            yLabel="Chain tension"
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
      moduleId="roller-chains"
      fileName="roller-chain-drive"
      title="Export roller chain results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter sprocket data and calculate the drive."
      heading="Roller chain drive results"
      csvRows={
        result
          ? [
              { metric: "ratio", value: result.ratio },
              { metric: "chainTension", value: result.chainTension },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "estimatedLifeHours", value: result.estimatedLifeHours },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Speed ratio" numericValue={result.ratio} unit="—" tone="purple" />
            <CalculatorMetricCard label="Driven speed" numericValue={result.drivenSpeed} unit="rpm" tone="blue" />
            <CalculatorMetricCard label="Chain speed" numericValue={result.chainSpeed} unit="m/s" tone="blue" />
            <CalculatorMetricCard
              label="Center distance"
              numericValue={fromBase(result.centerDistance, "length", lengthUnit)}
              unit={lengthUnit}
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
          <CalculatorMetricCard label="Chain tension" numericValue={result.chainTension} unit="N" tone="orange" />
          <CalculatorMetricCard
            label="Power capacity (est.)"
            numericValue={result.powerCapacity / (powerUnit === "kW" ? 1000 : 1)}
            unit={powerUnit}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Estimated life"
            numericValue={result.estimatedLifeHours}
            unit="hr"
            tone="blue"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="utilization" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
