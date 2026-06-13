"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
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
        <CalculatorMetricCard label="Safety factor" numericValue={result.safetyFactor} tone="blue" />
        <CalculatorMetricCard label="Slenderness ratio" numericValue={result.slenderness} tone="purple" />
        <CalculatorMetricCard
          label="Buckling mode"
          value={result.bucklingMode.charAt(0).toUpperCase() + result.bucklingMode.slice(1)}
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid cols={3}>
        <CalculatorMetricCard
          label="Critical load (Pcr)"
          value={formatEngineeringValue(result.Pcr, "N")}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Critical stress"
          value={formatEngineeringValue(result.criticalStress, "Pa")}
          tone="blue"
          size="lg"
        />
        <CalculatorMetricCard
          label="Applied stress"
          value={formatEngineeringValue(result.stress, "Pa")}
          tone="orange"
          size="lg"
        />
      </CalculatorMetricGrid>

      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <EngineeringPlot
          title="Buckling mode shape"
          x={result.x}
          y={result.deflection}
          yLabel="Deflection"
          xLabel="Position along column"
          xUnit="m"
          unitLabel="m"
          showPeak={false}
        />
      </div>

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard label="Effective length" value={formatEngineeringValue(result.Le, "m")} />
        <CalculatorMetricCard label="Radius of gyration" value={formatEngineeringValue(result.radius, "m")} />
        <CalculatorMetricCard label="Effective length factor (k)" numericValue={result.k} />
        <CalculatorMetricCard label="Buckling formula" value="Euler" />
      </CalculatorMetricGrid>
    </div>
  );
}
