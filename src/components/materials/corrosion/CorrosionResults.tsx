"use client";

import ExportableReport from "@/components/shared/ExportableReport";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CorrosionResult } from "@/lib/materials/corrosion/types";

type Props = {
  result: WithCalculationSpec<CorrosionResult> | null;
  thicknessUnit: string;
};

export default function CorrosionResults({ result, thicknessUnit }: Props) {
  return (
    <ExportableReport
      moduleId="corrosion"
      fileName="corrosion"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Corrosion results"
      description="Export the current summary for review."
      csvRows={
        result
          ? [
              { metric: "corrosionAllowance", value: result.corrosionAllowance, unit: thicknessUnit },
              { metric: "requiredThickness", value: result.requiredThickness, unit: thicknessUnit },
              { metric: "remainingThickness", value: result.remainingThickness, unit: thicknessUnit },
            ]
          : undefined
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Run the analysis to see allowance and required thickness results.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <MetricCard label="Corrosion allowance" value={`${result.corrosionAllowance.toFixed(2)} ${thicknessUnit}`} />
            <MetricCard label="Required thickness" value={`${result.requiredThickness.toFixed(2)} ${thicknessUnit}`} />
            <MetricCard label="Remaining thickness after life" value={`${result.remainingThickness.toFixed(2)} ${thicknessUnit}`} />
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
