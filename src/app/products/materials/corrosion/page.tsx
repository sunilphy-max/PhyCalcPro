"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import type { CorrosionConfig, CorrosionResult } from "@/lib/materials/corrosion/types";

export default function Page() {
  const [initialThickness, setInitialThickness] = useState(10);
  const [corrosionRate, setCorrosionRate] = useState(0.2);
  const [designLife, setDesignLife] = useState(10);
  const [safetyMargin, setSafetyMargin] = useState(25);
  const [result, setResult] = useState<CorrosionResult | null>(null);

  const calculate = () => {
    const config: CorrosionConfig = {
      initialThickness,
      corrosionRate,
      designLife,
      safetyMargin,
    };
    setResult(solveCorrosionEngine(config));
  };

  return (
    <DashboardLayout title="Corrosion Allowance">
      <CalculatorLayout
        title="Corrosion Allowance Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Design inputs</h2>
              <p className="mt-2 text-sm text-slate-600">Estimate required material thickness for corrosion exposure.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Initial thickness (mm)
              <input
                type="number"
                value={initialThickness}
                onChange={(event) => setInitialThickness(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Corrosion rate (mm/year)
              <input
                type="number"
                step="0.01"
                value={corrosionRate}
                onChange={(event) => setCorrosionRate(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Design life (years)
              <input
                type="number"
                value={designLife}
                onChange={(event) => setDesignLife(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Safety margin (%)
              <input
                type="number"
                value={safetyMargin}
                onChange={(event) => setSafetyMargin(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate corrosion allowance
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Corrosion overview</h2>
            <p className="mt-4 leading-7">
              This calculator produces a corrosion allowance based on a uniform loss rate and required design life, then applies a safety margin to the thickness requirement.
            </p>
          </div>
        }
        right={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Results</h2>
            {!result ? (
              <p className="mt-4 text-sm text-slate-500">Run the analysis to see allowance and required thickness results.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Corrosion allowance</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.corrosionAllowance.toFixed(2)} mm</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Required thickness</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.requiredThickness.toFixed(2)} mm</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Remaining thickness after life</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.remainingThickness.toFixed(2)} mm</div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-4 text-white">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Status</div>
                  <div className="mt-2 text-xl font-semibold">{result.designStatus}</div>
                </div>
              </div>
            )}
          </div>
        }
      />
    </DashboardLayout>
  );
}
