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
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import type { BucklingResult } from "@/lib/structural/columns/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseColumn } from "@/lib/structural/columns/diagnosis";

type Props = {
  result: BucklingResult;
  workflowMode?: DesignWorkflowMode;
};

export default function BucklingDashboard({ result, workflowMode }: Props) {
  const status = useMemo<"safe" | "danger">(
    () => (result.isSafe ? "safe" : "danger"),
    [result.isSafe]
  );

  const diagnosis = useMemo(() => {
    if (workflowMode !== "diagnose") return null;
    return diagnoseColumn(result);
  }, [workflowMode, result]);

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
    <div className="grid grid-cols-1 gap-5">
      {diagnosis ? (
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
            Diagnose Mode
          </h3>
          <GenericDiagnosisPanel diagnosis={diagnosis} />
        </div>
      ) : null}

      <CalculatorMetricGrid section="Summary">
        <CalculatorMetricCard
          label="Status"
          value={result.isSafe ? "Safe" : "At Risk"}
          status={status}
        />
        <CalculatorMetricCard label="Safety factor" numericValue={result.safetyFactor} unit="—" tone="blue" />
        <CalculatorMetricCard label="Slenderness ratio" numericValue={result.slenderness} unit="—" tone="purple" />
        <CalculatorMetricCard
          label="Buckling mode"
          value={result.bucklingMode.charAt(0).toUpperCase() + result.bucklingMode.slice(1)}
          tone="orange"
        />
      </CalculatorMetricGrid>

      <CalculatorMetricGrid section="Critical values">
        <CalculatorMetricCard label="Critical load (Pcr)" numericValue={result.Pcr} unit="N" tone="blue" />
        <CalculatorMetricCard label="Critical stress" numericValue={result.criticalStress} unit="Pa" tone="blue" />
        <CalculatorMetricCard label="Applied stress" numericValue={result.stress} unit="Pa" tone="orange" />
      </CalculatorMetricGrid>

      <EngineeringPlotPicker tabs={plotTabs} defaultTabId="mode-shape" label="Result chart" />

      <CalculatorMetricGrid section="Geometry & method">
        <CalculatorMetricCard label="Effective length" numericValue={result.Le} unit="m" />
        <CalculatorMetricCard label="Radius of gyration" numericValue={result.radius} unit="m" />
        <CalculatorMetricCard label="Effective length factor (k)" numericValue={result.k} unit="—" />
        <CalculatorMetricCard label="Buckling formula" value="Euler" />
      </CalculatorMetricGrid>
    </div>
  );
}
