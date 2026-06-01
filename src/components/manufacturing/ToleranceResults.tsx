import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ToleranceResult } from "@/lib/manufacturing/types";

type Props = {
  result: WithCalculationSpec<ToleranceResult> | null;
  displayUnit: string;
};

export default function ToleranceResults({ result, displayUnit }: Props) {
  const format = (value: number | undefined) =>
    value === undefined ? "—" : `${value.toFixed(4)} ${displayUnit}`;

  return (
    <CalculatorResultsShell
      moduleId="tolerance"
      fileName="tolerance"
      title="Export Tolerance results"
      description="Export the current summary and charts for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Apply tolerances to see stackup and variability results."
      heading="Stackup results"
      csvRows={
        result
          ? [
              { metric: "worstCase", value: result.worstCase },
              { metric: "rss", value: result.rss },
              { metric: "worstCaseY", value: result.worstCaseY ?? 0 },
              { metric: "monteCarloMean", value: result.monteCarloMean ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <p className="text-sm text-slate-500">Computed from {result.count} X-axis tolerance elements.</p>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Worst-case (X)" value={format(result.worstCase)} tone="orange" />
            <CalculatorMetricCard label="RSS (X)" value={format(result.rss)} tone="blue" />
            {result.worstCaseY !== undefined ? (
              <>
                <CalculatorMetricCard label="Worst-case (Y)" value={format(result.worstCaseY)} tone="orange" />
                <CalculatorMetricCard label="RSS (Y)" value={format(result.rssY)} tone="blue" />
              </>
            ) : null}
          </CalculatorMetricGrid>
          <CalculatorMetricCard label="Total absolute (X)" value={format(result.totalTolerance)} tone="purple" />
          {result.monteCarloMean !== undefined ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard label="Monte Carlo mean" value={format(result.monteCarloMean)} tone="blue" />
              <CalculatorMetricCard label="Monte Carlo σ" value={format(result.monteCarloStdDev)} tone="blue" />
            </CalculatorMetricGrid>
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
