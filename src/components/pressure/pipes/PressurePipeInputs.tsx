"use client";

import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  radius: number;
  setRadius: (value: number) => void;
  radiusUnit: string;
  setRadiusUnit: (value: string) => void;
  thickness: number;
  setThickness: (value: number) => void;
  thicknessUnit: string;
  setThicknessUnit: (value: string) => void;
  length: number;
  setLength: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (value: string) => void;
  pressure: number;
  setPressure: (value: number) => void;
  pressureUnit: string;
  setPressureUnit: (value: string) => void;
  E: number;
  setE: (value: number) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  segments: number;
  setSegments: (value: number) => void;
  onCalculate: () => void;
};

export default function PressurePipeInputs({
  radius,
  setRadius,
  radiusUnit,
  setRadiusUnit,
  thickness,
  setThickness,
  thicknessUnit,
  setThicknessUnit,
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  pressure,
  setPressure,
  pressureUnit,
  setPressureUnit,
  E,
  setE,
  EUnit,
  setEUnit,
  segments,
  setSegments,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Pressure pipe inputs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define a thin-walled pipe cross-section and internal pressure for FEM ring analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Radius</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={radius}
              min={0.01}
              step={0.01}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={radiusUnit}
              onChange={setRadiusUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Thickness</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={thickness}
              min={0.001}
              step={0.001}
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Axial length</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={length}
              min={0.1}
              step={0.1}
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Internal pressure</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={pressure}
              min={1}
              step={10}
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Young&apos;s modulus</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={E}
              min={1e8}
              step={1e8}
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Mesh segments</label>
          <input
            type="number"
            value={segments}
            min={8}
            max={120}
            onChange={(e) => setSegments(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full rounded bg-slate-900 px-4 py-3 text-white font-semibold hover:bg-slate-800 transition"
      >
        Run pipe stress analysis
      </button>
    </div>
  );
}
