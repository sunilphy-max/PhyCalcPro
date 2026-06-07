"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  frictionCoeff: number;
  setFrictionCoeff: Dispatch<SetStateAction<number>>;
  outerRadius: number;
  setOuterRadius: Dispatch<SetStateAction<number>>;
  innerRadius: number;
  setInnerRadius: Dispatch<SetStateAction<number>>;
  actuationForce: number;
  setActuationForce: Dispatch<SetStateAction<number>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  engagementTime: number;
  setEngagementTime: Dispatch<SetStateAction<number>>;
  safetyFactorTarget: number;
  setSafetyFactorTarget: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  forceUnit: string;
  setForceUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function BrakesClutchesInputs({
  frictionCoeff,
  setFrictionCoeff,
  outerRadius,
  setOuterRadius,
  innerRadius,
  setInnerRadius,
  actuationForce,
  setActuationForce,
  speed,
  setSpeed,
  engagementTime,
  setEngagementTime,
  safetyFactorTarget,
  setSafetyFactorTarget,
  lengthUnit,
  setLengthUnit,
  forceUnit,
  setForceUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Brake / clutch"
      description="Estimate friction torque, power dissipation, stop energy and indicative safety factor."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate brake" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Friction coefficient</span>
          <input
            type="number"
            step="0.01"
            value={frictionCoeff}
            onChange={(e) => setFrictionCoeff(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Outer radius"
          value={outerRadius}
          onChange={setOuterRadius}
          unit={
            <ModuleUnitSelect
              moduleId="brakes-clutches"
              fieldKey="outerRadius"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Inner radius"
          value={innerRadius}
          onChange={setInnerRadius}
          unit={
            <ModuleUnitSelect
              moduleId="brakes-clutches"
              fieldKey="innerRadius"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Actuation force"
          value={actuationForce}
          onChange={setActuationForce}
          unit={
            <ModuleUnitSelect moduleId="brakes-clutches" fieldKey="force" value={forceUnit} onChange={setForceUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Sliding speed (rpm)</span>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Engagement time (s)</span>
          <input
            type="number"
            step="0.1"
            value={engagementTime}
            onChange={(e) => setEngagementTime(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
          <span>Target safety factor</span>
          <input
            type="number"
            step="0.1"
            value={safetyFactorTarget}
            onChange={(e) => setSafetyFactorTarget(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
