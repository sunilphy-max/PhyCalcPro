"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ScrewsDashboard from "./ScrewsDashboard";
import type { ScrewResult } from "@/lib/fasteners/bolts/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";

type Props = {
  result: WithCalculationSpec<ScrewResult> | null;
  projectName: string;
};

export default function ScrewsResults({ result, projectName }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="bolts"
      fileName={projectName || "screw"}
      calculationSpec={result?.calculationSpec}
      title="Export Screw results"
      description="Export a detailed report of the current analysis."
      empty={!result}
      emptyMessage="Run a calculation to see results."
      heading={`Results: ${projectName}`}
      reportMeta={{ project: projectName }}
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? <ScrewsDashboard result={result} /> : null}
    </CalculatorResultsShell>
  );
}
