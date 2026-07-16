"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { FlywheelResult } from "@/lib/machine/flywheels/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<FlywheelResult> | null;
  lengthUnit: string;
  /** Kept for page API parity with unit selects; density is already baked into result mass/inertia. */
  densityUnit?: string;
  stressUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function FlywheelResults({ result, lengthUnit, stressUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];

    const rpm0 = (result.angularSpeed * 60) / (2 * Math.PI);
    const multipliers = Array.from({ length: 13 }, (_, i) => 0.4 + i * 0.1);
    const rpms = multipliers.map((m) => rpm0 * m);
    const omegas = rpms.map((n) => (n * 2 * Math.PI) / 60);
    const energies = omegas.map((w) => 0.5 * result.inertia * w * w);
    const hoopStressBase = result.hoopStress / Math.max(result.angularSpeed ** 2, 1e-12);
    const hoop = omegas.map((w) => fromBase(hoopStressBase * w * w, "stress", stressUnit));
    const sf = omegas.map((w) => {
      const stress = hoopStressBase * w * w;
      return (result.hoopStress * result.safetyFactor) / Math.max(stress, 1e-12);
    });

    return [
      {
        id: "energy",
        label: "Energy vs speed",
        content: (
          <EngineeringPlot
            title="Stored kinetic energy vs speed"
            x={rpms}
            y={energies}
            yLabel="Stored energy"
            xLabel="Speed"
            xUnit="RPM"
            unitLabel="J"
            probeX={rpm0}
            showPeak={false}
          />
        ),
      },
      {
        id: "hoop",
        label: "Hoop stress",
        content: (
          <EngineeringPlot
            title="Rim hoop stress vs speed"
            x={rpms}
            y={hoop}
            yLabel="Hoop stress"
            xLabel="Speed"
            xUnit="RPM"
            unitLabel={stressUnit}
            probeX={rpm0}
            showPeak={false}
          />
        ),
      },
      {
        id: "safety",
        label: "Safety factor",
        content: (
          <EngineeringPlot
            title="Hoop stress safety factor vs speed"
            x={rpms}
            y={sf}
            yLabel="Safety factor"
            xLabel="Speed"
            xUnit="RPM"
            unitLabel="—"
            probeX={rpm0}
            showPeak={false}
          />
        ),
      },
    ];
  }, [result, stressUnit]);

  return (
    <CalculatorResultsShell
      moduleId="flywheels"
      fileName="flywheel"
      calculationSpec={result?.calculationSpec}
      title="Export Flywheel results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the calculation to review stored energy, inertia, and rim stress."
      heading="Flywheel results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "storedEnergy", value: result.storedEnergy },
              { metric: "inertia", value: result.inertia },
              { metric: "hoopStress", value: result.hoopStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <div className="space-y-4">
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Outer diameter"
              numericValue={fromBase(result.outerDiameter, "length", lengthUnit)}
              unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Thickness"
              numericValue={fromBase(result.thickness, "length", lengthUnit)}
              unit={lengthUnit}
              tone="purple"
            />
            <CalculatorMetricCard label="Mass" numericValue={result.mass} unit="kg" tone="blue" />
            <CalculatorMetricCard
              label="Inertia"
              numericValue={result.inertia}
              unit="kg·m²"
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Stored energy"
              numericValue={result.storedEnergy}
              unit="J"
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard
              label="Angular speed"
              numericValue={result.angularSpeed}
              unit="rad/s"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Hoop stress"
              numericValue={fromBase(result.hoopStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="red"
            />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              unit="—"
              tone={safetyTone(result.safetyFactor)}
              size="lg"
            />
          </CalculatorMetricGrid>
          <EngineeringPlotPicker
            tabs={plotTabs}
            defaultTabId="energy"
            label="Sensitivity charts"
            variant="segmented"
          />
        </div>
      ) : null}
    </CalculatorResultsShell>
  );
}
