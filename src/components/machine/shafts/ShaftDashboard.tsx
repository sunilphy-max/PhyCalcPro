"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  CalculatorPlotSection,
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

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Status"
          value={result.isSafe ? "Safe" : "Unsafe"}
          status={status}
        />
        <CalculatorMetricCard
          label="Safety factor"
          numericValue={result.safetyFactor}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Diameter"
          value={result.diameter ? formatEngineeringValue(result.diameter, "m") : "—"}
          tone="purple"
        />
        <CalculatorMetricCard
          label="Critical Section"
          value={`@ ${formatEngineeringValue(result.criticalSection, "m")}`}
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={3}>
        <CalculatorMetricCard
          label="Max Von Mises Stress"
          value={formatEngineeringValue(result.maxStress, "Pa")}
          tone="red"
          size="lg"
        />
        <CalculatorMetricCard
          label="Max Shear Stress"
          value={formatEngineeringValue(result.maxShearStress, "Pa")}
          tone="orange"
          size="lg"
        />
        <CalculatorMetricCard
          label="Max Bending Stress"
          value={formatEngineeringValue(result.maxBendingStress, "Pa")}
          tone="amber"
          size="lg"
        />
      </CalculatorMetricGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CalculatorPlotSection title="Shear Stress Distribution">
          <EngineeringPlot
            title="Torsional Shear Stress"
            x={result.x}
            y={result.shearStress}
            yLabel="Shear stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
          />
        </CalculatorPlotSection>
        <CalculatorPlotSection title="Bending Stress Distribution">
          <EngineeringPlot
            title="Bending Stress"
            x={result.x}
            y={result.bendingStress}
            yLabel="Bending stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
          />
        </CalculatorPlotSection>
        <CalculatorPlotSection title="Combined Stress (Von Mises)">
          <EngineeringPlot
            title="Combined Stress"
            x={result.x}
            y={result.vonMisesStress}
            yLabel="Von Mises stress"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="Pa"
          />
        </CalculatorPlotSection>
        <CalculatorPlotSection title="Deflection">
          <EngineeringPlot
            title="Bending Deflection"
            x={result.x}
            y={result.deflection}
            yLabel="Deflection"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="m"
          />
        </CalculatorPlotSection>
        <CalculatorPlotSection title="Torsional Rotation">
          <EngineeringPlot
            title="Rotation"
            x={result.x}
            y={result.rotation}
            yLabel="Rotation"
            xLabel="Position along shaft"
            xUnit="m"
            unitLabel="rad"
          />
        </CalculatorPlotSection>
      </div>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Polar Moment"
          value={result.polarMoment ? formatEngineeringValue(result.polarMoment, "m⁴") : "—"}
        />
        <CalculatorMetricCard
          label="Second Moment"
          value={result.secondMoment ? formatEngineeringValue(result.secondMoment, "m⁴") : "—"}
        />
        <CalculatorMetricCard
          label="Max Deflection"
          value={formatEngineeringValue(result.maxDeflection, "m")}
        />
        <CalculatorMetricCard
          label="Max Rotation"
          value={formatEngineeringValue(
            ((Math.max(...result.rotation) || 0) * 180) / Math.PI,
            "°"
          )}
        />
      </CalculatorMetricGrid>
    </div>
  );
}
