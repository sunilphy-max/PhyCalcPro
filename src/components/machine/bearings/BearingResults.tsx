"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<BearingResult> | null;
  loadUnit: string;
  speedRpm: number;
};

export default function BearingResults({ result, loadUnit, speedRpm }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const p0 = result.equivalentLoad;
    const multipliers = Array.from({ length: 15 }, (_, i) => 0.5 + i * 0.1);
    const loads = multipliers.map((m) => p0 * m);
    const lives = loads.map((p) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p, 1e-9);
      return (result.a1 * Math.pow(ratio, result.lifeExponent) * 1e6) / (Math.max(speedRpm, 1) * 60);
    });

    return [
      {
        id: "life-curve",
        label: "Life vs load",
        content: (
          <EngineeringPlot
            title="L10 life vs equivalent load (ISO 281)"
            x={loads.map((l) => fromBase(l, "force", loadUnit))}
            y={lives}
            yLabel="Rating life"
            xLabel="Equivalent load"
            xUnit={loadUnit}
            unitLabel="h"
            showPeak={false}
          />
        ),
      },
    ];
  }, [loadUnit, result, speedRpm]);

  return (
    <CalculatorResultsShell
      moduleId="bearings"
      fileName="bearing"
      calculationSpec={result?.calculationSpec}
      title="Export Bearing results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the calculation to see equivalent loads and dynamic rating requirements."
      heading="Bearing life results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "equivalentLoad", value: result.equivalentLoad },
              { metric: "requiredDynamicRating", value: result.requiredDynamicRating },
              { metric: "expectedLife", value: result.expectedLife },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Equivalent load"
              value={`${formatDisplayNumber(fromBase(result.equivalentLoad, "force", loadUnit))} ${loadUnit}`}
              tone="orange"
              size="lg"
            />
            <CalculatorMetricCard
              label={`Expected L10 life (a1 = ${result.a1})`}
              value={`${formatDisplayNumber(result.expectedLife)} h`}
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard
              label="Required dynamic rating"
              value={`${formatDisplayNumber(fromBase(result.requiredDynamicRating, "force", loadUnit))} ${loadUnit}`}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Life utilization"
              numericValue={result.lifeUtilization}
              status={result.lifeUtilization <= 1 ? "safe" : "danger"}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor}
            status={result.safetyFactor >= 1 ? "safe" : "danger"}
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="life-curve" label="Result chart" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
