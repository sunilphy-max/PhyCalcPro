"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ExportableReport from "@/components/shared/ExportableReport";
import { solveTemperaturePropertiesEngine } from "@/lib/materials/temperatureProperties/engine";
import type {
  TemperaturePropertiesConfig,
  TemperaturePropertiesResult,
} from "@/lib/materials/temperatureProperties/types";

export default function Page() {
  const [baseYield, setBaseYield] = useState(250);
  const [baseModulus, setBaseModulus] = useState(210);
  const [coefficient, setCoefficient] = useState(12e-6);
  const [temperature, setTemperature] = useState(120);
  const [result, setResult] = useState<TemperaturePropertiesResult | null>(null);

  const calculate = () => {
    const config: TemperaturePropertiesConfig = {
      baseYield,
      baseModulus,
      coefficientThermalExpansion: coefficient,
      temperature,
    };
    setResult(solveTemperaturePropertiesEngine(config));
  };

  return (
    <DashboardLayout title="Temperature Properties">
      <CalculatorLayout
        title="Temperature Derating Calculator"
        left={
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Material inputs</h2>
              <p className="mt-2 text-sm text-slate-600">Estimate property reductions with temperature exposure.</p>
            </div>
            <label className="block text-sm text-slate-700">
              Yield strength (MPa)
              <input
                type="number"
                value={baseYield}
                onChange={(event) => setBaseYield(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Young&apos;s modulus (GPa)
              <input
                type="number"
                value={baseModulus}
                onChange={(event) => setBaseModulus(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Thermal expansion coefficient (/°C)
              <input
                type="number"
                step="0.000000001"
                value={coefficient}
                onChange={(event) => setCoefficient(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <label className="block text-sm text-slate-700">
              Operating temperature (°C)
              <input
                type="number"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              />
            </label>
            <button
              type="button"
              onClick={calculate}
              className="mt-4 w-full rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Calculate properties
            </button>
          </div>
        }
        center={
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-950">Temperature derating overview</h2>
            <p className="mt-4 leading-7">
              Use this calculator to estimate how yield strength and stiffness change with temperature. The model applies a conservative linear derating factor for elevated service temperatures.
            </p>
          </div>
        }
        right={
          <ExportableReport
            fileName="temperature-properties"
            title="Export Temperature Properties results"
            description="Export the current summary for review."
            csvRows={
              result
                ? [
                    { metric: "adjustedYield", value: result.adjustedYield },
                    { metric: "adjustedModulus", value: result.adjustedModulus },
                    { metric: "expansionPerMeter", value: result.expansionPerMeter },
                  ]
                : undefined
            }
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Results</h2>
              {!result ? (
                <p className="mt-4 text-sm text-slate-500">Run the calculation to see adjusted strength and expansion values.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Adjusted yield strength</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.adjustedYield.toFixed(1)} MPa</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Adjusted modulus</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.adjustedModulus.toFixed(1)} GPa</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Thermal expansion per meter</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{result.expansionPerMeter.toExponential(2)} /°C</div>
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
