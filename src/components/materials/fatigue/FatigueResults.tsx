"use client";

import ExportableReport from "@/components/shared/ExportableReport";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { FatigueResult } from "@/lib/materials/fatigue/types";

type Props = {
  result: WithCalculationSpec<FatigueResult> | null;
  alternatingUnit: string;
};

export default function FatigueResults({ result, alternatingUnit }: Props) {
  return (
    <ExportableReport
      moduleId="fatigue"
      fileName="fatigue"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Fatigue results"
      description="Export the current summary for review."
      csvRows={
        result
          ? [
              { metric: "allowableStress", value: result.allowableStress, unit: alternatingUnit },
              { metric: "predictedCycles", value: result.predictedCycles },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Enter loading and material values, then run the calculation.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Metric label="Allowable alternating stress" value={`${result.allowableStress.toFixed(1)} ${alternatingUnit}`} />
            <Metric label="Predicted life" value={`${result.predictedCycles.toLocaleString()} cycles`} />
            <Metric label="Safety factor" value={result.safetyFactor.toFixed(2)} />
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Status</div>
              <div className="mt-2 text-xl font-semibold">{result.designStatus}</div>
            </div>
          </div>
        )}
      </div>
    </ExportableReport>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
