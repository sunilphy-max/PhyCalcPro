"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ScrewsDashboard from "./ScrewsDashboard";
import type { ScrewResult } from "@/lib/fasteners/bolts/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<ScrewResult> | null;
  projectName: string;
};

export default function ScrewsResults({ result, projectName }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="bolts"
        fileName={projectName || "screw"}
        title="Export Screw results"
        description="Export a detailed report of the current analysis."
      >
        <div className="flex items-center justify-center h-80 text-gray-500">
          Run a calculation to see results
        </div>
      </ExportableReport>
    );
  }

  return (
    <ExportableReport
      moduleId="bolts"
      fileName={projectName || "screw"}
      calculationSpec={result?.calculationSpec}
      title="Export Screw results"
      description="Export a detailed report of the current analysis."
      csvRows={[
        { metric: "shearStress", value: result.shearStress },
        { metric: "vonMisesStress", value: result.vonMisesStress },
        { metric: "safetyFactor", value: result.safetyFactor },
      ]}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Results: {projectName}</h2>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <ScrewsDashboard result={result} />
        </div>
      </div>
    </ExportableReport>
  );
}
