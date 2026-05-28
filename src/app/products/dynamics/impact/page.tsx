"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ExportableReport from "@/components/shared/ExportableReport";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import type { ImpactConfig, ImpactResult } from "@/lib/dynamics/impact/types";

export default function Page() {
  const [mass, setMass] = useState(60);
  const [velocityChange, setVelocityChange] = useState(8);
  const [impactDuration, setImpactDuration] = useState(50);
  const [crossSectionArea, setCrossSectionArea] = useState(100);
  const [yieldStrength, setYieldStrength] = useState(250);
  const [result, setResult] = useState<ImpactResult | null>(null);

  const calculate = () => {
    const config: ImpactConfig = {
      mass,
      velocityChange,
      impactDuration,
      crossSectionArea,
      yieldStrength,
    };
    setResult(solveImpactEngine(config));
  };

  return (
    <DashboardLayout title="Impact & Shock Analysis">
      <CalculatorLayout
        title="Impact Force Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Impact parameters</h2>
              <p className="mt-2 text-sm text-slate-600">Estimate average impact force and dynamic stress for a sudden loading event.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Mass (kg)
              <input
                type="number"
                value={mass}
                onChange={(event) => setMass(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Velocity change (m/s)
              <input
                type="number"
                value={velocityChange}
                onChange={(event) => setVelocityChange(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Impact duration (ms)
              <input
                type="number"
                value={impactDuration}
                onChange={(event) => setImpactDuration(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Cross-section area (cm²)
              <input
                type="number"
                value={crossSectionArea}
                onChange={(event) => setCrossSectionArea(Number(event.target.value))}
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
              Calculate impact results
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Shock overview</h2>
            <p className="mt-4 leading-7">
              Use this tool to convert a sudden change in momentum into an average impact force and translate the loading into a stress estimate for a given section.
            </p>
          </div>
        }
        right={
          <ExportableReport
            fileName="impact"
            title="Export Impact results"
            description="Export the current summary for review."
            csvRows={
              result
                ? [
                    { metric: "impulse", value: result.impulse },
                    { metric: "averageForce", value: result.averageForce },
                    { metric: "dynamicStress", value: result.dynamicStress },
                  ]
                : undefined
            }
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Results</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Run the analysis to see average impact force and dynamic stress.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Impulse</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.impulse.toFixed(1)} N·s</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Average force</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.averageForce.toFixed(1)} N</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Dynamic stress</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.dynamicStress.toFixed(1)} MPa</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Status</div>
                    <div className="mt-2 text-xl font-semibold">{result.designStatus}</div>
                  </div>
                </div>
              )}
            </div>
          </ExportableReport>
        }
      />
    </DashboardLayout>
  );
}
