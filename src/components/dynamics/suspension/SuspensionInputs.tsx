"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Sprung mass"
          value={props.sprungMass}
          onChange={props.setSprungMass}
          unit={
            <ModuleUnitSelect
              moduleId="suspension"
              fieldKey="sprungMass"
              value={props.massUnit}
              onChange={props.setMassUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Track width"
          value={props.trackWidth}
          onChange={props.setTrackWidth}
          step={0.01}
          unit={
            <ModuleUnitSelect
              moduleId="suspension"
              fieldKey="trackWidth"
              value={props.trackUnit}
              onChange={props.setTrackUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Roll stiffness"
          value={props.rollStiffness}
          onChange={props.setRollStiffness}
          unit={
            <ModuleUnitSelect
              moduleId="suspension"
              fieldKey="rollStiffness"
              value={props.stiffnessUnit}
              onChange={props.setStiffnessUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Wheelbase"
          value={props.wheelbase}
          onChange={props.setWheelbase}
          step={0.01}
          unit={
            <ModuleUnitSelect
              moduleId="suspension"
              fieldKey="wheelbase"
              value={props.wheelbaseUnit}
              onChange={props.setWheelbaseUnit}
            />
          }
        />
        <CalculatorNumberField
          label="Lateral acceleration (g)"
          value={props.lateralAcceleration}
          onChange={props.setLateralAcceleration}
          step={0.01}
        />
        <CalculatorUnitField
          label="CG height"
          value={props.cgHeight}
          onChange={props.setCgHeight}
          step={0.01}
          unit={
            <ModuleUnitSelect
              moduleId="suspension"
              fieldKey="cgHeight"
              value={props.heightUnit}
              onChange={props.setHeightUnit}
            />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
