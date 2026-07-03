"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { TorsionSpringResult } from "@/lib/springs/torsion-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { fromBase } from "@/lib/units/conversions";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (TorsionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
  projectName?: string;
};

export default function TorsionSpringResults({ result, stressUnit, projectName }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];

    const maxAngleRad = result.torque / Math.max(result.springRate, 1e-12);
    const steps = 25;
    const anglesRad = Array.from({ length: steps }, (_, i) => (maxAngleRad * i) / (steps - 1));
    const torques = anglesRad.map((a) => result.springRate * a);

    return [
      {
        id: "torque-angle",
        label: "Torque–angle",
        content: (
          <EngineeringPlot
            title="Torque vs deflection angle"
            x={anglesRad.map((a) => (a * 180) / Math.PI)}
            y={torques}
            yLabel="Torque"
            xLabel="Angle"
            xUnit="deg"
            unitLabel="N·m"
          />
        ),
      },
      {
        id: "stress-angle",
        label: "Coil stress vs angle",
        content: (
          <EngineeringPlot
            title="Coil bending stress vs angle"
            x={anglesRad.map((a) => (a * 180) / Math.PI)}
            y={anglesRad.map((a) => (result.bendingStress / Math.max(result.torque, 1e-9)) * result.springRate * a)}
            yLabel="Bending stress"
            xLabel="Angle"
            xUnit="deg"
            unitLabel="Pa"
            showPeak={false}
          />
        ),
      },
    ];
  }, [result]);

  const status = result?.isSafe ? "safe" : "danger";

  return (
    <CalculatorResultsShell
      moduleId="torsion-springs"
      fileName="torsion-spring"
      title="Export torsion spring results"
      description="Export spring rate, torque, coil and leg bending stress."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Torsion spring results"
      reportMeta={projectName ? { project: projectName } : undefined}
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "torque", value: result.torque },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "legBendingStress", value: result.legBendingStress },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard label="Status" value={result.isSafe ? "Pass" : "Check"} status={status} />
            <CalculatorMetricCard label="Governing check" value={result.governingFailureMode} tone="orange" />
            <CalculatorMetricCard
              label="Spring rate"
              value={formatEngineeringValue(result.springRate, "N·m/rad")}
              tone="blue"
            />
            <CalculatorMetricCard label="Torque at angle" value={formatEngineeringValue(result.torque, "N·m")} tone="purple" />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="Coil bending stress"
              value={formatEngineeringValue(fromBase(result.bendingStress, "stress", stressUnit), stressUnit)}
              tone={result.safetyFactor < 1.5 ? "red" : "orange"}
            />
            <CalculatorMetricCard
              label="Static SF σ_zul/σ"
              numericValue={result.safetyFactor}
              status={result.safetyFactor >= 1.5 ? "safe" : "danger"}
            />
            <CalculatorMetricCard label="Curvature factor Kb" numericValue={result.curvatureFactor} tone="blue" />
            <CalculatorMetricCard label="Spring index C" numericValue={result.springIndex} tone="blue" />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Leg force" value={formatEngineeringValue(result.legForce, "N")} tone="blue" />
            <CalculatorMetricCard
              label="Leg bending stress (est.)"
              value={formatEngineeringValue(fromBase(result.legBendingStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
          </CalculatorMetricGrid>

          {result.fatigueSafetyFactor != null ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label={`Coil fatigue SF (${result.lifeClass ?? "VL"})`}
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

          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="torque-angle" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
