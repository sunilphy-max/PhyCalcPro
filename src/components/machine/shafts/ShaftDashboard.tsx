"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import ShaftLayoutPreview from "@/components/shared/geometry/ShaftLayoutPreview";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { BearingSupport, LoadCase, ShaftResult } from "@/lib/machine/shafts/types";

type LayoutPreview = {
  length: number;
  diameter: number;
  loads: LoadCase[];
  supports?: BearingSupport[];
  lengthUnit?: string;
};

type Props = {
  result: ShaftResult;
  layout?: LayoutPreview;
  lengthUnit?: string;
};

export default function ShaftDashboard({ result, layout, lengthUnit = "m" }: Props) {
  const status = useMemo<"safe" | "danger">(
    () => (result.isSafe ? "safe" : "danger"),
    [result.isSafe]
  );

  const plotTabs = useMemo((): PlotPickerTab[] => {
    const tabs: PlotPickerTab[] = [];
    const xUnit = lengthUnit;

    if (layout) {
      tabs.push({
        id: "layout",
        label: "Shaft layout",
        content: (
          <ShaftLayoutPreview
            length={layout.length}
            diameter={layout.diameter}
            loads={layout.loads}
            lengthUnit={layout.lengthUnit}
          />
        ),
      });
    }

    tabs.push(
      {
        id: "von-mises",
        label: "Combined stress",
        content: (
          <EngineeringPlot
            title="Combined Stress"
            x={result.x}
            y={result.vonMisesStress}
            yLabel="Von Mises stress"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="Pa"
            series={[
              { y: result.bendingStress, label: "Bending stress" },
              { y: result.shearStress, label: "Torsional shear" },
            ]}
          />
        ),
      },
      {
        id: "moment",
        label: "Bending moment",
        content: (
          <EngineeringPlot
            title="Bending Moment"
            x={result.x}
            y={result.bendingMomentDistribution}
            yLabel="Bending moment"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N·m"
          />
        ),
      },
      {
        id: "torque",
        label: "Torque",
        content: (
          <EngineeringPlot
            title="Torque Distribution"
            x={result.x}
            y={result.torqueDistribution}
            yLabel="Torque"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N·m"
          />
        ),
      },
      {
        id: "shear-force",
        label: "Shear force",
        content: (
          <EngineeringPlot
            title="Shear Force"
            x={result.x}
            y={result.shearForce}
            yLabel="Shear force"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="N"
          />
        ),
      },
      {
        id: "deflection",
        label: "Deflection",
        content: (
          <EngineeringPlot
            title="Lateral Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel={xUnit}
          />
        ),
      },
      {
        id: "slope",
        label: "Slope",
        content: (
          <EngineeringPlot
            title="Shaft Slope"
            x={result.x}
            y={result.slope}
            yLabel="Slope"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="rad"
          />
        ),
      },
      {
        id: "rotation",
        label: "Torsional rotation",
        content: (
          <EngineeringPlot
            title="Torsional Rotation"
            x={result.x}
            y={result.rotation}
            yLabel="Rotation"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="rad"
          />
        ),
      },
      {
        id: "kt",
        label: "Stress concentration",
        content: (
          <EngineeringPlot
            title="Kt Profile"
            x={result.x}
            y={result.stressConcentrationFactor}
            yLabel="Kt"
            xLabel="Position along shaft"
            xUnit={xUnit}
            unitLabel="—"
          />
        ),
      }
    );

    return tabs;
  }, [layout, result, lengthUnit]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Status"
          value={result.isSafe ? "Safe" : "Check required"}
          status={status}
        />
        <CalculatorMetricCard label="Static safety factor" numericValue={result.safetyFactor} tone="blue" />
        <CalculatorMetricCard
          label="Governing check"
          value={result.governingFailureMode}
          tone="orange"
        />
        <CalculatorMetricCard
          label="Critical section"
          value={`@ ${formatEngineeringValue(result.criticalSection, lengthUnit)}`}
          tone="purple"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Max von Mises stress"
          value={formatEngineeringValue(result.maxStress, "Pa")}
          tone="red"
        />
        <CalculatorMetricCard
          label="Fatigue safety factor"
          value={
            result.fatigueSafetyFactor != null
              ? result.fatigueSafetyFactor.toFixed(2)
              : "N/A (set RPM)"
          }
          tone={result.fatigueStatus === "safe" ? "blue" : "amber"}
        />
        <CalculatorMetricCard
          label="1st critical speed"
          value={`${result.criticalSpeed.toFixed(0)} RPM`}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Critical speed margin"
          value={
            result.criticalSpeedMargin != null
              ? `${result.criticalSpeedMargin.toFixed(2)}×`
              : "N/A (set RPM)"
          }
          tone={
            result.criticalSpeedMargin != null && result.criticalSpeedMargin >= 1.25
              ? "blue"
              : "amber"
          }
        />
      </CalculatorMetricGrid>

      <EngineeringPlotPicker
        tabs={plotTabs}
        defaultTabId={layout ? "layout" : "von-mises"}
        label="Result chart"
      />

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Max deflection"
          value={formatEngineeringValue(result.maxDeflection, lengthUnit)}
        />
        <CalculatorMetricCard
          label="Deflection utilization"
          value={`${(result.deflectionUtilization * 100).toFixed(0)}%`}
        />
        <CalculatorMetricCard
          label="Max bearing slope"
          value={`${((result.maxSlope || 0) * 1000).toFixed(2)} mrad`}
        />
        <CalculatorMetricCard
          label="Slope utilization"
          value={`${(result.slopeUtilization * 100).toFixed(0)}%`}
        />
      </CalculatorMetricGrid>

      {result.bearingReactions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Bearing reactions</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {result.bearingReactions.map((r, i) => (
              <li key={i}>
                @ {formatEngineeringValue(r.position, lengthUnit)}: Fy ={" "}
                {formatEngineeringValue(r.forceY, "N")}, Fz = {formatEngineeringValue(r.forceZ, "N")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.criticalSpeedModes.length > 1 && (
        <p className="text-xs text-slate-500">
          Higher modes: {result.criticalSpeedModes.slice(1).map((s) => `${s.toFixed(0)} RPM`).join(", ")}
        </p>
      )}
    </div>
  );
}
