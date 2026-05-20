"use client";

import EngineeringPlot from "@/components/EngineeringPlot";
import VibrationDiagram from "./VibrationDiagram";
import type { VibrationResult } from "@/lib/dynamics/vibrations/types";

type Props = {
  result: VibrationResult | null;
};

export default function VibrationResults({ result }: Props) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the vibration model to view natural frequencies and mode shapes.</p>
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

      <EngineeringPlot
        title="First mode shape"
        x={result.x}
        y={result.modeShapes[0].map((value) => value / Math.max(...result.modeShapes[0].map(Math.abs)))}
        yLabel="Normalized displacement"
      />

      <EngineeringPlot
        title="Second mode shape"
        x={result.x}
        y={result.modeShapes[1].map((value) => value / Math.max(...result.modeShapes[1].map(Math.abs)))}
        yLabel="Normalized displacement"
      />

      <VibrationDiagram support={result.support} x={result.x} />
    </div>
  );
}
