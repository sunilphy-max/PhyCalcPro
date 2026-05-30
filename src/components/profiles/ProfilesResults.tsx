"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ProfilesDashboard from "./ProfilesDashboard";
import type { AreaPropertiesResult } from "@/lib/profiles/types";
import ExportableReport from "@/components/shared/ExportableReport";

type Props = {
  result: WithCalculationSpec<AreaPropertiesResult> | null;
  projectName: string;
};

export default function ProfilesResults({ result, projectName }: Props) {
  if (!result) {
    return (
      <ExportableReport
      moduleId="profiles"
        fileName={projectName || "profiles"}
        title="Export Area Properties results"
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
      moduleId="profiles"
      fileName={projectName || "profiles"}
      calculationSpec={result?.calculationSpec}
      title="Export Area Properties results"
      description="Export a detailed report of the current analysis."
      csvRows={[
        { metric: "area", value: result.area },
        { metric: "centroidX", value: result.centroid.x },
        { metric: "centroidY", value: result.centroid.y },
        { metric: "ixx", value: result.ixx },
        { metric: "iyy", value: result.iyy },
      ]}
    >
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Area Properties Results</h2>
        <ProfilesDashboard result={result} />
      </div>
    </ExportableReport>
  );
}
