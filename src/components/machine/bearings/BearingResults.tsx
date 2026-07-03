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
    const loadMultipliers = Array.from({ length: 15 }, (_, i) => 0.5 + i * 0.1);
    const loads = loadMultipliers.map((m) => p0 * m);
    const basicLives = loads.map((p) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p, 1e-9);
      return (result.a1 * Math.pow(ratio, result.lifeExponent) * 1e6) / (Math.max(speedRpm, 1) * 60);
    });
    const modifiedLives = loads.map((p) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p, 1e-9);
      return (
        (result.a1 * result.aIso * Math.pow(ratio, result.lifeExponent) * 1e6) /
        (Math.max(speedRpm, 1) * 60)
      );
    });

    const speedRange = Array.from({ length: 12 }, (_, i) => 0.4 + i * 0.1).map(
      (m) => speedRpm * m
    );
    const speedLives = speedRange.map((n) => {
      const ratio = result.dynamicLoadRatingN / Math.max(p0, 1e-9);
      return (result.a1 * Math.pow(ratio, result.lifeExponent) * 1e6) / (Math.max(n, 1) * 60);
    });

    return [
      {
        id: "life-load",
        label: "Life vs load",
        content: (
          <EngineeringPlot
            title="Rating life vs equivalent load (ISO 281)"
            x={loads.map((l) => fromBase(l, "force", loadUnit))}
            y={basicLives}
            yLabel="Basic rating life L10"
            xLabel="Equivalent load P"
            xUnit={loadUnit}
            unitLabel="h"
            series={[{ y: modifiedLives, label: "Modified life Lnm (a_ISO)" }]}
            showPeak={false}
          />
        ),
      },
      {
        id: "life-speed",
        label: "Life vs speed",
        content: (
          <EngineeringPlot
            title="Rating life vs speed at current load"
            x={speedRange}
            y={speedLives}
            yLabel="Basic rating life L10"
            xLabel="Speed"
            xUnit="RPM"
            unitLabel="h"
            showPeak={false}
          />
        ),
      },
    ];
  }, [loadUnit, result, speedRpm]);

  const status = result?.isSafe ? "safe" : "danger";

  return (
    <CalculatorResultsShell
      moduleId="bearings"
      fileName="bearing"
      calculationSpec={result?.calculationSpec}
      title="Export Bearing results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter loads, speed, life target, and catalog bearing, then calculate."
      heading="Bearing life results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "equivalentLoad", value: result.equivalentLoad },
              { metric: "staticEquivalentLoad", value: result.staticEquivalentLoad },
              { metric: "requiredDynamicRating", value: result.requiredDynamicRating },
              { metric: "expectedLife", value: result.expectedLife },
              { metric: "modifiedLife", value: result.modifiedLife },
              { metric: "dynamicUtilization", value: result.dynamicUtilization },
              { metric: "staticSafetyFactor", value: result.staticSafetyFactor },
              { metric: "speedMargin", value: result.speedMargin ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Status"
              value={result.isSafe ? "Pass" : "Check required"}
              status={status}
            />
            <CalculatorMetricCard label="Governing check" value={result.governingFailureMode} tone="orange" />
            <CalculatorMetricCard
              label="Equivalent load P"
              value={`${formatDisplayNumber(fromBase(result.equivalentLoad, "force", loadUnit))} ${loadUnit}`}
              tone="orange"
            />
            <CalculatorMetricCard
              label={`Basic L10 life (a1=${result.a1})`}
              value={`${formatDisplayNumber(result.expectedLife)} h`}
              tone="blue"
              size="lg"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Modified life Lnm"
              value={`${formatDisplayNumber(result.modifiedLife)} h`}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Dynamic utilization P/C"
              numericValue={result.dynamicUtilization}
              status={result.dynamicUtilization <= 1 ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label="Static safety s₀ = C₀/P₀"
              numericValue={result.staticSafetyFactor}
              status={result.staticSafetyFactor >= 1 ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label="Speed margin n_lim/n"
              value={result.speedMargin != null ? result.speedMargin.toFixed(2) : "N/A"}
              status={
                result.speedMargin == null || result.speedMargin >= 1 ? "safe" : "danger"
              }
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Required dynamic C"
              value={`${formatDisplayNumber(fromBase(result.requiredDynamicRating, "force", loadUnit))} ${loadUnit}`}
              tone="amber"
            />
            <CalculatorMetricCard
              label="Catalog C / C₀"
              value={`${formatDisplayNumber(fromBase(result.dynamicLoadRatingN, "force", loadUnit))} / ${formatDisplayNumber(fromBase(result.staticLoadRatingN, "force", loadUnit))} ${loadUnit}`}
            />
            <CalculatorMetricCard
              label="Life utilization"
              numericValue={result.lifeUtilization}
              status={result.lifeUtilization <= 1 ? "safe" : "danger"}
            />
          </CalculatorMetricGrid>

          {result.geometry && (
            <p className="text-sm text-slate-600">
              {result.designation}: bore {result.geometry.boreMm} mm × OD{" "}
              {result.geometry.outerDiameterMm} mm × B {result.geometry.widthMm} mm
              {result.limitingSpeedRpm != null && ` · n_lim = ${result.limitingSpeedRpm} RPM (grease)`}
            </p>
          )}

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="life-load" label="Result chart" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
