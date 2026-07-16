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
import type { PinResult } from "@/lib/fasteners/pins/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (PinResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function PinResults({ result, stressUnit }: Props) {
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
            title="Pin safety factors vs load multiplier"
            x={loadMultipliers}
            y={shearSf}
            yLabel="Shear safety factor"
            xLabel="Load multiplier"
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
            title="Pin shear stress vs load multiplier"
            x={loadMultipliers}
            y={shearStress}
            yLabel="Shear stress"
            xLabel="Load multiplier"
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
      moduleId="pins"
      fileName="pin-clevis"
      title="Export pin results"
      description="Export shear, bearing and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pin geometry and load, then calculate."
      heading="Pin & clevis results"
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "bearingStress", value: result.bearingStress },
              { metric: "shearSafety", value: result.shearSafety },
              { metric: "bearingSafety", value: result.bearingSafety },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid section="Stress & safety">
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
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="safety" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
