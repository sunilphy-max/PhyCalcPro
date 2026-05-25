"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { solveLoadCaseManagerEngine } from "@/lib/structural/loadCaseManager/engine";
import type {
  LoadCase,
  LoadCaseManagerConfig,
  LoadCaseManagerResult,
} from "@/lib/structural/loadCaseManager/types";

export default function Page() {
  const [cases, setCases] = useState<LoadCase[]>([
    { name: "Case 1", axialForce: 50000, bendingMoment: 60000, shearForce: 12000 },
    { name: "Case 2", axialForce: 30000, bendingMoment: 90000, shearForce: 15000 },
    { name: "Case 3", axialForce: 75000, bendingMoment: 45000, shearForce: 10000 },
  ]);
  const [width, setWidth] = useState(0.2);
  const [height, setHeight] = useState(0.25);
  const [yieldStrength, setYieldStrength] = useState(250);
  const [result, setResult] = useState<LoadCaseManagerResult | null>(null);

  const updateCase = (index: number, key: keyof LoadCase, value: number | string) => {
    setCases((current) =>
      current.map((loadCase, idx) =>
        idx === index
          ? { ...loadCase, [key]: typeof value === "string" ? value : Number(value) }
          : loadCase
      )
    );
  };

  const calculate = () => {
    const config: LoadCaseManagerConfig = { cases, width, height, yieldStrength };
    setResult(solveLoadCaseManagerEngine(config));
  };

  return (
    <DashboardLayout title="Load Case Manager">
      <CalculatorLayout
        title="Load Case Envelope Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Load cases</h2>
              <p className="mt-2 text-sm text-slate-600">Review multiple scenarios together and compute peak envelope results.</p>
            </div>
            {cases.map((loadCase, index) => (
              <div key={loadCase.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">{loadCase.name}</div>
                <label className="mt-3 block text-sm text-slate-700">
                  Axial force (N)
                  <input
                    type="number"
                    value={loadCase.axialForce}
                    onChange={(event) => updateCase(index, "axialForce", Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                  />
                </label>
                <label className="mt-3 block text-sm text-slate-700">
                  Bending moment (N·m)
                  <input
                    type="number"
                    value={loadCase.bendingMoment}
                    onChange={(event) => updateCase(index, "bendingMoment", Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                  />
                </label>
                <label className="mt-3 block text-sm text-slate-700">
                  Shear force (N)
                  <input
                    type="number"
                    value={loadCase.shearForce}
                    onChange={(event) => updateCase(index, "shearForce", Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                  />
                </label>
              </div>
            ))}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Section data</div>
              <label className="mt-3 block text-sm text-slate-700">
                Width (m)
                <input
                  type="number"
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                />
              </label>
              <label className="mt-3 block text-sm text-slate-700">
                Height (m)
                <input
                  type="number"
                  value={height}
                  onChange={(event) => setHeight(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                />
              </label>
              <label className="mt-3 block text-sm text-slate-700">
                Yield strength (MPa)
                <input
                  type="number"
                  value={yieldStrength}
                  onChange={(event) => setYieldStrength(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Compute load envelope
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Envelope summary</h2>
            <p className="mt-4 leading-7">
              This module computes the peak axial, bending and shear values across all cases, then produces a combined stress envelope for a rectangular section.
            </p>
          </div>
        }
        right={
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Results</h2>
            {!result ? (
              <p className="mt-4 text-sm text-slate-500">Run the calculation to see envelope stresses and safety factor.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Envelope axial force</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.envelopeAxial.toFixed(0)} N</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Envelope bending moment</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.envelopeMoment.toFixed(0)} N·m</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Combined stress</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{result.combinedStress.toFixed(1)} MPa</div>
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
