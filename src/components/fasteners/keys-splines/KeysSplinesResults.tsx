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
import type { KeysSplinesResult } from "@/lib/fasteners/keys-splines/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (KeysSplinesResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
  torqueUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function KeysSplinesResults({ result, stressUnit, torqueUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const loadMultipliers = Array.from({ length: 11 }, (_, i) => 0.5 + i * 0.1);
    const shearSf = loadMultipliers.map((m) => result.shearSafety / Math.max(m, 1e-9));
    const bearingSf = loadMultipliers.map((m) => result.bearingSafety / Math.max(m, 1e-9));
    const shearStress = loadMultipliers.map((m) =>
      fromBase(result.shearStress * m, "stress", stressUnit)
    );

    return [
      {
        id: "safety",
        label: "Safety factors",
        content: (
          <EngineeringPlot
            title="Key safety factors vs torque multiplier"
            x={loadMultipliers}
            y={shearSf}
            yLabel="Shear safety factor"
            xLabel="Torque multiplier"
            xUnit="—"
            unitLabel="—"
            probeX={1}
            showPeak={false}
            series={[
              {
                y: bearingSf,
                label: "Bearing safety factor",
                unitLabel: "—",
                color: "#f59e0b",
              },
            ]}
          />
        ),
      },
      {
        id: "shear-stress",
        label: "Shear stress",
        content: (
          <EngineeringPlot
            title="Key shear stress vs torque multiplier"
            x={loadMultipliers}
            y={shearStress}
            yLabel="Shear stress"
            xLabel="Torque multiplier"
            xUnit="—"
            unitLabel={stressUnit}
            probeX={1}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result, stressUnit]);

  return (
    <CalculatorResultsShell
      moduleId="keys-splines"
      fileName="keys-splines"
      title="Export key & spline results"
      description="Export shear, bearing and capacity summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter key geometry and torque, then calculate."
      heading="Keys & splines results"
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "bearingStress", value: result.bearingStress },
              { metric: "shearSafety", value: result.shearSafety },
              { metric: "bearingSafety", value: result.bearingSafety },
              { metric: "capacityTorque", value: result.capacityTorque },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Shear stress"
              numericValue={fromBase(result.shearStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bearing stress"
              numericValue={fromBase(result.bearingStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Shear safety factor"
              numericValue={result.shearSafety}
              unit="—"
              tone={safetyTone(result.shearSafety)}
            />
            <CalculatorMetricCard
              label="Bearing safety factor"
              numericValue={result.bearingSafety}
              unit="—"
              tone={safetyTone(result.bearingSafety)}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Capacity torque"
            numericValue={fromBase(result.capacityTorque, "torque", torqueUnit)}
            unit={torqueUnit}
            tone="purple"
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="safety" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
