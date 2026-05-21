"use client";

import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  nominalSize: number;
  setNominalSize: (value: number) => void;
  nominalUnit: string;
  setNominalUnit: (unit: string) => void;
  holeUpper: number;
  setHoleUpper: (value: number) => void;
  holeLower: number;
  setHoleLower: (value: number) => void;
  shaftUpper: number;
  setShaftUpper: (value: number) => void;
  shaftLower: number;
  setShaftLower: (value: number) => void;
  toleranceUnit: string;
  setToleranceUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function FitInputs({
  nominalSize,
  setNominalSize,
  nominalUnit,
  setNominalUnit,
  holeUpper,
  setHoleUpper,
  holeLower,
  setHoleLower,
  shaftUpper,
  setShaftUpper,
  shaftLower,
  setShaftLower,
  toleranceUnit,
  setToleranceUnit,
  onCalculate,
}: Props) {
  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Fits & Clearances</h3>
        <p className="text-sm text-slate-500 mt-1">
          Enter a nominal size and tolerance deviations for hole and shaft.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm text-slate-600">
            Nominal size
            <input
              type="number"
              value={nominalSize}
              onChange={(e) => setNominalSize(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
          <UnitSelector
            dimension="length"
            value={nominalUnit}
            onChange={setNominalUnit}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
            <div className="font-semibold text-slate-900">Hole tolerance</div>
            <label className="text-sm text-slate-600 block">
              Upper deviation
              <input
                type="number"
                value={holeUpper}
                onChange={(e) => setHoleUpper(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 block">
              Lower deviation
              <input
                type="number"
                value={holeLower}
                onChange={(e) => setHoleLower(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 p-4 bg-slate-50">
            <div className="font-semibold text-slate-900">Shaft tolerance</div>
            <label className="text-sm text-slate-600 block">
              Upper deviation
              <input
                type="number"
                value={shaftUpper}
                onChange={(e) => setShaftUpper(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600 block">
              Lower deviation
              <input
                type="number"
                value={shaftLower}
                onChange={(e) => setShaftLower(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
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
            Calculate Fit
          </button>
        </div>
      </div>
    </div>
  );
}
