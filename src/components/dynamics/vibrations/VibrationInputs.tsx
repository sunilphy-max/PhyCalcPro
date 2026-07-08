"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
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
  dampingRatio: number;
  setDampingRatio: (value: number) => void;
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
  dampingRatio,
  setDampingRatio,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Vibration analysis"
      description="Natural frequency and resonance screening."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Run vibration analysis" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Beam length"
          value={length}
          onChange={setLength}
          min={0.1}
          step={0.1}
          unit={
            <ModuleUnitSelect moduleId="vibrations" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Support condition</span>
          <select
            value={support}
            onChange={(e) => setSupport(e.target.value as SupportType)}
            className={calculatorSelectClass}
          >
            <option value="simply_supported">Simply supported</option>
            <option value="cantilever">Cantilever</option>
            <option value="fixed_fixed">Fixed-fixed</option>
          </select>
        </label>
        <CalculatorUnitField
          label="Young's modulus"
          value={E}
          onChange={setE}
          min={1e8}
          step={1e8}
          unit={<ModuleUnitSelect moduleId="vibrations" fieldKey="modulus" value={EUnit} onChange={setEUnit} />}
        />
        <CalculatorUnitField
          label="Density"
          value={rho}
          onChange={setRho}
          min={1}
          step={10}
          unit={<ModuleUnitSelect moduleId="vibrations" fieldKey="density" value={rhoUnit} onChange={setRhoUnit} />}
        />
        <CalculatorUnitField
          label="Cross-sectional area"
          value={A}
          onChange={setA}
          min={1e-6}
          step={1e-5}
          unit={<ModuleUnitSelect moduleId="vibrations" fieldKey="area" value={areaUnit} onChange={setAreaUnit} />}
        />
        <CalculatorUnitField
          label="Moment of inertia"
          value={I}
          onChange={setI}
          min={1e-10}
          step={1e-9}
          unit={
            <ModuleUnitSelect moduleId="vibrations" fieldKey="inertia" value={inertiaUnit} onChange={setInertiaUnit} />
          }
        />
        <CalculatorNumberField
          label="Damping ratio ζ"
          value={dampingRatio}
          onChange={setDampingRatio}
          min={0}
          max={0.5}
          step={0.01}
        />
        <p className="text-xs text-slate-500">
          Light damping (ζ ≈ 0.02–0.05) for damped natural frequency estimate.
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
          <MeshControls elements={segments} onChangeElements={setSegments} refine />
        </div>
      </div>
    </CalculatorInputPanel>
  );
}
