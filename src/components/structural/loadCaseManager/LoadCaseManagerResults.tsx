"use client";

import ExportableReport from "@/components/shared/ExportableReport";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { LoadCaseManagerResult } from "@/lib/structural/loadCaseManager/types";

type Props = {
  result: WithCalculationSpec<LoadCaseManagerResult> | null;
};

export default function LoadCaseManagerResults({ result }: Props) {
  return (
    <ExportableReport
      moduleId="load-case-manager"
      fileName="load-case-manager"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Load Case Manager results"
      description="Export the current summary for review."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Run the calculation to see envelope stresses and safety factor.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Metric label="Envelope axial force" value={`${result.envelopeAxial.toFixed(0)} N`} />
            <Metric label="Envelope bending moment" value={`${result.envelopeMoment.toFixed(0)} N·m`} />
            <Metric label="Combined stress" value={`${result.combinedStress.toFixed(1)} MPa`} />
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
