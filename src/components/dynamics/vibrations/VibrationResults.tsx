"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import VibrationDiagram from "./VibrationDiagram";
import VibrationInputSchematic from "./VibrationInputSchematic";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import type { VibrationResult } from "@/lib/dynamics/vibrations/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<VibrationResult> | null;
};

export default function VibrationResults({ result }: Props) {
  const csvRows = result?.frequencies.map((freq, index) => ({
    mode: index + 1,
    frequencyHz: freq,
    modalMass: result.modalMass[index],
    modalStiffness: result.modalStiffness[index],
  }));

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const norm = (shape: number[]) =>
      shape.map((value) => value / Math.max(...shape.map(Math.abs), 1e-12));

    return [
      {
        id: "mode-1",
        label: "Mode 1 shape",
        content: (
          <EngineeringPlot
            title="First mode shape"
            x={result.x}
            y={norm(result.modeShapes[0])}
            yLabel="Normalized displacement"
            xLabel="Position along beam"
            xUnit="m"
            unitLabel="—"
            color="#0ea5e9"
          />
        ),
      },
      {
        id: "mode-2",
        label: "Mode 2 shape",
        content: (
          <EngineeringPlot
            title="Second mode shape"
            x={result.x}
            y={norm(result.modeShapes[1])}
            yLabel="Normalized displacement"
            xLabel="Position along beam"
            xUnit="m"
            unitLabel="—"
            color="#8b5cf6"
          />
        ),
      },
      {
        id: "diagram",
        label: "Mode shape diagram",
        content: <VibrationDiagram support={result.support} x={result.x} />,
      },
      {
        id: "schematic",
        label: "Model schematic",
        content: (
          <VibrationInputSchematic
            support={result.support}
            length={result.length}
            segments={result.segments}
          />
        ),
      },
      {
        id: "intensity-1",
        label: "Mode 1 intensity",
        content: (
          <FEAColorStrip title="Mode 1 amplitude" x={result.x} values={result.modeShapes[0]} unit="-" />
        ),
      },
      {
        id: "intensity-2",
        label: "Mode 2 intensity",
        content: (
          <FEAColorStrip title="Mode 2 amplitude" x={result.x} values={result.modeShapes[1]} unit="-" />
        ),
      },
    ];
  }, [result]);

  return (
    <CalculatorResultsShell
      moduleId="vibrations"
      fileName="vibration"
      calculationSpec={result?.calculationSpec}
      title="Export Vibration results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the vibration model to view natural frequencies and mode shapes."
      heading="Vibration Results"
      csvRows={csvRows}
      qualityOverrides={chartModuleQuality({
        physicsValidation: Boolean(result?.solverMeta),
      })}
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={4}>
            <CalculatorMetricCard
              label="1st natural frequency"
              value={formatEngineeringValue(result.frequencies[0], "Hz")}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label={`1st damped (ζ=${result.dampingRatio})`}
              value={formatEngineeringValue(result.dampedNaturalFrequencies[0] ?? 0, "Hz")}
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard label="Mesh segments" numericValue={result.segments} tone="purple" size="lg" />
            <CalculatorMetricCard
              label="Beam length"
              value={formatEngineeringValue(result.length, "m")}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={3}>
            {result.frequencies.map((freq, index) => (
              <CalculatorMetricCard
                key={index}
                label={`Mode ${index + 1}`}
                value={formatEngineeringValue(freq, "Hz")}
                tone={index === 0 ? "blue" : index === 1 ? "purple" : "green"}
              />
            ))}
          </CalculatorMetricGrid>
          {result.resonanceNote ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              {result.resonanceNote}
            </p>
          ) : null}
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="mode-1" label="Result chart" />
          {result.solverMeta ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {result.solverMeta.solver} · {result.solverMeta.support} · mesh{" "}
              {result.solverMeta.meshSegments}
            </p>
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
