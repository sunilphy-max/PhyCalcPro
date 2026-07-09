"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { FatigueResult } from "@/lib/materials/fatigue/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type ChartInputs = {
  meanStress: number;
  alternatingStress: number;
  ultimateStrength: number;
  stressUnit: string;
};

type Props = {
  result: WithCalculationSpec<FatigueResult> | null;
  alternatingUnit: string;
  chartInputs?: ChartInputs;
};

export default function FatigueResults({ result, alternatingUnit, chartInputs }: Props) {
  const status: "safe" | "warning" | "danger" | undefined = result
    ? result.designStatus === "safe"
      ? "safe"
      : result.designStatus === "warning"
        ? "warning"
        : "danger"
    : undefined;

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result || !chartInputs) return [];
    const { meanStress, alternatingStress, ultimateStrength, stressUnit } = chartInputs;
    const se = result.correctedEndurance;
    const smLine = Array.from({ length: 30 }, (_, i) => (ultimateStrength * i) / 29);
    const goodmanLine = smLine.map((sm) => se * (1 - sm / Math.max(ultimateStrength, 1e-9)));
    const cycles = [1e3, 1e4, 1e5, 1e6, 1e7];
    const snStress = cycles.map((n) => se * Math.pow(1e6 / n, 0.09));

    return [
      {
        id: "goodman",
        label: "Goodman diagram",
        content: (
          <EngineeringPlot
            title="Mean vs alternating stress (Goodman)"
            x={smLine}
            y={goodmanLine}
            yLabel="Allowable alternating stress"
            xLabel="Mean stress"
            unitLabel={stressUnit}
            showPeak={false}
            series={[
              {
                y: smLine.map(() => alternatingStress),
                label: "Operating σa",
                color: "#ea580c",
              },
            ]}
          />
        ),
      },
      {
        id: "sn",
        label: "S-N curve",
        content: (
          <EngineeringPlot
            title="Estimated S-N curve (Basquin)"
            x={cycles.map((c) => Math.log10(c))}
            y={snStress}
            yLabel="Stress amplitude"
            xLabel="log10(cycles)"
            unitLabel={stressUnit}
            showPeak={false}
          />
        ),
      },
    ];
  }, [chartInputs, result]);

  return (
    <CalculatorResultsShell
      moduleId="fatigue"
      fileName="fatigue"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Fatigue results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Enter loading and material values, then run the calculation."
      heading="Fatigue Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              {
                metric: "allowableStress",
                value: result.allowableStress,
                unit: alternatingUnit,
              },
              { metric: "predictedCycles", value: result.predictedCycles },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Allowable alternating stress"
              numericValue={result.allowableStress} unit={alternatingUnit}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Predicted life"
              value={
                result.infiniteLife
                  ? "> 10⁶ cycles (infinite life)"
                  : `${result.predictedCycles.toLocaleString()} cycles`
              }
              tone="purple"
              size="lg"
            />
            <CalculatorMetricCard label="Safety factor" numericValue={result.safetyFactor} unit="—" tone="orange" size="lg" />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard label="Surface factor ka" numericValue={result.surfaceFactor} unit="—" tone="blue" />
            <CalculatorMetricCard label="Size factor kb" numericValue={result.sizeFactor} unit="—" tone="blue" />
            <CalculatorMetricCard label="Load factor kc" numericValue={result.loadFactor} unit="—" tone="blue" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard label="Design status" value={result.designStatus} status={status} size="lg" />
          {plotTabs.length > 0 ? (
            <EngineeringPlotPicker tabs={plotTabs} defaultTabId="goodman" label="Result chart" />
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
