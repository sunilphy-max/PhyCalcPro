"use client";

import type { BeamResult, Load, SupportType } from "@/lib/structural/beams/types";
import BeamDashboard from "./BeamDashboard";
import ExportableReport from "@/components/shared/ExportableReport";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (BeamResult & { calculationSpec?: CalculationSpec }) | null;
  length: number;
  support: SupportType;
  loads: Load[];
  onLoadDrag?: (
    id: string,
    updates: Partial<Extract<Load, { type: "point" }>>
  ) => void;
};

export default function BeamResults({
  result,
  length,
  support,
  loads,
  onLoadDrag,
}: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="beams"
        fileName="beam"
        title="Export Beam results"
        description="Export the current summary and charts for review."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-500">Run calculation to see results.</p>
        </div>
      </ExportableReport>
    );
  }

  const csvRows = [
    { metric: "maxMoment", value: result.maxMoment },
    { metric: "maxShear", value: result.maxShear },
    { metric: "maxStress", value: result.maxStress },
    { metric: "maxDeflection", value: result.maxDeflection },
  ];

  return (
    <ExportableReport
      moduleId="beams"
      fileName="beam"
      title="Export Beam results"
      description="Export the current summary and charts for review."
      csvRows={csvRows}
      calculationSpec={result.calculationSpec}
      result={result}
      qualityOverrides={{
        unitIntegrity: true,
        physicsValidation: Boolean(result.solverMeta),
        chartConformance: true,
        pictorialCoverage: true,
        exportConsistency: true,
      }}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Beam Results</h2>
        <BeamDashboard
          result={result}
          loads={loads}
          length={length}
          support={support}
          onLoadDrag={onLoadDrag}
        />
      </div>
    </ExportableReport>
  );
}
