"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ToleranceResult } from "@/lib/manufacturing/types";
import type { ContributorBreakdown } from "@/lib/manufacturing/gdt/types";

type Props = {
  result: WithCalculationSpec<ToleranceResult> | null;
  displayUnit: string;
  gdtBreakdown?: ContributorBreakdown[];
};

function metricValue(value: number | undefined) {
  return value === undefined ? undefined : value;
}

export default function ToleranceResults({ result, displayUnit, gdtBreakdown }: Props) {
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
              ...(gdtBreakdown ?? []).map((row) => ({
                metric: `contributor:${row.id}`,
                value: row.effectiveTolerance,
              })),
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <p className="text-sm text-slate-500">
            Computed from {result.count}{" "}
            {gdtBreakdown?.length ? "GD&T stack contributors" : "X-axis tolerance elements"}.
          </p>
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

          {gdtBreakdown && gdtBreakdown.length > 0 ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Contributor / bonus / sensitivity
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-1 pr-3 font-medium">Contributor</th>
                      <th className="py-1 pr-3 font-medium">Kind</th>
                      <th className="py-1 pr-3 font-medium">Axis</th>
                      <th className="py-1 pr-3 font-medium">Specified</th>
                      <th className="py-1 pr-3 font-medium">Bonus</th>
                      <th className="py-1 pr-3 font-medium">Effective</th>
                      <th className="py-1 font-medium">% of WC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gdtBreakdown.map((row) => {
                      const pct =
                        result.worstCase > 0
                          ? (100 * Math.abs(row.effectiveTolerance)) / result.worstCase
                          : 0;
                      return (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-1.5 pr-3">{row.label ?? row.id}</td>
                          <td className="py-1.5 pr-3">{row.characteristic ?? row.kind}</td>
                          <td className="py-1.5 pr-3">
                            {row.sense < 0 ? "−" : "+"}
                            {row.axis}
                          </td>
                          <td className="py-1.5 pr-3 tabular-nums">
                            {row.specifiedTolerance.toPrecision(4)} {displayUnit}
                          </td>
                          <td className="py-1.5 pr-3 tabular-nums">
                            {row.bonus.toPrecision(4)} {displayUnit}
                          </td>
                          <td className="py-1.5 pr-3 tabular-nums">
                            {row.effectiveTolerance.toPrecision(4)} {displayUnit}
                          </td>
                          <td className="py-1.5 tabular-nums">{pct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500">
                Sensitivity = |effective| / worst-case (deterministic). Monte Carlo uses the sample
                count set in inputs when &gt; 0.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
