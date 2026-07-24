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
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseHelicalSpring } from "@/lib/springs/diagnosis";

type Props = {
  result: (CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
  projectName?: string;
  workflowMode?: DesignWorkflowMode;
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
  workflowMode,
  geometry,
}: Props) {
  const diagnosis = useMemo(() => {
    if (!result || workflowMode !== "diagnose") return null;
    return diagnoseHelicalSpring(result);
  }, [workflowMode, result]);

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

    tabs.push(
      {
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
      },
      {
        id: "stress-deflection",
        label: "Stress vs deflection",
        content: (
          <EngineeringPlot
            title="Shear stress vs deflection"
            x={deflections}
            y={deflections.map((d) => {
              const F = result.springRate * d;
              return (result.shearStress / Math.max(result.maxLoad, 1e-9)) * F;
            })}
            yLabel="Shear stress"
            xLabel="Deflection"
            xUnit={lengthUnit}
            unitLabel="Pa"
            showPeak={false}
          />
        ),
      }
    );

    return tabs;
  }, [geometry, lengthUnit, result]);

  const status = result?.isSafe ? "safe" : "danger";

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
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "naturalFrequency", value: result.naturalFrequency },
              { metric: "solidHeightClearance", value: result.solidHeightClearance },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          {diagnosis ? (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
                Diagnose Mode
              </h3>
              <GenericDiagnosisPanel diagnosis={diagnosis} />
            </div>
          ) : null}

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard label="Status" value={result.isSafe ? "Pass" : "Check"} status={status} />
            <CalculatorMetricCard label="Governing check" value={result.governingFailureMode} tone="orange" />
            <CalculatorMetricCard label="Spring rate" numericValue={result.springRate} unit="N/m" tone="blue" />
            <CalculatorMetricCard
              label="Static safety τ_zul/τ"
              numericValue={result.safetyFactor} unit="—"
              status={result.safetyFactor >= 1.5 ? "safe" : "danger"}
            />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Solid height clearance"
              numericValue={fromBase(result.solidHeightClearance, "length", lengthUnit)} unit={lengthUnit}
              tone={result.solidHeightClearance >= 0 ? "blue" : "red"}
            />
            <CalculatorMetricCard
              label="Surge frequency"
              numericValue={result.naturalFrequency} unit="Hz"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Surge margin"
              value={
                result.surgeMargin != null
                  ? `${formatDisplayNumber(result.surgeMargin)}×`
                  : "Set operating Hz"
              }
              tone={result.surgeMargin == null || result.surgeMargin >= 10 ? "blue" : "orange"}
            />
            <CalculatorMetricCard label="Spring index C" numericValue={result.springIndex} unit="—" tone="blue" />
          </CalculatorMetricGrid>

          {result.fatigueSafetyFactor != null ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label={`Fatigue SF (${result.lifeClass ?? "VL"})`}
                numericValue={result.fatigueSafetyFactor} unit="—"
                status={result.fatiguePass ? "safe" : "danger"}
              />
              <CalculatorMetricCard
                label="Fatigue utilization"
                numericValue={result.fatigueUtilization ?? undefined} unit="—"
                tone={result.fatiguePass ? "green" : "orange"}
              />
            </CalculatorMetricGrid>
          ) : null}

          <CalculatorMetricCard
            label={`Buckling (L0/D = ${formatDisplayNumber(result.slenderness)} ≤ ${formatDisplayNumber(result.bucklingLimit)})`}
            value={result.bucklingRisk ? "Check buckling — add guidance" : "Buckle-proof"}
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
