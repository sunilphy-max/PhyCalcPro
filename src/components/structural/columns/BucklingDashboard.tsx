"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  CalculatorPlotSection,
} from "@/components/calculator/results";
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
          value={result.slenderness.toFixed(1)}
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
          value={`${(result.Pcr / 1000).toFixed(1)} kN`}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Critical Stress"
          value={`${(result.criticalStress / 1e6).toFixed(2)} MPa`}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Applied Stress"
          value={`${(result.stress / 1e6).toFixed(2)} MPa`}
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
          value={`${result.Le.toFixed(3)} m`}
        />
        <CalculatorMetricCard
          label="Radius of Gyration"
          value={`${result.radius.toExponential(3)} m`}
        />
        <CalculatorMetricCard
          label="Effective Length Factor (k)"
          value={result.k.toFixed(2)}
        />
        <CalculatorMetricCard label="Buckling Formula" value="Euler" />
      </CalculatorMetricGrid>
    </div>
  );
}
