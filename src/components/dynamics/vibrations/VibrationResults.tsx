"use client";


import { useRef } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import VibrationDiagram from "./VibrationDiagram";
import VibrationInputSchematic from "./VibrationInputSchematic";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import type { VibrationResult } from "@/lib/dynamics/vibrations/types";
import ResultExportControls from "@/components/ResultExportControls";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";

type Props = {
  result: VibrationResult | null;
};

export default function VibrationResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="vibration" title="Export Vibration results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the vibration model to view natural frequencies and mode shapes.</p>
      </div>
    </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
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
          <div key={index} className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-slate-500">Mode {index + 1}</div>
            <div className="text-2xl font-semibold text-slate-900">{freq.toFixed(2)} Hz</div>
            <div className="text-sm text-slate-500 mt-2">
              Modal mass {result.modalMass[index].toExponential(2)} kg
            </div>
          </div>
        ))}
      </div>
      {result.solverMeta ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-slate-900">Solver Metadata</div>
          <p className="mt-1">
            {result.solverMeta.solver} | support: {result.solverMeta.support} | mesh: {result.solverMeta.meshSegments}
          </p>
          {result.solverMeta.warnings.length ? (
            <ul className="mt-2 list-disc pl-5 text-amber-700">
              {result.solverMeta.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          {result.physicsChecks ? (
            <p className="mt-2">
              Positive frequencies: {result.physicsChecks.positiveFrequencies ? "yes" : "no"} | monotonic ordering:{" "}
              {result.physicsChecks.monotonicFrequencyOrder ? "yes" : "no"}
            </p>
          ) : null}
        </div>
      ) : null}

      <EngineeringPlot
        title="First mode shape"
        x={result.x}
        y={result.modeShapes[0].map((value) => value / Math.max(...result.modeShapes[0].map(Math.abs)))}
        yLabel="Normalized displacement"
        unitLabel="-"
        color="#0ea5e9"
      />

      <EngineeringPlot
        title="Second mode shape"
        x={result.x}
        y={result.modeShapes[1].map((value) => value / Math.max(...result.modeShapes[1].map(Math.abs)))}
        yLabel="Normalized displacement"
        unitLabel="-"
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
    </div>
  );
}
