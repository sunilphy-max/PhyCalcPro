"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
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
            <ModuleUnitSelect
              moduleId="vibrations"
              fieldKey="length"
              value={lengthUnit}
              onChange={setLengthUnit}
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
            <ModuleUnitSelect
              moduleId="vibrations"
              fieldKey="modulus"
              value={EUnit}
              onChange={setEUnit}
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
            <ModuleUnitSelect
              moduleId="vibrations"
              fieldKey="density"
              value={rhoUnit}
              onChange={setRhoUnit}
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
            <ModuleUnitSelect
              moduleId="vibrations"
              fieldKey="area"
              value={areaUnit}
              onChange={setAreaUnit}
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
            <ModuleUnitSelect
              moduleId="vibrations"
              fieldKey="inertia"
              value={inertiaUnit}
              onChange={setInertiaUnit}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Damping ratio ζ</label>
          <input
            type="number"
            min={0}
            max={0.5}
            step={0.01}
            value={dampingRatio}
            onChange={(e) => setDampingRatio(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-500">Light damping (ζ ≈ 0.02–0.05) for damped natural frequency estimate.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 sm:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
          <MeshControls elements={segments} onChangeElements={setSegments} refine />
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

