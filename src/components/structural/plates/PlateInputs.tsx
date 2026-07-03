"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Length"
          value={length}
          onChange={setLength}
          unit={
            <ModuleUnitSelect moduleId="plates" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Width"
          value={width}
          onChange={setWidth}
          unit={
            <ModuleUnitSelect moduleId="plates" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          unit={
            <ModuleUnitSelect moduleId="plates" fieldKey="thickness" value={thicknessUnit} onChange={setThicknessUnit} />
          }
        />
        <CalculatorUnitField
          label="Pressure load"
          value={pressure}
          onChange={setPressure}
          unit={
            <ModuleUnitSelect moduleId="plates" fieldKey="pressure" value={pressureUnit} onChange={setPressureUnit} />
          }
        />
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          unit={<ModuleUnitSelect moduleId="plates" fieldKey="stress" value={EUnit} onChange={setEUnit} />}
        />
        <CalculatorNumberField
          label="Poisson's ratio"
          value={nu}
          onChange={setNu}
          min={0}
          max={0.49}
          step={0.01}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <MeshControls elements={meshSegments} onChangeElements={setMeshSegments} refine />
      </div>

      <label className="space-y-2">
        <span className={calculatorFieldLabelClass}>Support condition</span>
        <select
          value={boundaryType}
          onChange={(e) => setBoundaryType(e.target.value as BoundaryType)}
          className={calculatorSelectClass}
        >
          <option value="clamped">Clamped edges</option>
          <option value="simply_supported">Simply supported edges</option>
        </select>
      </label>
    </CalculatorInputPanel>
  );
}
