"use client";

import type { BeamResult, Load, SupportType } from "@/lib/structural/beams/types";
import BeamDashboard from "./BeamDashboard";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: BeamResult | null;
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
      fileName="beam"
      title="Export Beam results"
      description="Export the current summary and charts for review."
      csvRows={csvRows}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Beam Results</h2>
        <CalculationQualityChecklist
          title="Beam module quality checklist"
          checklist={{
            unitIntegrity: true,
            physicsValidation: Boolean(result.solverMeta && result.physicsChecks),
            chartConformance: true,
            pictorialCoverage: true,
            exportConsistency: true,
          }}
        />
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
