"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { TemperaturePropertiesResult } from "@/lib/materials/temperatureProperties/types";

type Props = {
  result: WithCalculationSpec<TemperaturePropertiesResult> | null;
};

export default function TemperaturePropertiesResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="temperature-properties"
      fileName="temperature-properties"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Temperature Properties results"
      description="Export the current summary for review."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Results</h2>
        {!result ? (
          <p className="mt-4 text-sm text-slate-500">Run the calculation to see adjusted strength and expansion values.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Metric label="Adjusted yield strength" value={`${result.adjustedYield.toFixed(1)} MPa`} />
            <Metric label="Adjusted modulus" value={`${result.adjustedModulus.toFixed(1)} GPa`} />
            <Metric label="Thermal expansion per meter" value={`${result.expansionPerMeter.toExponential(2)} /°C`} />
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Status</div>
              <div className="mt-2 text-xl font-semibold">{result.designStatus}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorResultsShell>
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
