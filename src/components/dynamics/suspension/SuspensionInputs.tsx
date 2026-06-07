"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";

type Props = {
  sprungMass: number;
  setSprungMass: (v: number) => void;
  massUnit: string;
  setMassUnit: (u: string) => void;
  trackWidth: number;
  setTrackWidth: (v: number) => void;
  trackUnit: string;
  setTrackUnit: (u: string) => void;
  rollStiffness: number;
  setRollStiffness: (v: number) => void;
  stiffnessUnit: string;
  setStiffnessUnit: (u: string) => void;
  wheelbase: number;
  setWheelbase: (v: number) => void;
  wheelbaseUnit: string;
  setWheelbaseUnit: (u: string) => void;
  lateralAcceleration: number;
  setLateralAcceleration: (v: number) => void;
  cgHeight: number;
  setCgHeight: (v: number) => void;
  heightUnit: string;
  setHeightUnit: (u: string) => void;
  onCalculate: () => void;
};

export default function SuspensionInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Suspension inputs"
      description="Evaluate roll response and lateral load transfer."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Run suspension check" designAware />}
    >
      <ModuleUnitField moduleId="suspension" fieldKey="sprungMass" value={props.sprungMass} unit={props.massUnit} onValueChange={props.setSprungMass} onUnitChange={props.setMassUnit} />
      <ModuleUnitField moduleId="suspension" fieldKey="trackWidth" value={props.trackWidth} unit={props.trackUnit} onValueChange={props.setTrackWidth} onUnitChange={props.setTrackUnit} step="0.01" />
      <ModuleUnitField moduleId="suspension" fieldKey="rollStiffness" value={props.rollStiffness} unit={props.stiffnessUnit} onValueChange={props.setRollStiffness} onUnitChange={props.setStiffnessUnit} />
      <ModuleUnitField moduleId="suspension" fieldKey="wheelbase" value={props.wheelbase} unit={props.wheelbaseUnit} onValueChange={props.setWheelbase} onUnitChange={props.setWheelbaseUnit} step="0.01" />
      <label className="block text-sm text-slate-700">
        Lateral acceleration (g)
        <input
          type="number"
          step="0.01"
          value={props.lateralAcceleration}
          onChange={(e) => props.setLateralAcceleration(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
        />
      </label>
      <ModuleUnitField moduleId="suspension" fieldKey="cgHeight" value={props.cgHeight} unit={props.heightUnit} onValueChange={props.setCgHeight} onUnitChange={props.setHeightUnit} step="0.01" />
    </CalculatorInputPanel>
  );
}
