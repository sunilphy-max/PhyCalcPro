"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  CalculatorPlotSection,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { BucklingResult } from "@/lib/structural/columns/types";

type Props = {
  result: BucklingResult;
};

export default function BucklingDashboard({ result }: Props) {
  const status = useMemo<"safe" | "danger">(
    () => (result.isSafe ? "safe" : "danger"),
    [result.isSafe]
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Status"
          value={result.isSafe ? "Safe" : "At Risk"}
          status={status}
        />
        <CalculatorMetricCard
          label="Safety factor"
          numericValue={result.safetyFactor}
          tone="blue"
        />
        <CalculatorMetricCard
          label="Slenderness Ratio"
          numericValue={result.slenderness}
          tone="purple"
        />
        <CalculatorMetricCard
          label="Buckling Mode"
          value={
            result.bucklingMode.charAt(0).toUpperCase() +
            result.bucklingMode.slice(1)
          }
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={3}>
        <CalculatorMetricCard
          label="Critical Load (Pcr)"
          value={formatEngineeringValue(result.Pcr, "N")}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Critical Stress"
          value={formatEngineeringValue(result.criticalStress, "Pa")}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Applied Stress"
          value={formatEngineeringValue(result.stress, "Pa")}
          tone="orange"
          size="lg"
        />
      </CalculatorMetricGrid>

      <CalculatorPlotSection title="Buckling Mode Shape">
        <EngineeringPlot
          title="Mode Shape"
          x={result.x}
          y={result.deflection}
          yLabel="Deflection"
          xLabel="Position along column"
          xUnit="m"
          unitLabel="m"
          showPeak={false}
        />
      </CalculatorPlotSection>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard
          label="Effective Length"
          value={formatEngineeringValue(result.Le, "m")}
        />
        <CalculatorMetricCard
          label="Radius of Gyration"
          value={formatEngineeringValue(result.radius, "m")}
        />
        <CalculatorMetricCard
          label="Effective Length Factor (k)"
          numericValue={result.k}
        />
        <CalculatorMetricCard label="Buckling Formula" value="Euler" />
      </CalculatorMetricGrid>
    </div>
  );
}
