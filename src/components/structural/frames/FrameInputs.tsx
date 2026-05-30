"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import MeshControls from "@/components/shared/MeshControls";

type Props = {
  span: number;
  setSpan: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  segments: number;
  setSegments: (value: number) => void;
  area: number;
  setArea: (value: number) => void;
  I: number;
  setI: (value: number) => void;
  E: number;
  setE: (value: number) => void;
  load: number;
  setLoad: (value: number) => void;
  spanUnit: string;
  setSpanUnit: (value: string) => void;
  heightUnit: string;
  setHeightUnit: (value: string) => void;
  areaUnit: string;
  setAreaUnit: (value: string) => void;
  inertiaUnit: string;
  setInertiaUnit: (value: string) => void;
  loadUnit: string;
  setLoadUnit: (value: string) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  onCalculate: () => void;
};

export default function FrameInputs({
  span,
  setSpan,
  height,
  setHeight,
  segments,
  setSegments,
  area,
  setArea,
  I,
  setI,
  E,
  setE,
  load,
  setLoad,
  spanUnit,
  setSpanUnit,
  heightUnit,
  setHeightUnit,
  areaUnit,
  setAreaUnit,
  inertiaUnit,
  setInertiaUnit,
  loadUnit,
  setLoadUnit,
  EUnit,
  setEUnit,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Frame geometry</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define the portal frame geometry, beam properties, and the point load for analysis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Span</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={span}
              min={0.5}
              step={0.1}
              onChange={(e) => setSpan(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={spanUnit}
              onChange={setSpanUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Height</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={height}
              min={0.5}
              step={0.1}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="length"
              value={heightUnit}
              onChange={setHeightUnit}
              label=""
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Axial area</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={area}
              min={1e-6}
              step={1e-5}
              onChange={(e) => setArea(Number(e.target.value))}
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

        <div className="space-y-3">
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

        <div className="space-y-3">
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

        <div className="space-y-3 col-span-full">
          <label className="block text-sm font-medium text-slate-700">Midspan downward load</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={load}
              min={0}
              step={100}
              onChange={(e) => setLoad(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              dimension="force"
              value={loadUnit}
              onChange={setLoadUnit}
              label=""
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={segments} onChangeElements={setSegments} refine />
      </div>

      <button
        onClick={onCalculate}
        className="w-full rounded bg-slate-900 px-4 py-3 text-white font-semibold hover:bg-slate-800 transition"
      >
        Run frame analysis
      </button>
    </div>
  );
}
