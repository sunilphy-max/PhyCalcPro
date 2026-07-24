"use client";

import { useMemo } from "react";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import type { Vdi2230Result } from "@/lib/fasteners/bolts/vdi2230";
import type { CalculationSpec } from "@/lib/standards/types";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import VdiJointDiagram from "./VdiJointDiagram";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import GenericDiagnosisPanel from "@/components/design-workflows/GenericDiagnosisPanel";
import { diagnoseBolt } from "@/lib/fasteners/bolts/diagnosis";

type Props = {
  result: (Vdi2230Result & { calculationSpec?: CalculationSpec }) | null;
  clampLengthM: number;
  workflowMode?: DesignWorkflowMode;
};

export default function Vdi2230Results({ result, clampLengthM, workflowMode }: Props) {
  const diagnosis = useMemo(() => {
    if (!result || workflowMode !== "diagnose") return null;
    return diagnoseBolt(result);
  }, [workflowMode, result]);

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
          {diagnosis ? (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-4 dark:border-violet-800 dark:bg-violet-950/30">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-900 dark:text-violet-100">
                Diagnose Mode
              </h3>
              <GenericDiagnosisPanel diagnosis={diagnosis} />
            </div>
          ) : null}

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Assembly preload FM,zul"
              numericValue={result.assemblyPreloadMax / 1000} unit="kN"
              tone="blue"
            />
            <CalculatorMetricCard
              label={`Min preload after scatter (αA = ${result.tighteningFactor})`}
              numericValue={result.assemblyPreloadMin / 1000} unit="kN"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Tightening torque MA"
              numericValue={result.tighteningTorque} unit="N·m"
              tone="purple"
            />
            <CalculatorMetricCard label="Load factor Φ" numericValue={result.loadFactor} unit="—" tone="blue" />
            <CalculatorMetricCard
              label="Embedding loss FZ"
              numericValue={result.embeddingLoss / 1000} unit="kN"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Residual clamp force FKR"
              numericValue={result.residualClampForce / 1000} unit="kN"
              tone={result.residualClampForce > 0 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
          {Number.isFinite(result.slipSafetyFactor) ? (
            <CalculatorMetricCard
              label="Slip safety (FKR · μT / FQ)"
              numericValue={result.slipSafetyFactor} unit="—"
              status={
                result.slipSafetyFactor >= 1.2 ? "safe" : result.slipSafetyFactor >= 1 ? "warning" : "danger"
              }
              size="lg"
            />
          ) : null}
          <CalculatorMetricCard
            label="Working stress utilization σred,B / Rp0.2"
            numericValue={result.workingStressUtilization} unit="—"
            status={result.workingStressUtilization <= 1 ? "safe" : "danger"}
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="joint" label="Result view" />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Thread stress amplitude σa"
              numericValue={result.stressAmplitude / 1e6} unit="MPa"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Endurance σASV (rolled thread)"
              numericValue={result.enduranceLimit / 1e6} unit="MPa"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Fatigue safety SD"
              numericValue={result.fatigueSafetyFactor} unit="—"
              tone={result.fatigueSafetyFactor >= 1.2 ? "green" : result.fatigueSafetyFactor >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label={`Head bearing pressure (${formatDisplayNumber(result.surfacePressureUtilization * 100)}% of allowable)`}
              numericValue={result.surfacePressure / 1e6} unit="MPa"
              tone={result.surfacePressureUtilization <= 1 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
