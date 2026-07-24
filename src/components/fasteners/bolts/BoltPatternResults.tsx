"use client";

import { useMemo } from "react";
import type { BoltPatternResult } from "@/lib/fasteners/bolts/boltPatternTypes";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import DiagnosisModeBanner from "@/components/design-workflows/DiagnosisModeBanner";

type Props = {
  result: BoltPatternResult | null;
  forceUnit: string;
};

export default function BoltPatternResults({ result, forceUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result?.bolts.length) return [];
    const indices = result.bolts.map((b) => b.index + 1);
    const forces = result.bolts.map((b) => b.force);

    return [
      {
        id: "bolt-forces",
        label: "Bolt forces",
        content: (
          <EngineeringPlot
            title="Per-bolt force (elastic share)"
            x={indices}
            y={forces}
            yLabel="Bolt force"
            xLabel="Bolt index"
            xUnit="—"
            unitLabel={forceUnit}
            showPeak
          />
        ),
      },
    ];
  }, [forceUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="bolts"
      fileName="bolt-pattern"
      title={result ? "Bolt pattern results" : "Bolt pattern"}
      description={
        result
          ? "Per-bolt force distribution (elastic method)."
          : "Enter pattern geometry and loads to see per-bolt forces."
      }
      empty={!result}
      heading="Bolt pattern results"
      csvRows={
        result
          ? result.bolts.map((b) => ({
              metric: `bolt_${b.index + 1}_force`,
              value: b.force,
            }))
          : undefined
      }
    >
      {result ? (
        <>
          <DiagnosisModeBanner result={result} />
          <CalculatorMetricGrid>
            <CalculatorMetricCard label="Max bolt force" numericValue={result.maxBoltForce} unit={forceUnit} />
            <CalculatorMetricCard label="Min bolt force" numericValue={result.minBoltForce} unit={forceUnit} />
            <CalculatorMetricCard label="Mean bolt force" numericValue={result.meanBoltForce} unit={forceUnit} />
            <CalculatorMetricCard label="Applied moment" numericValue={result.appliedMoment} unit="N·m" />
          </CalculatorMetricGrid>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left">Bolt</th>
                  <th className="px-3 py-2 text-right">x (m)</th>
                  <th className="px-3 py-2 text-right">y (m)</th>
                  <th className="px-3 py-2 text-right">Force</th>
                </tr>
              </thead>
              <tbody>
                {result.bolts.map((b) => (
                  <tr key={b.index} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-2">{b.index + 1}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatDisplayNumber(b.x)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatDisplayNumber(b.y)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatEngineeringValue(b.force, forceUnit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plotTabs.length ? (
            <EngineeringPlotPicker tabs={plotTabs} defaultTabId="bolt-forces" label="Result view" />
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
