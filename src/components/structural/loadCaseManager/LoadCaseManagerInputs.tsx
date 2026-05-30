"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";
import type { LoadCase } from "@/lib/structural/loadCaseManager/types";

type Props = {
  cases: LoadCase[];
  updateCase: (index: number, key: keyof LoadCase, value: number | string) => void;
  width: number;
  setWidth: (v: number) => void;
  widthUnit: string;
  setWidthUnit: (u: string) => void;
  height: number;
  setHeight: (v: number) => void;
  heightUnit: string;
  setHeightUnit: (u: string) => void;
  yieldStrength: number;
  setYieldStrength: (v: number) => void;
  stressUnit: string;
  setStressUnit: (u: string) => void;
  onCalculate: () => void;
};

export default function LoadCaseManagerInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Load cases"
      description="Review multiple scenarios and compute peak envelope results."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Compute load envelope" />}
    >
      {props.cases.map((loadCase, index) => (
        <div key={loadCase.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">{loadCase.name}</div>
          <label className="mt-3 block text-sm text-slate-700">
            Axial force (N)
            <input
              type="number"
              value={loadCase.axialForce}
              onChange={(e) => props.updateCase(index, "axialForce", Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </label>
          <label className="mt-3 block text-sm text-slate-700">
            Bending moment (N·m)
            <input
              type="number"
              value={loadCase.bendingMoment}
              onChange={(e) => props.updateCase(index, "bendingMoment", Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </label>
          <label className="mt-3 block text-sm text-slate-700">
            Shear force (N)
            <input
              type="number"
              value={loadCase.shearForce}
              onChange={(e) => props.updateCase(index, "shearForce", Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
            />
          </label>
        </div>
      ))}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">Section data</div>
        <ModuleUnitField moduleId="load-case-manager" fieldKey="sectionWidth" value={props.width} unit={props.widthUnit} onValueChange={props.setWidth} onUnitChange={props.setWidthUnit} step="0.01" />
        <ModuleUnitField moduleId="load-case-manager" fieldKey="sectionHeight" value={props.height} unit={props.heightUnit} onValueChange={props.setHeight} onUnitChange={props.setHeightUnit} step="0.01" />
        <ModuleUnitField moduleId="load-case-manager" fieldKey="yieldStrength" value={props.yieldStrength} unit={props.stressUnit} onValueChange={props.setYieldStrength} onUnitChange={props.setStressUnit} />
      </div>
    </CalculatorInputPanel>
  );
}
