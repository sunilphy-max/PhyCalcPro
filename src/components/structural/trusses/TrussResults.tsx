"use client";


import { useRef } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import TrussDiagram from "./TrussDiagram";
import type { TrussResult } from "@/lib/structural/trusses/types";
import ResultExportControls from "@/components/ResultExportControls";

type Props = {
  result: TrussResult | null;
};

export default function TrussResults({ result }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  if (!result) {
    return (
    <div className="space-y-6">
      <ResultExportControls reportRef={reportRef} fileName="truss" title="Export Truss results" description="Export the current summary and charts for review." />
      <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
        <p>Run the truss analysis to see node displacements and member forces.</p>
      </div>
    );
  }

  const highestTension = result.memberForces.reduce((best, member) => {
    if (member.force > best.force) return member;
    return best;
  }, result.memberForces[0]);

  const highestCompression = result.memberForces.reduce((best, member) => {
    if (member.force < best.force) return member;
    return best;
  }, result.memberForces[0]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Peak displacement</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxDisplacement.toExponential(3)} m</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">Max axial force</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxForce.toExponential(3)} N</div>
          </div>
        </div>
      </div>

      <EngineeringPlot
        title="Top chord deflection"
        x={result.topNodesX}
        y={result.topDeflections}
        yLabel="Deflection (m)"
      />

      <TrussDiagram result={result} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-sm font-semibold mb-3">Max tension</div>
          <div className="text-slate-700">{highestTension.id}</div>
          <div className="text-sm text-slate-500">{highestTension.force.toExponential(3)} N</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="text-sm font-semibold mb-3">Max compression</div>
          <div className="text-slate-700">{highestCompression.id}</div>
          <div className="text-sm text-slate-500">{highestCompression.force.toExponential(3)} N</div>
        </div>
      </div>
    </div>
  );
}
