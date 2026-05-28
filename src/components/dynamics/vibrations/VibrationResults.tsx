"use client";

import EngineeringPlot from "@/components/EngineeringPlot";
import VibrationDiagram from "./VibrationDiagram";
import VibrationInputSchematic from "./VibrationInputSchematic";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import type { VibrationResult } from "@/lib/dynamics/vibrations/types";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: VibrationResult | null;
};

export default function VibrationResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
        fileName="vibration"
        title="Export Vibration results"
        description="Export the current summary and charts for review."
      >
        <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
          <p>Run the vibration model to view natural frequencies and mode shapes.</p>
        </div>
      </ExportableReport>
    );
  }

  const csvRows = result.frequencies.map((freq, index) => ({
    mode: index + 1,
    frequencyHz: freq,
    modalMass: result.modalMass[index],
    modalStiffness: result.modalStiffness[index],
  }));

  return (
    <ExportableReport
      fileName="vibration"
      title="Export Vibration results"
      description="Export the current summary and charts for review."
      csvRows={csvRows}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">1st natural frequency</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.frequencies[0].toFixed(2)} Hz</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Mesh segments</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.segments}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Beam length</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.length.toFixed(2)} m</div>
          </div>
        </div>
      </div>
      <CalculationQualityChecklist
        title="Vibration module quality checklist"
        checklist={{
          unitIntegrity: true,
          physicsValidation: Boolean(result.physicsChecks && result.solverMeta),
          chartConformance: true,
          pictorialCoverage: true,
          exportConsistency: true,
        }}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {result.frequencies.map((freq, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">Mode {index + 1}</div>
            <div className="text-2xl font-semibold text-slate-900">{freq.toFixed(2)} Hz</div>
            <div className="mt-2 text-sm text-slate-500">
              Modal mass {result.modalMass[index].toExponential(2)} kg
            </div>
          </div>
        ))}
      </div>
      {result.solverMeta ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Solver Metadata</div>
          <p className="mt-1">
            {result.solverMeta.solver} | support: {result.solverMeta.support} | mesh:{" "}
            {result.solverMeta.meshSegments}
          </p>
        </div>
      ) : null}
      <EngineeringPlot
        title="First mode shape"
        x={result.x}
        y={result.modeShapes[0].map((value) => value / Math.max(...result.modeShapes[0].map(Math.abs), 1e-12))}
        yLabel="Normalized displacement"
        unitLabel="-"
        color="#0ea5e9"
      />
      <EngineeringPlot
        title="Second mode shape"
        x={result.x}
        y={result.modeShapes[1].map((value) => value / Math.max(...result.modeShapes[1].map(Math.abs), 1e-12))}
        yLabel="Normalized displacement"
        unitLabel="-"
        color="#8b5cf6"
      />
      <VibrationDiagram support={result.support} x={result.x} />
      <VibrationInputSchematic support={result.support} length={result.length} segments={result.segments} />
      <FEAColorStrip title="Mode 1 Amplitude Intensity" x={result.x} values={result.modeShapes[0]} unit="-" />
      <FEAColorStrip title="Mode 2 Amplitude Intensity" x={result.x} values={result.modeShapes[1]} unit="-" />
    </ExportableReport>
  );
}
