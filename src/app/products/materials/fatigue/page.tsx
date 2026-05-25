"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { FatigueConfig, FatigueResult } from "@/lib/materials/fatigue/types";

export default function Page() {
  const [alternatingStress, setAlternatingStress] = useState(120);
  const [meanStress, setMeanStress] = useState(30);
  const [ultimateStrength, setUltimateStrength] = useState(520);
  const [enduranceLimit, setEnduranceLimit] = useState(240);
  const [result, setResult] = useState<FatigueResult | null>(null);

  const calculate = () => {
    const config: FatigueConfig = {
      alternatingStress,
      meanStress,
      ultimateStrength,
      enduranceLimit,
    };
    setResult(solveFatigueEngine(config));
  };

  return (
    <DashboardLayout title="Fatigue Assessment">
      <CalculatorLayout
        title="Fatigue Life Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fatigue loading</h2>
              <p className="mt-2 text-sm text-slate-600">Quickly estimate safe alternating stress and life potential.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Alternating stress (MPa)
              <input
                type="number"
                value={alternatingStress}
                onChange={(event) => setAlternatingStress(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Mean stress (MPa)
              <input
                type="number"
                value={meanStress}
                onChange={(event) => setMeanStress(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Ultimate strength (MPa)
              <input
                type="number"
                value={ultimateStrength}
                onChange={(event) => setUltimateStrength(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Endurance limit (MPa)
              <input
                type="number"
                value={enduranceLimit}
                onChange={(event) => setEnduranceLimit(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate fatigue
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Fatigue overview</h2>
            <p className="mt-4 leading-7">
              This tool evaluates a simple Goodman-style fatigue criterion and estimates allowable alternating stress for a cyclic loading condition.
            </p>
          </div>
        }
        right={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Results</h2>
            {!result ? (
              <p className="mt-4 text-sm text-slate-500">Enter loading and material values, then run the calculation.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Allowable alternating stress</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.allowableStress.toFixed(1)} MPa</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Predicted life</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.predictedCycles.toLocaleString()} cycles</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Safety factor</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.safetyFactor.toFixed(2)}</div>
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
