"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { LoadCaseManagerResult } from "@/lib/structural/loadCaseManager/types";

type Props = {
  result: WithCalculationSpec<LoadCaseManagerResult> | null;
};

function statusTone(status: string): "green" | "orange" | "red" {
  if (status === "safe") return "green";
  if (status === "warning") return "orange";
  return "red";
}

export default function LoadCaseManagerResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="load-case-manager"
      fileName="load-case-manager"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Load Case Manager results"
      description="Export the current summary for review."
      empty={!result}
      emptyMessage="Run the calculation to see envelope stresses and safety factor."
      heading="Load case envelope results"
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Envelope axial force"
              value={formatEngineeringValue(result.envelopeAxial, "N")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Envelope bending moment"
              value={formatEngineeringValue(result.envelopeMoment, "N·m")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Combined stress"
              value={formatEngineeringValue(result.combinedStress, "MPa")}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Design status"
            value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
            tone={statusTone(result.designStatus)}
            size="lg"
          />
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-900">Beam module handoff</p>
            <p className="mt-1 text-slate-600">{result.beamHandoff.note}</p>
            <p className="mt-2 font-mono text-xs text-slate-700">
              Point load {formatEngineeringValue(result.beamHandoff.pointLoadN, "N")} · Moment{" "}
              {formatEngineeringValue(result.beamHandoff.momentNm, "N·m")}
            </p>
            <a
              href={result.beamHandoff.route}
              className="mt-3 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Open Beams calculator →
            </a>
          </div>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
