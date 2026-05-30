"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import BucklingDashboard from "./BucklingDashboard";
import type { BucklingResult } from "@/lib/structural/columns/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<BucklingResult> | null;
  projectName: string;
};

export default function BucklingResults({ result, projectName }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="columns"
        fileName={projectName || "buckling"}
        title="Export Buckling results"
        description="Export a detailed report of the current analysis."
      >
        <div className="flex items-center justify-center h-80 text-gray-500">
          <p className="text-gray-500">Run calculation to see results.</p>
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      moduleId="columns"
      fileName={projectName || "buckling"}
      calculationSpec={result?.calculationSpec}
      title="Export Buckling results"
      description="Export a detailed report of the current analysis."
      csvRows={[
        { metric: "Pcr", value: result.Pcr },
        { metric: "criticalLoad", value: result.criticalLoad },
        { metric: "safetyFactor", value: result.safetyFactor },
        { metric: "slenderness", value: result.slenderness },
      ]}
    >
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Buckling Results</h2>
        <BucklingDashboard result={result} />
      </div>
    </ExportableReport>
  );
}
