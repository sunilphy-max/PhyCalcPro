"use client";

import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  tolerances: number[];
  setTolerances: (values: number[]) => void;
  toleranceUnit: string;
  setToleranceUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function ToleranceInputs({
  tolerances,
  setTolerances,
  toleranceUnit,
  setToleranceUnit,
  onCalculate,
}: Props) {
  const updateTolerance = (index: number, value: number) => {
    const next = [...tolerances];
    next[index] = value;
    setTolerances(next);
  };

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Tolerance Stackup</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter tolerance blocks to compute worst-case and RSS stackup.
        </p>
      </div>

      <div className="grid gap-4">
        {tolerances.map((value, index) => (
          <label key={index} className="space-y-1 text-sm text-slate-600">
            Tolerance {index + 1}
            <input
              type="number"
              value={value}
              onChange={(e) => updateTolerance(index, Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <UnitSelector
          dimension="length"
          value={toleranceUnit}
          onChange={setToleranceUnit}
          label="Tolerance units"
        />
        <button
          type="button"
          onClick={onCalculate}
          className="rounded bg-slate-900 px-4 py-3 text-white hover:bg-slate-800"
        >
          Compute Stackup
        </button>
      </div>
    </div>
  );
}
