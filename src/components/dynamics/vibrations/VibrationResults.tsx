"use client";

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
} from "@/components/calculator/results";

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
      qualityOverrides={{
        unitIntegrity: true,
        physicsValidation: Boolean(result?.solverMeta),
        chartConformance: true,
        pictorialCoverage: true,
        exportConsistency: true,
      }}
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="1st natural frequency"
              value={`${result.frequencies[0].toFixed(2)} Hz`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Mesh segments"
              value={result.segments}
              tone="purple"
              size="lg"
            />
            <CalculatorMetricCard
              label="Beam length"
              value={`${result.length.toFixed(2)} m`}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={3}>
            {result.frequencies.map((freq, index) => (
              <CalculatorMetricCard
                key={index}
                label={`Mode ${index + 1}`}
                value={`${freq.toFixed(2)} Hz`}
                tone={index === 0 ? "blue" : index === 1 ? "purple" : "green"}
              />
            ))}
          </CalculatorMetricGrid>
          {result.solverMeta ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <div className="font-semibold text-gray-900">Solver metadata</div>
              <p className="mt-1">
                {result.solverMeta.solver} | support: {result.solverMeta.support} | mesh:{" "}
                {result.solverMeta.meshSegments}
              </p>
            </div>
          ) : null}
          <EngineeringPlot
            title="First mode shape"
            x={result.x}
            y={result.modeShapes[0].map(
              (value) =>
                value / Math.max(...result.modeShapes[0].map(Math.abs), 1e-12)
            )}
            yLabel="Normalized displacement"
            xLabel="Position along beam"
            xUnit="m"
            unitLabel="—"
            color="#0ea5e9"
          />
          <EngineeringPlot
            title="Second mode shape"
            x={result.x}
            y={result.modeShapes[1].map(
              (value) =>
                value / Math.max(...result.modeShapes[1].map(Math.abs), 1e-12)
            )}
            yLabel="Normalized displacement"
            xLabel="Position along beam"
            xUnit="m"
            unitLabel="—"
            color="#8b5cf6"
          />
          <VibrationDiagram support={result.support} x={result.x} />
          <VibrationInputSchematic
            support={result.support}
            length={result.length}
            segments={result.segments}
          />
          <FEAColorStrip
            title="Mode 1 Amplitude Intensity"
            x={result.x}
            values={result.modeShapes[0]}
            unit="-"
          />
          <FEAColorStrip
            title="Mode 2 Amplitude Intensity"
            x={result.x}
            values={result.modeShapes[1]}
            unit="-"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
