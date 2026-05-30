"use client";

import ExportableReport from "@/components/shared/ExportableReport";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { SuspensionResult } from "@/lib/dynamics/suspension/types";

type Props = {
  result: WithCalculationSpec<SuspensionResult> | null;
};

export default function SuspensionResults({ result }: Props) {
  return (
    <ExportableReport
      moduleId="suspension"
      fileName="suspension"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Suspension results"
      description="Export the current summary for review."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Run the calculation to see roll angle and load transfer.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Metric label="Lateral force" value={`${result.lateralForce.toFixed(1)} N`} />
            <Metric label="Roll moment" value={`${result.rollMoment.toFixed(1)} N·m`} />
            <Metric label="Roll angle" value={`${result.rollAngleDegrees.toFixed(2)}°`} />
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Stability</div>
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
