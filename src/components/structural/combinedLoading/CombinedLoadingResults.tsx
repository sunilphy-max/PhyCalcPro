"use client";

import ExportableReport from "@/components/shared/ExportableReport";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";

type Props = {
  result: WithCalculationSpec<CombinedLoadingResult> | null;
};

export default function CombinedLoadingResults({ result }: Props) {
  return (
    <ExportableReport
      moduleId="combined-loading"
      fileName="combined-loading"
      title="Export Combined Loading results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Run the calculation to review combined stresses and safety factor.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Metric label="Von Mises stress" value={`${result.vonMisesStress.toFixed(1)} MPa`} />
            <Metric label="Safety factor" value={result.safetyFactor.toFixed(2)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Axial stress" value={`${result.axialStress.toFixed(1)} MPa`} />
              <Metric label="Bending stress" value={`${result.bendingStress.toFixed(1)} MPa`} />
            </div>
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
