"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  tolerances: number[];
  setTolerances: (values: number[]) => void;
  tolerancesY: number[];
  setTolerancesY: (values: number[]) => void;
  toleranceUnit: string;
  setToleranceUnit: (unit: string) => void;
  monteCarloSamples: number;
  setMonteCarloSamples: (n: number) => void;
  onCalculate: () => void;
};

export default function ToleranceInputs({
  tolerances,
  setTolerances,
  tolerancesY,
  setTolerancesY,
  toleranceUnit,
  setToleranceUnit,
  monteCarloSamples,
  setMonteCarloSamples,
  onCalculate,
}: Props) {
  const updateTolerance = (index: number, value: number, axis: "x" | "y") => {
    const next = axis === "x" ? [...tolerances] : [...tolerancesY];
    next[index] = value;
    if (axis === "x") setTolerances(next);
    else setTolerancesY(next);
  };

  const addBlock = (axis: "x" | "y") => {
    if (axis === "x") setTolerances([...tolerances, 0.01]);
    else setTolerancesY([...tolerancesY, 0.01]);
  };

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Tolerance Stackup</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter tolerance blocks for X and optional Y chains; worst-case, RSS, and Monte Carlo.
        </p>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-800">X-axis tolerances</h4>
        {tolerances.map((value, index) => (
          <label key={`x-${index}`} className="space-y-1 text-sm text-slate-600 block">
            Block {index + 1}
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => updateTolerance(index, Number(e.target.value), "x")}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
        ))}
        <button type="button" onClick={() => addBlock("x")} className="text-sm text-blue-600 hover:underline">
          + Add X block
        </button>
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-800">Y-axis tolerances (optional)</h4>
        {tolerancesY.length === 0 ? (
          <p className="text-sm text-slate-500">No Y blocks — add for 2D stackup.</p>
        ) : (
          tolerancesY.map((value, index) => (
            <label key={`y-${index}`} className="space-y-1 text-sm text-slate-600 block">
              Y block {index + 1}
              <input
                type="number"
                step="any"
                value={value}
                onChange={(e) => updateTolerance(index, Number(e.target.value), "y")}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
          ))
        )}
        <button type="button" onClick={() => addBlock("y")} className="text-sm text-blue-600 hover:underline">
          + Add Y block
        </button>
      </section>

      <label className="space-y-1 text-sm text-slate-600 block">
        Monte Carlo samples (0 = skip)
        <input
          type="number"
          min={0}
          max={100000}
          step={100}
          value={monteCarloSamples}
          onChange={(e) => setMonteCarloSamples(Number(e.target.value))}
          className={calculatorNumberInputClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <UnitSelector dimension="length" value={toleranceUnit} onChange={setToleranceUnit} label="Tolerance units" />
        <button type="button" onClick={onCalculate} className="rounded bg-slate-900 px-4 py-3 text-white hover:bg-slate-800">
          Compute Stackup
        </button>
      </div>
    </div>
  );
}
