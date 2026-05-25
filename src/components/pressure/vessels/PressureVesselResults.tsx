"use client";


import { useRef } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import type { PressureVesselResult } from "@/lib/pressure/vessels/types";
import ResultExportControls from "@/components/ResultExportControls";

type Props = {
  result: PressureVesselResult | null;
};

export default function PressureVesselResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="pressure-vessel" title="Export Pressure Vessel results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the pressure vessel model to see hoop stress and radial deflection.</p>
      </div>
    );
  }

  const angleDegrees = result.angles.map((theta) => (theta < 0 ? theta + 2 * Math.PI : theta) * (180 / Math.PI));
  const normalizedDisplacement = result.radialDisplacement.map((value) => value / result.maxRadialDisplacement);

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
            <div className="text-xs uppercase tracking-wider text-slate-500">Internal pressure</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.pressure.toFixed(0)} Pa</div>
          </div>
        </div>
      </div>

      <EngineeringPlot
        title="Radial displacement around circumference"
        x={angleDegrees}
        y={result.radialDisplacement}
        yLabel="Radial displacement (m)"
      />

      <EngineeringPlot
        title="Hoop stress distribution"
        x={angleDegrees}
        y={result.hoopStress}
        yLabel="Hoop stress (Pa)"
      />
    </div>
  );
}
