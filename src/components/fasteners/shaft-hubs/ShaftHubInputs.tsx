"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  shaftDiameter: number;
  setShaftDiameter: Dispatch<SetStateAction<number>>;
  hubOuterDiameter: number;
  setHubOuterDiameter: Dispatch<SetStateAction<number>>;
  hubLength: number;
  setHubLength: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  interference: number;
  setInterference: Dispatch<SetStateAction<number>>;
  interferenceUnit: string;
  setInterferenceUnit: Dispatch<SetStateAction<string>>;
  frictionCoeff: number;
  setFrictionCoeff: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function ShaftHubInputs({
  shaftDiameter,
  setShaftDiameter,
  hubOuterDiameter,
  setHubOuterDiameter,
  hubLength,
  setHubLength,
  lengthUnit,
  setLengthUnit,
  interference,
  setInterference,
  interferenceUnit,
  setInterferenceUnit,
  frictionCoeff,
  setFrictionCoeff,
  modulus,
  setModulus,
  stressUnit,
  setStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Shaft hub fit"
      description="Estimate contact pressure, friction torque and assembly force for an interference fit."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate fit" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Shaft diameter"
          value={shaftDiameter}
          onChange={setShaftDiameter}
          unit={
            <ModuleUnitSelect
              moduleId="shaft-hubs"
              fieldKey="shaftDiameter"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Hub outer diameter"
          value={hubOuterDiameter}
          onChange={setHubOuterDiameter}
          unit={
            <ModuleUnitSelect
              moduleId="shaft-hubs"
              fieldKey="hubOuterDiameter"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Hub length"
          value={hubLength}
          onChange={setHubLength}
          unit={
            <ModuleUnitSelect moduleId="shaft-hubs" fieldKey="hubLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Interference (diametral)"
          value={interference}
          onChange={setInterference}
          unit={
            <ModuleUnitSelect
              moduleId="shaft-hubs"
              fieldKey="interference"
              value={interferenceUnit}
              onChange={setInterferenceUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Elastic modulus"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="shaft-hubs" fieldKey="modulus" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Friction coefficient</span>
          <input
            type="number"
            step="0.01"
            min={0}
            value={frictionCoeff}
            onChange={(e) => setFrictionCoeff(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
