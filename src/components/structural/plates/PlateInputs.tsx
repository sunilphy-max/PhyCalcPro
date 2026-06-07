"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
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
  meshSegments: number;
  setMeshSegments: (value: number) => void;
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
  meshSegments,
  setMeshSegments,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Plate bending"
      description="Thin plate bending and stress analysis."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run plate FEM" designAware />}
    >
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
            <ModuleUnitSelect
              moduleId="plates"
              fieldKey="length"
              value={lengthUnit}
              onChange={setLengthUnit}
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
            <ModuleUnitSelect
              moduleId="plates"
              fieldKey="length"
              value={lengthUnit}
              onChange={setLengthUnit}
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
            <ModuleUnitSelect
              moduleId="plates"
              fieldKey="thickness"
              value={thicknessUnit}
              onChange={setThicknessUnit}
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
            <ModuleUnitSelect
              moduleId="plates"
              fieldKey="pressure"
              value={pressureUnit}
              onChange={setPressureUnit}
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
            <ModuleUnitSelect
              moduleId="plates"
              fieldKey="stress"
              value={EUnit}
              onChange={setEUnit}
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={meshSegments} onChangeElements={setMeshSegments} refine />
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
    </CalculatorInputPanel>
  );
}

