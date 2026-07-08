"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
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
    <CalculatorInputPanel
      title="Pipe stress"
      description="Internal pressure and stress analysis for piping."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run pipe analysis" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Radius"
          value={radius}
          onChange={setRadius}
          min={0.01}
          step={0.01}
          unit={
            <ModuleUnitSelect moduleId="pipes" fieldKey="radius" value={radiusUnit} onChange={setRadiusUnit} />
          }
        />
        <CalculatorUnitField
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          min={0.001}
          step={0.001}
          unit={
            <ModuleUnitSelect moduleId="pipes" fieldKey="thickness" value={thicknessUnit} onChange={setThicknessUnit} />
          }
        />
        <CalculatorUnitField
          label="Axial length"
          value={length}
          onChange={setLength}
          min={0.1}
          step={0.1}
          unit={
            <ModuleUnitSelect moduleId="pipes" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Internal pressure"
          value={pressure}
          onChange={setPressure}
          min={1}
          step={10}
          unit={
            <ModuleUnitSelect moduleId="pipes" fieldKey="pressure" value={pressureUnit} onChange={setPressureUnit} />
          }
        />
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e8}
          step={1e8}
          unit={<ModuleUnitSelect moduleId="pipes" fieldKey="E" value={EUnit} onChange={setEUnit} />}
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
          <MeshControls elements={segments} onChangeElements={setSegments} refine />
        </div>
      </div>
    </CalculatorInputPanel>
  );
}
