"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ProfilesDashboard from "./ProfilesDashboard";
import type { AreaPropertiesResult } from "@/lib/profiles/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<AreaPropertiesResult> | null;
  projectName: string;
};

export default function ProfilesResults({ result, projectName }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="profiles"
      fileName={projectName || "profiles"}
      calculationSpec={result?.calculationSpec}
      title="Export Area Properties results"
      description="Export a detailed report of the current analysis."
      empty={!result}
      emptyMessage="Define the cross-section shape and dimensions to compute area properties."
      heading="Area Properties Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "area", value: result.area },
              { metric: "centroidX", value: result.centroid.x },
              { metric: "centroidY", value: result.centroid.y },
              { metric: "ixx", value: result.ixx },
              { metric: "iyy", value: result.iyy },
            ]
          : undefined
      }
    >
      {result ? <ProfilesDashboard result={result} /> : null}
    </CalculatorResultsShell>
  );
}
