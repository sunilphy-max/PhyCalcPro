"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import PlateHeatmap from "./PlateHeatmap";
import type { PlateResult } from "@/lib/structural/plates/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<PlateResult> | null;
};

export default function PlateResults({ result }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="plates"
        fileName="plate"
        title="Export Plate results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl shadow-sm p-6 h-full flex items-center justify-center text-slate-500">
          <p>Run the plate analysis to display deflection and moment results.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      moduleId="plates"
      fileName="plate"
      calculationSpec={result?.calculationSpec}
      title="Export Plate results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "maxDeflection", value: result.maxDeflection },
        { metric: "maxMoment", value: result.maxMoment },
      ]}
    >
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="text-sm text-slate-500 mt-1">Finite element plate bending results at the current mesh density.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Max deflection</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxDeflection.toExponential(3)} m</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Peak bending moment</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{result.maxMoment.toExponential(3)} N·m</div>
          </div>
        </div>
      </div>

      <EngineeringPlot
        title="Mid-span deflection along length"
        x={result.x}
        y={result.deflectionAlongLength}
        yLabel="Deflection (m)"
      />

      <EngineeringPlot
        title="Mid-span deflection along width"
        x={result.y}
        y={result.deflectionAlongWidth}
        yLabel="Deflection (m)"
      />

      <PlateHeatmap title="Deflection surface" x={result.x} y={result.y} z={result.w} />
    </ExportableReport>
  );
}
