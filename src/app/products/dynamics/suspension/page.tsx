"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ExportableReport from "@/components/shared/ExportableReport";
import { solveSuspensionEngine } from "@/lib/dynamics/suspension/engine";
import type { SuspensionConfig, SuspensionResult } from "@/lib/dynamics/suspension/types";

export default function Page() {
  const [sprungMass, setSprungMass] = useState(1200);
  const [trackWidth, setTrackWidth] = useState(1.6);
  const [rollStiffness, setRollStiffness] = useState(55000);
  const [wheelbase, setWheelbase] = useState(2.8);
  const [lateralAcceleration, setLateralAcceleration] = useState(0.9);
  const [cgHeight, setCgHeight] = useState(0.45);
  const [result, setResult] = useState<SuspensionResult | null>(null);

  const calculate = () => {
    const config: SuspensionConfig = {
      sprungMass,
      trackWidth,
      rollStiffness,
      wheelbase,
      lateralAcceleration,
      cgHeight,
    };
    setResult(solveSuspensionEngine(config));
  };

  return (
    <DashboardLayout title="Suspension & Sway Analysis">
      <CalculatorLayout
        title="Suspension Stability Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Suspension inputs</h2>
              <p className="mt-2 text-sm text-slate-600">Evaluate roll response and lateral load transfer for a basic suspension model.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Sprung mass (kg)
              <input
                type="number"
                value={sprungMass}
                onChange={(event) => setSprungMass(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Track width (m)
              <input
                type="number"
                step="0.01"
                value={trackWidth}
                onChange={(event) => setTrackWidth(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Roll stiffness (N·m/rad)
              <input
                type="number"
                value={rollStiffness}
                onChange={(event) => setRollStiffness(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Wheelbase (m)
              <input
                type="number"
                step="0.01"
                value={wheelbase}
                onChange={(event) => setWheelbase(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Lateral acceleration (g)
              <input
                type="number"
                step="0.01"
                value={lateralAcceleration}
                onChange={(event) => setLateralAcceleration(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              CG height (m)
              <input
                type="number"
                step="0.01"
                value={cgHeight}
                onChange={(event) => setCgHeight(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Run suspension check
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Suspension overview</h2>
            <p className="mt-4 leading-7">
              This module uses a simple roll response model to estimate lateral force, roll moment, and body roll from cornering acceleration.
            </p>
          </div>
        }
        right={
          <ExportableReport
            fileName="suspension"
            title="Export Suspension results"
            description="Export the current summary for review."
            csvRows={
              result
                ? [
                    { metric: "lateralForce", value: result.lateralForce },
                    { metric: "rollMoment", value: result.rollMoment },
                    { metric: "rollAngleDegrees", value: result.rollAngleDegrees },
                  ]
                : undefined
            }
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Results</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Run the calculation to see roll angle and load transfer.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Lateral force</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.lateralForce.toFixed(1)} N</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Roll moment</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.rollMoment.toFixed(1)} N·m</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Roll angle</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.rollAngleDegrees.toFixed(2)}°</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-300">Stability</div>
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
