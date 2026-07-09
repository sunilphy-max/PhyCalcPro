import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ToleranceResult } from "@/lib/manufacturing/types";

type Props = {
  result: WithCalculationSpec<ToleranceResult> | null;
  displayUnit: string;
};

function metricValue(value: number | undefined) {
  return value === undefined ? undefined : value;
}

export default function ToleranceResults({ result, displayUnit }: Props) {
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
              { metric: "worstCaseZ", value: result.worstCaseZ ?? 0 },
              { metric: "worstCase3d", value: result.worstCase3d ?? 0 },
              { metric: "monteCarloMean", value: result.monteCarloMean ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <p className="text-sm text-slate-500">Computed from {result.count} X-axis tolerance elements.</p>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Worst-case (X)"
              numericValue={metricValue(result.worstCase)}
              unit={displayUnit}
              tone="orange"
            />
            <CalculatorMetricCard label="RSS (X)" numericValue={metricValue(result.rss)} unit={displayUnit} tone="blue" />
            {result.worstCaseY !== undefined ? (
              <>
                <CalculatorMetricCard
                  label="Worst-case (Y)"
                  numericValue={metricValue(result.worstCaseY)}
                  unit={displayUnit}
                  tone="orange"
                />
                <CalculatorMetricCard
                  label="RSS (Y)"
                  numericValue={metricValue(result.rssY)}
                  unit={displayUnit}
                  tone="blue"
                />
              </>
            ) : null}
            {result.worstCaseZ !== undefined ? (
              <>
                <CalculatorMetricCard
                  label="Worst-case (Z)"
                  numericValue={metricValue(result.worstCaseZ)}
                  unit={displayUnit}
                  tone="orange"
                />
                <CalculatorMetricCard
                  label="RSS (Z)"
                  numericValue={metricValue(result.rssZ)}
                  unit={displayUnit}
                  tone="blue"
                />
              </>
            ) : null}
          </CalculatorMetricGrid>
          {result.worstCase3d !== undefined ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="3D worst-case magnitude"
                numericValue={metricValue(result.worstCase3d)}
                unit={displayUnit}
                tone="red"
              />
              <CalculatorMetricCard
                label="3D RSS magnitude"
                numericValue={metricValue(result.rss3d)}
                unit={displayUnit}
                tone="purple"
              />
            </CalculatorMetricGrid>
          ) : null}
          <CalculatorMetricCard
            label="Total absolute (X)"
            numericValue={metricValue(result.totalTolerance)}
            unit={displayUnit}
            tone="purple"
          />
          {result.monteCarloMean !== undefined ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Monte Carlo mean (3D mag.)"
                numericValue={metricValue(result.monteCarloMean)}
                unit={displayUnit}
                tone="blue"
              />
              <CalculatorMetricCard
                label="Monte Carlo σ"
                numericValue={metricValue(result.monteCarloStdDev)}
                unit={displayUnit}
                tone="blue"
              />
            </CalculatorMetricGrid>
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
