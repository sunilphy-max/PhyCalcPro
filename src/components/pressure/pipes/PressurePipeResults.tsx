"use client";


import { useRef } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressurePipeResult } from "@/lib/pressure/pipes/types";
import ResultExportControls from "@/components/ResultExportControls";

type Props = {
  result: PressurePipeResult | null;
};

export default function PressurePipeResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="pressure-pipe" title="Export Pressure Pipe results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the pipe model to see hoop stress and radial displacement around the circumference.</p>
      </div>
    </div>
    );
  }

  const angles = result.angles.map((theta) => (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max radial displacement</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxRadialDisplacement.toExponential(3)} m</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max hoop stress</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxHoopStress.toExponential(3)} Pa</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Circumference nodes</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.segments}</div>
          </div>
        </div>
      </div>

      <EngineeringPlot
        title="Radial displacement around circumference"
        x={angles}
        y={result.radialDisplacement}
        yLabel="Radial displacement (m)"
      />

      <EngineeringPlot
        title="Hoop stress distribution"
        x={angles}
        y={result.hoopStress}
        yLabel="Hoop stress (Pa)"
      />
    </div>
  );
}
