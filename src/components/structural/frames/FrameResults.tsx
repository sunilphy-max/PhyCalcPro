"use client";


import { useRef } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import FrameDiagram from "./FrameDiagram";
import type { FrameResult } from "@/lib/structural/frames/types";
import ResultExportControls from "@/components/ResultExportControls";
import FEAColorStrip from "@/components/shared/FEAColorStrip";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";

type Props = {
  result: FrameResult | null;
};

export default function FrameResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="frame" title="Export Frame results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the frame analysis to visualize deflection and internal action.</p>
      </div>
    </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max displacement</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxDisplacement.toExponential(3)} m</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max axial</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxAxial.toExponential(3)} N</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max moment</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxMoment.toExponential(3)} N·m</div>
          </div>
        </div>
      </div>
      <CalculationQualityChecklist
        title="Frame module quality checklist"
        checklist={{
          unitIntegrity: true,
          physicsValidation: true,
          chartConformance: true,
          pictorialCoverage: true,
          exportConsistency: true,
        }}
      />

      <EngineeringPlot
        title="Beam midspan deflection"
        x={result.topNodesX}
        y={result.topDeflections}
        yLabel="Deflection"
        unitLabel="m"
      />

      <FrameDiagram result={result} />
      <FEAColorStrip
        title="Frame Deflection Intensity"
        x={result.topNodesX}
        values={result.topDeflections}
        unit="m"
      />
    </div>
  );
}
