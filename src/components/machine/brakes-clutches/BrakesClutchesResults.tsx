"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { BrakesClutchesResult } from "@/lib/machine/brakes-clutches/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: (BrakesClutchesResult & { calculationSpec?: CalculationSpec }) | null;
  safetyFactorTarget: number;
};

export default function BrakesClutchesResults({ result, safetyFactorTarget }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];

    const force0 = 1;
    // Torque scales linearly with actuation force; normalize around current operating point.
    const multipliers = Array.from({ length: 13 }, (_, i) => 0.4 + i * 0.1);
    const forceScale = multipliers.map((m) => m);
    const torque = forceScale.map((m) => result.frictionTorque * m);
    const power = forceScale.map((m) => result.powerDissipated * m);
    const sf = forceScale.map((m) => result.safetyFactor * m);

    return [
      {
        id: "torque",
        label: "Torque vs load",
        content: (
          <EngineeringPlot
            title="Friction torque vs relative actuation force"
            x={forceScale}
            y={torque}
            yLabel="Friction torque"
            xLabel="Actuation force ratio"
            xUnit="—"
            unitLabel="N·m"
            probeX={force0}
            showPeak={false}
          />
        ),
      },
      {
        id: "power",
        label: "Power",
        content: (
          <EngineeringPlot
            title="Dissipated power vs relative actuation force"
            x={forceScale}
            y={power}
            yLabel="Power dissipated"
            xLabel="Actuation force ratio"
            xUnit="—"
            unitLabel="W"
            probeX={force0}
            showPeak={false}
          />
        ),
      },
      {
        id: "safety",
        label: "Safety factor",
        content: (
          <EngineeringPlot
            title="Torque safety factor vs relative actuation force"
            x={forceScale}
            y={sf}
            yLabel="Safety factor"
            xLabel="Actuation force ratio"
            xUnit="—"
            unitLabel="—"
            probeX={force0}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result]);

  return (
    <CalculatorResultsShell
      moduleId="brakes-clutches"
      fileName="brakes-clutches"
      title="Export brake / clutch results"
      description="Export torque, power and energy dissipation summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter friction interface data and calculate."
      heading="Brake / clutch results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "frictionTorque", value: result.frictionTorque },
              { metric: "powerDissipated", value: result.powerDissipated },
              { metric: "energyPerStop", value: result.energyPerStop },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <div className="space-y-4">
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Friction torque"
              numericValue={result.frictionTorque}
              unit="N·m"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Power dissipated"
              numericValue={result.powerDissipated}
              unit="W"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Energy per stop"
              numericValue={result.energyPerStop}
              unit="J"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Target SF"
              numericValue={safetyFactorTarget}
              unit="—"
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor}
            unit="—"
            tone={
              result.safetyFactor >= safetyFactorTarget
                ? "green"
                : result.safetyFactor >= 1
                  ? "orange"
                  : "red"
            }
            size="lg"
          />
          <EngineeringPlotPicker
            tabs={plotTabs}
            defaultTabId="torque"
            label="Sensitivity charts"
            variant="segmented"
          />
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
