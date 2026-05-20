"use client";

import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  span: number;
  setSpan: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  panels: number;
  setPanels: (value: number) => void;
  area: number;
  setArea: (value: number) => void;
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
  loadUnit: string;
  setLoadUnit: (value: string) => void;
  EUnit: string;
  setEUnit: (value: string) => void;
  onCalculate: () => void;
};

export default function TrussInputs({
  span,
  setSpan,
  height,
  setHeight,
  panels,
  setPanels,
  area,
  setArea,
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
  loadUnit,
  setLoadUnit,
  EUnit,
  setEUnit,
  onCalculate,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Truss geometry</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define span, height, panel count, and material properties for the truss.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Span</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={span}
              min={0.1}
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
              min={0.1}
              step={0.05}
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
          <label className="block text-sm font-medium text-slate-700">Panel count</label>
          <input
            type="number"
            min={2}
            max={20}
            value={panels}
            onChange={(e) => setPanels(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Axial area</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={area}
              min={1e-6}
              step={1e-6}
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
          <label className="block text-sm font-medium text-slate-700">Young&apos;s modulus</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={E}
              min={1e6}
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

      <button
        onClick={onCalculate}
        className="w-full rounded bg-slate-900 px-4 py-3 text-white font-semibold hover:bg-slate-800 transition"
      >
        Analyze truss
      </button>
    </div>
  );
}
