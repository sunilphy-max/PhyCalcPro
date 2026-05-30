"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ShaftDashboard from "./ShaftDashboard";
import type { ShaftResult } from "@/lib/machine/shafts/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<ShaftResult> | null;
  projectName: string;
};

export default function ShaftResults({ result, projectName }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="shafts"
        fileName={projectName || "shaft"}
        title="Export Shaft results"
        description="Export the current summary and charts for review."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-slate-500">Run calculation to see results.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      moduleId="shafts"
      fileName={projectName || "shaft"}
      calculationSpec={result?.calculationSpec}
      result={result}
      qualityOverrides={{
        unitIntegrity: true,
        physicsValidation: true,
        chartConformance: true,
        pictorialCoverage: true,
        exportConsistency: true,
      }}
      title="Export Shaft results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "maxStress", value: result.maxStress },
        { metric: "maxDeflection", value: result.maxDeflection },
        { metric: "criticalSpeed", value: result.criticalSpeed },
      ]}
    >
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Shaft Results</h2>
        <ShaftDashboard result={result} />
      </div>
    </ExportableReport>
  );
}
