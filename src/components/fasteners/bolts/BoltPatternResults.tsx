"use client";

import type { BoltPatternResult } from "@/lib/fasteners/bolts/boltPatternTypes";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: BoltPatternResult | null;
  forceUnit: string;
};

export default function BoltPatternResults({ result, forceUnit }: Props) {
  if (!result) {
    return (
      <CalculatorResultsShell moduleId="bolts" fileName="bolt-pattern" title="Bolt pattern" description="Run calculation.">
        <p className="text-sm text-slate-500">Enter pattern geometry and loads to see per-bolt forces.</p>
      </CalculatorResultsShell>
    );
  }

  return (
    <CalculatorResultsShell
      moduleId="bolts"
      fileName="bolt-pattern"
      title="Bolt pattern results"
      description="Per-bolt force distribution (elastic method)."
      csvRows={result.bolts.map((b) => ({
        metric: `bolt_${b.index + 1}_force`,
        value: b.force,
      }))}
    >
      <CalculatorMetricGrid>
        <CalculatorMetricCard
          label="Max bolt force"
          value={formatEngineeringValue(result.maxBoltForce, forceUnit)}
        />
        <CalculatorMetricCard
          label="Min bolt force"
          value={formatEngineeringValue(result.minBoltForce, forceUnit)}
        />
        <CalculatorMetricCard
          label="Mean bolt force"
          value={formatEngineeringValue(result.meanBoltForce, forceUnit)}
        />
        <CalculatorMetricCard
          label="Applied moment"
          value={formatEngineeringValue(result.appliedMoment, "N·m")}
        />
      </CalculatorMetricGrid>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Bolt</th>
              <th className="px-3 py-2 text-right">x (m)</th>
              <th className="px-3 py-2 text-right">y (m)</th>
              <th className="px-3 py-2 text-right">Force</th>
            </tr>
          </thead>
          <tbody>
            {result.bolts.map((b) => (
              <tr key={b.index} className="border-t border-slate-100">
                <td className="px-3 py-2">{b.index + 1}</td>
                <td className="px-3 py-2 text-right font-mono">{b.x.toFixed(4)}</td>
                <td className="px-3 py-2 text-right font-mono">{b.y.toFixed(4)}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {formatEngineeringValue(b.force, forceUnit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CalculatorResultsShell>
  );
}
