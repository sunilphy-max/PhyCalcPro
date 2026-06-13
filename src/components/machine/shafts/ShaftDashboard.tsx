"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { ShaftResult } from "@/lib/machine/shafts/types";

type Props = {
  result: ShaftResult;
};

export default function ShaftDashboard({ result }: Props) {
  const status = useMemo<"safe" | "danger">(
    () => (result.isSafe ? "safe" : "danger"),
    [result.isSafe]
  );

  const plotTabs = useMemo((): PlotPickerTab[] => {
    return [
      {
        id: "von-mises",
        label: "Combined stress (von Mises)",
        content: (
          <EngineeringPlot
            title="Combined Stress"
            x={result.x}
            y={result.vonMisesStress}
            yLabel="Von Mises stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
            series={[
              { y: result.bendingStress, label: "Bending stress" },
              { y: result.shearStress, label: "Torsional shear" },
            ]}
          />
        ),
      },
      {
        id: "shear",
        label: "Torsional shear",
        content: (
          <EngineeringPlot
            title="Torsional Shear Stress"
            x={result.x}
            y={result.shearStress}
            yLabel="Shear stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
          />
        ),
      },
      {
        id: "bending",
        label: "Bending stress",
        content: (
          <EngineeringPlot
            title="Bending Stress"
            x={result.x}
            y={result.bendingStress}
            yLabel="Bending stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
          />
        ),
      },
      {
        id: "deflection",
        label: "Deflection",
        content: (
          <EngineeringPlot
            title="Bending Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="m"
          />
        ),
      },
      {
        id: "rotation",
        label: "Torsional rotation",
        content: (
          <EngineeringPlot
            title="Rotation"
            x={result.x}
            y={result.rotation}
            yLabel="Rotation"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="rad"
          />
        ),
      },
    ];
  }, [result]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Status"
          value={result.isSafe ? "Safe" : "Unsafe"}
          status={status}
        />
        <CalculatorMetricCard label="Safety factor" numericValue={result.safetyFactor} tone="blue" />
        <CalculatorMetricCard
          label="Diameter"
          value={result.diameter ? formatEngineeringValue(result.diameter, "m") : "—"}
          tone="purple"
        />
        <CalculatorMetricCard
          label="Critical section"
          value={`@ ${formatEngineeringValue(result.criticalSection, "m")}`}
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={3}>
        <CalculatorMetricCard
          label="Max von Mises stress"
          value={formatEngineeringValue(result.maxStress, "Pa")}
          tone="red"
          size="lg"
        />
        <CalculatorMetricCard
          label="Max shear stress"
          value={formatEngineeringValue(result.maxShearStress, "Pa")}
          tone="orange"
          size="lg"
        />
        <CalculatorMetricCard
          label="Max bending stress"
          value={formatEngineeringValue(result.maxBendingStress, "Pa")}
          tone="amber"
          size="lg"
        />
      </CalculatorMetricGrid>

      <EngineeringPlotPicker tabs={plotTabs} defaultTabId="von-mises" label="Result chart" />

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Polar moment"
          value={result.polarMoment ? formatEngineeringValue(result.polarMoment, "m⁴") : "—"}
        />
        <CalculatorMetricCard
          label="Second moment"
          value={result.secondMoment ? formatEngineeringValue(result.secondMoment, "m⁴") : "—"}
        />
        <CalculatorMetricCard
          label="Max deflection"
          value={formatEngineeringValue(result.maxDeflection, "m")}
        />
        <CalculatorMetricCard
          label="Max rotation"
          value={formatEngineeringValue(
            ((Math.max(...result.rotation) || 0) * 180) / Math.PI,
            "°"
          )}
        />
      </CalculatorMetricGrid>
    </div>
  );
}
