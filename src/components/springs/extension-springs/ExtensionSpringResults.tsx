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
import type { ExtensionSpringResult } from "@/lib/springs/extension-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (ExtensionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
  projectName?: string;
};

export default function ExtensionSpringResults({ result, lengthUnit, stressUnit, projectName }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];

    const maxDeflection = result.maxLoad / Math.max(result.springRate, 1e-12);
    const steps = 25;
    const deflections = Array.from({ length: steps }, (_, i) => (maxDeflection * i) / (steps - 1));
    const loads = deflections.map((d) => result.initialTension + result.springRate * d);

    return [
      {
        id: "load-extension",
        label: "Load–extension",
        content: (
          <EngineeringPlot
            title="Force vs extension (F = Fi + k·x)"
            x={deflections}
            y={loads}
            yLabel="Force"
            xLabel="Extension"
            xUnit={lengthUnit}
            unitLabel="N"
          />
        ),
      },
      {
        id: "stress-extension",
        label: "Body stress vs extension",
        content: (
          <EngineeringPlot
            title="Body shear stress vs extension"
            x={deflections}
            y={deflections.map((d) => {
              const F = result.initialTension + result.springRate * d;
              return (result.bodyShearStress / Math.max(result.forceAtExtension, 1e-9)) * F;
            })}
            yLabel="Shear stress"
            xLabel="Extension"
            xUnit={lengthUnit}
            unitLabel="Pa"
            showPeak={false}
          />
        ),
      },
    ];
  }, [lengthUnit, result]);

  const status = result?.isSafe ? "safe" : "danger";

  return (
    <CalculatorResultsShell
      moduleId="extension-springs"
      fileName="extension-spring"
      title="Export extension spring results"
      description="Export spring rate, initial tension, hook stress and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Extension spring results"
      reportMeta={projectName ? { project: projectName } : undefined}
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "initialTension", value: result.initialTension },
              { metric: "forceAtExtension", value: result.forceAtExtension },
              { metric: "bodySafetyFactor", value: result.bodySafetyFactor },
              { metric: "hookSafetyFactor", value: result.hookSafetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard label="Status" value={result.isSafe ? "Pass" : "Check"} status={status} />
            <CalculatorMetricCard label="Governing check" value={result.governingFailureMode} tone="orange" />
            <CalculatorMetricCard label="Spring rate" value={formatEngineeringValue(result.springRate, "N/m")} tone="blue" />
            <CalculatorMetricCard
              label="Initial tension Fi"
              value={formatEngineeringValue(result.initialTension, "N")}
              tone={result.initialTensionValid ? "purple" : "red"}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Force at extension"
              value={formatEngineeringValue(result.forceAtExtension, "N")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Body SF τ_zul/τ"
              numericValue={result.bodySafetyFactor}
              status={result.bodySafetyFactor >= 1.5 ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label={`Hook SF (${result.hookType})`}
              numericValue={result.hookSafetyFactor}
              status={result.hookSafetyFactor >= 1.5 ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label="Max manufacturable Fi"
              value={formatEngineeringValue(result.maxInitialTension, "N")}
              tone="blue"
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Extended length"
              value={formatEngineeringValue(fromBase(result.extendedLength, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Coil bind length"
              value={formatEngineeringValue(fromBase(result.coilBindLength, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Surge frequency"
              value={`${formatDisplayNumber(result.naturalFrequency)} Hz`}
              tone="blue"
            />
          </CalculatorMetricGrid>

          {result.fatigueSafetyFactor != null ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label={`Body fatigue SF (${result.lifeClass ?? "VL"})`}
                numericValue={result.fatigueSafetyFactor}
                status={result.fatiguePass ? "safe" : "danger"}
              />
              <CalculatorMetricCard
                label="Fatigue utilization"
                numericValue={result.fatigueUtilization ?? undefined}
                tone={result.fatiguePass ? "green" : "orange"}
              />
            </CalculatorMetricGrid>
          ) : null}

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="load-extension" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
