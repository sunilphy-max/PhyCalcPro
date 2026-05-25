"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import type {
  CombinedLoadingConfig,
  CombinedLoadingResult,
} from "@/lib/structural/combinedLoading/types";

export default function Page() {
  const [axialForce, setAxialForce] = useState(120000);
  const [bendingMoment, setBendingMoment] = useState(85000);
  const [torque, setTorque] = useState(18000);
  const [shearForce, setShearForce] = useState(15000);
  const [width, setWidth] = useState(0.18);
  const [height, setHeight] = useState(0.27);
  const [yieldStrength, setYieldStrength] = useState(250);
  const [result, setResult] = useState<CombinedLoadingResult | null>(null);

  const calculate = () => {
    const config: CombinedLoadingConfig = {
      axialForce,
      bendingMoment,
      torque,
      shearForce,
      width,
      height,
      yieldStrength,
    };
    setResult(solveCombinedLoadingEngine(config));
  };

  return (
    <DashboardLayout title="Combined Loading">
      <CalculatorLayout
        title="Combined Loading Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Loading inputs</h2>
              <p className="mt-2 text-sm text-slate-600">Combine different load types for a unified stress check.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Axial force (N)
              <input
                type="number"
                value={axialForce}
                onChange={(event) => setAxialForce(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Bending moment (N·m)
              <input
                type="number"
                value={bendingMoment}
                onChange={(event) => setBendingMoment(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Torsion (N·m)
              <input
                type="number"
                value={torque}
                onChange={(event) => setTorque(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Shear force (N)
              <input
                type="number"
                value={shearForce}
                onChange={(event) => setShearForce(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Section width (m)
              <input
                type="number"
                step="0.01"
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Section height (m)
              <input
                type="number"
                step="0.01"
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Yield strength (MPa)
              <input
                type="number"
                value={yieldStrength}
                onChange={(event) => setYieldStrength(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate combined stress
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Combined loading overview</h2>
            <p className="mt-4 leading-7">
              This calculator combines axial, bending, torsion, and shear loads into a von Mises-style stress check for a rectangular cross-section.
            </p>
          </div>
        }
        right={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Results</h2>
            {!result ? (
              <p className="mt-4 text-sm text-slate-500">Run the calculation to review combined stresses and safety factor.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Von Mises stress</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.vonMisesStress.toFixed(1)} MPa</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Safety factor</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.safetyFactor.toFixed(2)}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Axial stress</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{result.axialStress.toFixed(1)} MPa</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Bending stress</div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{result.bendingStress.toFixed(1)} MPa</div>
                  </div>
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
