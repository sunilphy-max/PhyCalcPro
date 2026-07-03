"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";
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
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Compute load envelope" designAware />}
    >
      {props.cases.map((loadCase, index) => (
        <div key={loadCase.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">{loadCase.name}</div>
          <div className={`${calculatorInputGridClass} mt-3`}>
            <CalculatorNumberField
              label="Axial force (N)"
              value={loadCase.axialForce}
              onChange={(v) => props.updateCase(index, "axialForce", v)}
            />
            <CalculatorNumberField
              label="Bending moment (N·m)"
              value={loadCase.bendingMoment}
              onChange={(v) => props.updateCase(index, "bendingMoment", v)}
            />
            <CalculatorNumberField
              label="Shear force (N)"
              value={loadCase.shearForce}
              onChange={(v) => props.updateCase(index, "shearForce", v)}
            />
          </div>
        </div>
      ))}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">Section data</div>
        <div className={`${calculatorInputGridClass} mt-3`}>
          <CalculatorUnitField
            label="Section width"
            value={props.width}
            onChange={props.setWidth}
            step={0.01}
            unit={
              <ModuleUnitSelect
                moduleId="load-case-manager"
                fieldKey="sectionWidth"
                value={props.widthUnit}
                onChange={props.setWidthUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Section height"
            value={props.height}
            onChange={props.setHeight}
            step={0.01}
            unit={
              <ModuleUnitSelect
                moduleId="load-case-manager"
                fieldKey="sectionHeight"
                value={props.heightUnit}
                onChange={props.setHeightUnit}
              />
            }
          />
          <CalculatorUnitField
            label="Yield strength"
            value={props.yieldStrength}
            onChange={props.setYieldStrength}
            unit={
              <ModuleUnitSelect
                moduleId="load-case-manager"
                fieldKey="yieldStrength"
                value={props.stressUnit}
                onChange={props.setStressUnit}
              />
            }
          />
        </div>
      </div>
    </CalculatorInputPanel>
  );
}
