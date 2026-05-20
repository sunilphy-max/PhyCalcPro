"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import type { SupportType } from "@/lib/dynamics/vibrations/types";

type Props = {
  length: number;
  setLength: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (value: string) => void;
  E: number;
  setE: (value: number) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  I: number;
  setI: (value: number) => void;
  inertiaUnit: string;
  setInertiaUnit: (value: string) => void;
  A: number;
  setA: (value: number) => void;
  areaUnit: string;
  setAreaUnit: (value: string) => void;
  rho: number;
  setRho: (value: number) => void;
  rhoUnit: string;
  setRhoUnit: (value: string) => void;
  segments: number;
  setSegments: (value: number) => void;
  support: SupportType;
  setSupport: (value: SupportType) => void;
  onCalculate: () => void;
};

export default function VibrationInputs({
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  E,
  setE,
  EUnit,
  setEUnit,
  I,
  setI,
  inertiaUnit,
  setInertiaUnit,
  A,
  setA,
  areaUnit,
  setAreaUnit,
  rho,
  setRho,
  rhoUnit,
  setRhoUnit,
  segments,
  setSegments,
  support,
  setSupport,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Vibration analysis</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define beam properties, support conditions, and mesh density for natural frequency analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Beam length</label>
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
          <label className="block text-sm font-medium text-slate-700">Support condition</label>
          <select
            value={support}
            onChange={(e) => setSupport(e.target.value as SupportType)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="simply_supported">Simply supported</option>
            <option value="cantilever">Cantilever</option>
            <option value="fixed_fixed">Fixed-fixed</option>
          </select>
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
          <label className="block text-sm font-medium text-slate-700">Density</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={rho}
              min={1}
              step={10}
              onChange={(e) => setRho(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="density"
              value={rhoUnit}
              onChange={setRhoUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Cross-sectional area</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={A}
              min={1e-6}
              step={1e-5}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="area"
              value={areaUnit}
              onChange={setAreaUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Moment of inertia</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={I}
              min={1e-10}
              step={1e-9}
              onChange={(e) => setI(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="inertia"
              value={inertiaUnit}
              onChange={setInertiaUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Mesh segments</label>
          <input
            type="number"
            value={segments}
            min={2}
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
        Run vibration analysis
      </button>
    </div>
  );
}
