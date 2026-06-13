"use client";

import { useMemo } from "react";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { Vdi2230Result } from "@/lib/fasteners/bolts/vdi2230";
import type { CalculationSpec } from "@/lib/standards/types";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import VdiJointDiagram from "./VdiJointDiagram";

type Props = {
  result: (Vdi2230Result & { calculationSpec?: CalculationSpec }) | null;
  clampLengthM: number;
};

export default function Vdi2230Results({ result, clampLengthM }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    return [
      {
        id: "joint",
        label: "Joint schematic",
        content: (
          <VdiJointDiagram
            clampLengthM={clampLengthM}
            boltDiameterMm={result.size.d * 1000}
            preloadKn={result.assemblyPreloadMax / 1000}
          />
        ),
      },
    ];
  }, [clampLengthM, result]);

  return (
    <CalculatorResultsShell
      moduleId="bolts"
      fileName="vdi2230-bolt-joint"
      title="Export VDI 2230 results"
      description="Export preload, torque, slip, fatigue and bearing-pressure summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Define the joint and run the VDI 2230 check."
      heading="VDI 2230 single-bolt results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "assemblyPreloadMax", value: result.assemblyPreloadMax },
              { metric: "assemblyPreloadMin", value: result.assemblyPreloadMin },
              { metric: "tighteningTorque", value: result.tighteningTorque },
              { metric: "loadFactor", value: result.loadFactor },
              { metric: "residualClampForce", value: result.residualClampForce },
              { metric: "slipSafetyFactor", value: result.slipSafetyFactor },
              { metric: "fatigueSafetyFactor", value: result.fatigueSafetyFactor },
              { metric: "surfacePressure", value: result.surfacePressure },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Assembly preload FM,zul"
              value={formatEngineeringValue(result.assemblyPreloadMax / 1000, "kN")}
              tone="blue"
            />
            <CalculatorMetricCard
              label={`Min preload after scatter (αA = ${result.tighteningFactor})`}
              value={formatEngineeringValue(result.assemblyPreloadMin / 1000, "kN")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Tightening torque MA"
              value={formatEngineeringValue(result.tighteningTorque, "N·m")}
              tone="purple"
            />
            <CalculatorMetricCard label="Load factor Φ" numericValue={result.loadFactor} tone="blue" />
            <CalculatorMetricCard
              label="Embedding loss FZ"
              value={formatEngineeringValue(result.embeddingLoss / 1000, "kN")}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Residual clamp force FKR"
              value={formatEngineeringValue(result.residualClampForce / 1000, "kN")}
              tone={result.residualClampForce > 0 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
          {Number.isFinite(result.slipSafetyFactor) ? (
            <CalculatorMetricCard
              label="Slip safety (FKR · μT / FQ)"
              numericValue={result.slipSafetyFactor}
              status={
                result.slipSafetyFactor >= 1.2 ? "safe" : result.slipSafetyFactor >= 1 ? "warning" : "danger"
              }
              size="lg"
            />
          ) : null}
          <CalculatorMetricCard
            label="Working stress utilization σred,B / Rp0.2"
            numericValue={result.workingStressUtilization}
            status={result.workingStressUtilization <= 1 ? "safe" : "danger"}
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="joint" label="Result view" />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Thread stress amplitude σa"
              value={formatEngineeringValue(result.stressAmplitude / 1e6, "MPa")}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Endurance σASV (rolled thread)"
              value={formatEngineeringValue(result.enduranceLimit / 1e6, "MPa")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Fatigue safety SD"
              numericValue={result.fatigueSafetyFactor}
              tone={result.fatigueSafetyFactor >= 1.2 ? "green" : result.fatigueSafetyFactor >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label={`Head bearing pressure (${formatDisplayNumber(result.surfacePressureUtilization * 100)}% of allowable)`}
              value={formatEngineeringValue(result.surfacePressure / 1e6, "MPa")}
              tone={result.surfacePressureUtilization <= 1 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
