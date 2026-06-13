"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import ColumnEndSchematic from "./ColumnEndSchematic";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
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

  const plotTabs = useMemo((): PlotPickerTab[] => {
    return [
      {
        id: "schematic",
        label: "End conditions",
        content: <ColumnEndSchematic k={result.k} />,
      },
      {
        id: "mode-shape",
        label: "Mode shape",
        content: (
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
        ),
      },
      {
        id: "intensity",
        label: "Deflection intensity",
        content: (
          <FEAColorStrip
            title="Buckling mode intensity"
            x={result.x}
            values={result.deflection}
            unit="m"
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

      <EngineeringPlotPicker tabs={plotTabs} defaultTabId="mode-shape" label="Result chart" />

      <CalculatorMetricGrid cols={4}>
        <CalculatorMetricCard label="Effective length" value={formatEngineeringValue(result.Le, "m")} />
        <CalculatorMetricCard label="Radius of gyration" value={formatEngineeringValue(result.radius, "m")} />
        <CalculatorMetricCard label="Effective length factor (k)" numericValue={result.k} />
        <CalculatorMetricCard label="Buckling formula" value="Euler" />
      </CalculatorMetricGrid>
    </div>
  );
}
