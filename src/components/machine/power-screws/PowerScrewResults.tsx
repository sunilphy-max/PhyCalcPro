"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import type { ScrewResult } from "@/lib/fasteners/bolts/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import ScrewsDashboard from "@/components/fasteners/bolts/ScrewsDashboard";

type Props = {
  result: WithCalculationSpec<ScrewResult> | null;
  projectName: string;
};

export default function PowerScrewResults({ result, projectName }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="power-screws"
      fileName={projectName || "power-screw"}
      calculationSpec={result?.calculationSpec}
      title="Export power screw report"
      description="Torque, efficiency, and safety metrics for the current screw drive."
      empty={!result}
      emptyMessage="Run the analysis to review torque, efficiency, and safety factor."
      heading="Power screw results"
      reportMeta={{ project: projectName }}
      csvRows={
        result
          ? [
              { metric: "torque", value: result.torque },
              { metric: "efficiency", value: result.efficiency },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard label="Drive torque" numericValue={result.torque} unit="N·m" tone="blue" />
            <CalculatorMetricCard label="Efficiency" numericValue={result.efficiency * 100} unit="%" tone="purple" />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              unit="—"
              tone={result.safetyFactor >= 1.5 ? "green" : "amber"}
            />
          </CalculatorMetricGrid>
          <ScrewsDashboard result={result} />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
