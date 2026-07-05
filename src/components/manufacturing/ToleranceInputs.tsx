"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  tolerances: number[];
  setTolerances: (values: number[]) => void;
  tolerancesY: number[];
  setTolerancesY: (values: number[]) => void;
  tolerancesZ: number[];
  setTolerancesZ: (values: number[]) => void;
  toleranceUnit: string;
  setToleranceUnit: (unit: string) => void;
  monteCarloSamples: number;
  setMonteCarloSamples: (n: number) => void;
  onCalculate: () => void;
};

function ToleranceAxisSection({
  axis,
  tolerances,
  onUpdate,
  onAdd,
}: {
  axis: "X" | "Y" | "Z";
  tolerances: number[];
  onUpdate: (index: number, value: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">{axis}-axis tolerances</h4>
      {tolerances.length === 0 ? (
        <p className="text-sm text-slate-500">No {axis} blocks — add for {axis === "X" ? "1D" : axis === "Y" ? "2D" : "3D"} stackup.</p>
      ) : (
        tolerances.map((value, index) => (
          <label key={`${axis}-${index}`} className="space-y-1 text-sm text-slate-600 block">
            Block {index + 1}
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => onUpdate(index, Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
        ))
      )}
      <button type="button" onClick={onAdd} className="text-sm text-blue-600 hover:underline">
        + Add {axis} block
      </button>
    </section>
  );
}

export default function ToleranceInputs({
  tolerances,
  setTolerances,
  tolerancesY,
  setTolerancesY,
  tolerancesZ,
  setTolerancesZ,
  toleranceUnit,
  setToleranceUnit,
  monteCarloSamples,
  setMonteCarloSamples,
  onCalculate,
}: Props) {
  const updateTolerance = (index: number, value: number, axis: "x" | "y" | "z") => {
    const setter = axis === "x" ? setTolerances : axis === "y" ? setTolerancesY : setTolerancesZ;
    const current = axis === "x" ? tolerances : axis === "y" ? tolerancesY : tolerancesZ;
    const next = [...current];
    next[index] = value;
    setter(next);
  };

  const addBlock = (axis: "x" | "y" | "z") => {
    if (axis === "x") setTolerances([...tolerances, 0.01]);
    else if (axis === "y") setTolerancesY([...tolerancesY, 0.01]);
    else setTolerancesZ([...tolerancesZ, 0.01]);
  };

  return (
    <CalculatorInputPanel
      title="Tolerance stackup"
      description="Linear, 2D and 3D dimensional chains with worst-case, RSS and Monte Carlo."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Compute stackup" designAware />}
    >
      <ToleranceAxisSection
        axis="X"
        tolerances={tolerances}
        onUpdate={(i, v) => updateTolerance(i, v, "x")}
        onAdd={() => addBlock("x")}
      />

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <ToleranceAxisSection
          axis="Y"
          tolerances={tolerancesY}
          onUpdate={(i, v) => updateTolerance(i, v, "y")}
          onAdd={() => addBlock("y")}
        />
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <ToleranceAxisSection
          axis="Z"
          tolerances={tolerancesZ}
          onUpdate={(i, v) => updateTolerance(i, v, "z")}
          onAdd={() => addBlock("z")}
        />
      </section>

      <label className="space-y-1 text-sm text-slate-600 block">
        Monte Carlo samples (0 = skip; uses 3D vector magnitude when Y/Z present)
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

      <UnitSelector dimension="length" value={toleranceUnit} onChange={setToleranceUnit} label="Tolerance units" />
    </CalculatorInputPanel>
  );
}
