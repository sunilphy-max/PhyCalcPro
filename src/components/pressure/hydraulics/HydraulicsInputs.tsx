"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";

type Props = {
  boreDiameter: number;
  setBoreDiameter: (value: number) => void;
  rodDiameter: number;
  setRodDiameter: (value: number) => void;
  strokeLength: number;
  setStrokeLength: (value: number) => void;
  boreUnit: string;
  setBoreUnit: (unit: string) => void;
  strokeUnit: string;
  setStrokeUnit: (unit: string) => void;
  pressure: number;
  setPressure: (value: number) => void;
  pressureUnit: string;
  setPressureUnit: (unit: string) => void;
  forceGoal: number;
  setForceGoal: (value: number) => void;
  forceUnit: string;
  setForceUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function HydraulicsInputs({
  boreDiameter,
  setBoreDiameter,
  rodDiameter,
  setRodDiameter,
  strokeLength,
  setStrokeLength,
  boreUnit,
  setBoreUnit,
  strokeUnit,
  setStrokeUnit,
  pressure,
  setPressure,
  pressureUnit,
  setPressureUnit,
  forceGoal,
  setForceGoal,
  forceUnit,
  setForceUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Hydraulic cylinder"
      description="Analyze actuator forces and pressure loads."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate hydraulics" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Bore diameter"
          value={boreDiameter}
          onChange={setBoreDiameter}
          min={0}
          step={0.001}
          unit={
            <ModuleUnitSelect moduleId="hydraulics" fieldKey="diameter" value={boreUnit} onChange={setBoreUnit} />
          }
        />
        <CalculatorUnitField
          label="Rod diameter"
          value={rodDiameter}
          onChange={setRodDiameter}
          min={0}
          step={0.001}
          unit={
            <ModuleUnitSelect moduleId="hydraulics" fieldKey="diameter" value={boreUnit} onChange={setBoreUnit} />
          }
        />
        <CalculatorUnitField
          label="Stroke length"
          value={strokeLength}
          onChange={setStrokeLength}
          min={0}
          step={0.01}
          unit={
            <ModuleUnitSelect moduleId="hydraulics" fieldKey="diameter" value={strokeUnit} onChange={setStrokeUnit} />
          }
        />
        <CalculatorUnitField
          label="System pressure"
          value={pressure}
          onChange={setPressure}
          min={0}
          step={10000}
          unit={
            <ModuleUnitSelect
              moduleId="hydraulics"
              fieldKey="pressure"
              value={pressureUnit}
              onChange={setPressureUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Target force"
          value={forceGoal}
          onChange={setForceGoal}
          min={0}
          step={100}
          unit={
            <ModuleUnitSelect moduleId="hydraulics" fieldKey="force" value={forceUnit} onChange={setForceUnit} />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
