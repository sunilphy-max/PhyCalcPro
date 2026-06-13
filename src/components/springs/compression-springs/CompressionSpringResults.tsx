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
import type { CompressionSpringResult } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import SpringOutlinePreview from "@/components/shared/geometry/SpringOutlinePreview";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
  projectName?: string;
  geometry?: {
    wireDiameter: number;
    meanDiameter: number;
    activeCoils: number;
    freeLength: number;
  };
};

export default function CompressionSpringResults({
  result,
  lengthUnit,
  stressUnit,
  projectName,
  geometry,
}: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const tabs: PlotPickerTab[] = [];

    if (geometry) {
      tabs.push({
        id: "outline",
        label: "Spring outline",
        content: (
          <SpringOutlinePreview
            wireDiameter={geometry.wireDiameter}
            meanDiameter={geometry.meanDiameter}
            activeCoils={geometry.activeCoils}
            freeLength={geometry.freeLength}
            unit={lengthUnit}
          />
        ),
      });
    }

    const maxDeflection = result.maxLoad / Math.max(result.springRate, 1e-12);
    const steps = 25;
    const deflections = Array.from({ length: steps }, (_, i) => (maxDeflection * i) / (steps - 1));
    const loads = deflections.map((d) => result.springRate * d);

    tabs.push({
      id: "load-deflection",
      label: "Load–deflection",
      content: (
        <EngineeringPlot
          title="Spring load vs deflection"
          x={deflections}
          y={loads}
          yLabel="Force"
          xLabel="Deflection"
          xUnit={lengthUnit}
          unitLabel="N"
        />
      ),
    });

    return tabs;
  }, [geometry, lengthUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="compression-springs"
      fileName="compression-spring"
      title="Export compression spring results"
      description="Export spring rate, stress and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Compression spring results"
      reportMeta={projectName ? { project: projectName } : undefined}
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "maxLoad", value: result.maxLoad },
              { metric: "shearStress", value: result.shearStress },
              { metric: "allowableShearStress", value: result.allowableShearStress },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "springIndex", value: result.springIndex },
              { metric: "wahlFactor", value: result.wahlFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Spring rate"
              value={formatEngineeringValue(result.springRate, "N/m")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Solid height"
              value={formatEngineeringValue(fromBase(result.solidHeight, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Load at deflection"
              value={formatEngineeringValue(result.maxLoad, "N")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Surge frequency"
              value={`${formatDisplayNumber(result.naturalFrequency)} Hz`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Spring index C"
              numericValue={result.springIndex}
              tone={result.springIndex >= 4 && result.springIndex <= 12 ? "blue" : "orange"}
            />
            <CalculatorMetricCard label="Wahl factor Kw" numericValue={result.wahlFactor} tone="blue" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Static safety factor (τ_zul / τ)"
            numericValue={result.safetyFactor}
            status={
              result.safetyFactor >= 1.5 ? "safe" : result.safetyFactor >= 1 ? "warning" : "danger"
            }
            size="lg"
          />
          <CalculatorMetricCard
            label={`Buckling screen (L0/D = ${formatDisplayNumber(result.slenderness)})`}
            value={result.bucklingRisk ? "Check buckling — guide the spring" : "Buckle-proof (EN 13906-1)"}
            tone={result.bucklingRisk ? "orange" : "green"}
          />
          <EngineeringPlotPicker
            tabs={plotTabs}
            defaultTabId={geometry ? "outline" : "load-deflection"}
            label="Result view"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
