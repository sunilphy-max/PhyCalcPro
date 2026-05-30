"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { ImpactResult } from "@/lib/dynamics/impact/types";

type Props = {
  result: WithCalculationSpec<ImpactResult> | null;
};

export default function ImpactResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="impact"
      fileName="impact"
      title="Export Impact results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
    >
      {result ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Impact summary</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Impulse</dt>
              <dd className="font-medium text-slate-900">{result.impulse.toFixed(2)} N·s</dd>
            </div>
            <div>
              <dt className="text-slate-500">Average force</dt>
              <dd className="font-medium text-slate-900">{result.averageForce.toFixed(2)} N</dd>
            </div>
            <div>
              <dt className="text-slate-500">Dynamic stress</dt>
              <dd className="font-medium text-slate-900">{result.dynamicStress.toFixed(2)} MPa</dd>
            </div>
            <div>
              <dt className="text-slate-500">Safety factor</dt>
              <dd className="font-medium text-slate-900">{result.safetyFactor.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Run a calculation to view impact results.
        </div>
      )}
    </CalculatorResultsShell>
  );
}
