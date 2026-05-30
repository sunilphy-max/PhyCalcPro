import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";

type ToleranceResult = {
  tolerances: number[];
  count: number;
  worstCase: number;
  rss: number;
  totalTolerance: number;
};

type Props = {
  result: WithCalculationSpec<ToleranceResult> | null;
  displayUnit: string;
};

export default function ToleranceResults({ result, displayUnit }: Props) {
  if (!result) {
    return (
      <CalculatorResultsShell
      moduleId="tolerance"
        fileName="tolerance"
        title="Export Tolerance results"
        description="Export the current summary and charts for review."
      >
        <div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Apply tolerances to see stackup and variability results.</p>
        </div>
      </CalculatorResultsShell>
    );
  }

  const format = (value: number) => `${value.toFixed(4)} ${displayUnit}`;

  return (
    <CalculatorResultsShell
      moduleId="tolerance"
      fileName="tolerance"
      calculationSpec={result.calculationSpec}
      title="Export Tolerance results"
      description="Export the current summary and charts for review."
      csvRows={[
        { metric: "worstCase", value: result.worstCase },
        { metric: "rss", value: result.rss },
        { metric: "totalTolerance", value: result.totalTolerance },
      ]}
    >
      <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Stackup Results</h3>
          <p className="text-sm text-slate-500 mt-1">Computed from {result.count} tolerance elements.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">Worst-case stackup</div>
            <div className="mt-2 text-slate-900">{format(result.worstCase)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm uppercase tracking-wide text-slate-500">RSS stackup</div>
            <div className="mt-2 text-slate-900">{format(result.rss)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm uppercase tracking-wide text-slate-500">Total absolute tolerance</div>
          <div className="mt-2 text-slate-900">{format(result.totalTolerance)}</div>
        </div>
      </div>
    </CalculatorResultsShell>
  );
}
