"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import type { BoundaryType } from "@/lib/structural/plates/types";

type Props = {
  length: number;
  setLength: (value: number) => void;
  width: number;
  setWidth: (value: number) => void;
  thickness: number;
  setThickness: (value: number) => void;
  pressure: number;
  setPressure: (value: number) => void;
  E: number;
  setE: (value: number) => void;
  nu: number;
  setNu: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (value: string) => void;
  thicknessUnit: string;
  setThicknessUnit: (value: string) => void;
  pressureUnit: string;
  setPressureUnit: (value: string) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  boundaryType: BoundaryType;
  setBoundaryType: (value: BoundaryType) => void;
  onCalculate: () => void;
};

export default function PlateInputs({
  length,
  setLength,
  width,
  setWidth,
  thickness,
  setThickness,
  pressure,
  setPressure,
  E,
  setE,
  nu,
  setNu,
  lengthUnit,
  setLengthUnit,
  thicknessUnit,
  setThicknessUnit,
  pressureUnit,
  setPressureUnit,
  EUnit,
  setEUnit,
  boundaryType,
  setBoundaryType,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plate parameters</h2>
        <p className="text-sm text-slate-500 mt-1">
          Set geometry, material, and loading before running the plate bending analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Length</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={lengthUnit}
              onChange={setLengthUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Width</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={lengthUnit}
              onChange={setLengthUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Thickness</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={thicknessUnit}
              onChange={setThicknessUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Pressure load</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="pressure"
              value={pressureUnit}
              onChange={setPressureUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Young&apos;s modulus</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={E}
              onChange={(e) => setE(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="stress"
              value={EUnit}
              onChange={setEUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Poisson&apos;s ratio</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="0.49"
            value={nu}
            onChange={(e) => setNu(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Support condition</label>
        <select
          value={boundaryType}
          onChange={(e) => setBoundaryType(e.target.value as BoundaryType)}
          className="w-full rounded border border-slate-300 px-3 py-2"
        >
          <option value="clamped">Clamped edges</option>
          <option value="simply_supported">Simply supported edges</option>
        </select>
      </div>

      <button
        onClick={onCalculate}
        className="w-full rounded bg-slate-900 px-4 py-3 text-white font-semibold hover:bg-slate-800 transition"
      >
        Run plate analysis
      </button>
    </div>
  );
}
