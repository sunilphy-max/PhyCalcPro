"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";
import MeshControls from "@/components/shared/MeshControls";

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

export default function PressureVesselInputs({
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
    <CalculatorInputPanel
      title="Pressure vessel"
      description="Thin and thick wall vessel design screening."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run vessel FEM" designAware />}
    >
<div className={`${calculatorInputGridClass}`}>
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
          <label className="block text-sm font-medium text-slate-700">Cylinder length</label>
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

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 sm:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
          <MeshControls elements={segments} onChangeElements={setSegments} refine />
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

