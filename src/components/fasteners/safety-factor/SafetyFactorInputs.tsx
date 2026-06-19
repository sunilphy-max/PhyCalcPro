"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

import type { Dispatch, SetStateAction } from "react";
import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  diameter: number;
  setDiameter: Dispatch<SetStateAction<number>>;
  diameterUnit: string;
  setDiameterUnit: Dispatch<SetStateAction<string>>;
  axialForce: number;
  setAxialForce: Dispatch<SetStateAction<number>>;
  axialForceUnit: string;
  setAxialForceUnit: Dispatch<SetStateAction<string>>;
  shearForce: number;
  setShearForce: Dispatch<SetStateAction<number>>;
  shearForceUnit: string;
  setShearForceUnit: Dispatch<SetStateAction<string>>;
  bendingMoment: number;
  setBendingMoment: Dispatch<SetStateAction<number>>;
  bendingMomentUnit: string;
  setBendingMomentUnit: Dispatch<SetStateAction<string>>;
  torque: number;
  setTorque: Dispatch<SetStateAction<number>>;
  torqueUnit: string;
  setTorqueUnit: Dispatch<SetStateAction<string>>;
  yieldStrength: number;
  setYieldStrength: Dispatch<SetStateAction<number>>;
  ultimateStrength: number;
  setUltimateStrength: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function SafetyFactorInputs({
  diameter,
  setDiameter,
  diameterUnit,
  setDiameterUnit,
  axialForce,
  setAxialForce,
  axialForceUnit,
  setAxialForceUnit,
  shearForce,
  setShearForce,
  shearForceUnit,
  setShearForceUnit,
  bendingMoment,
  setBendingMoment,
  bendingMomentUnit,
  setBendingMomentUnit,
  torque,
  setTorque,
  torqueUnit,
  setTorqueUnit,
  yieldStrength,
  setYieldStrength,
  ultimateStrength,
  setUltimateStrength,
  stressUnit,
  setStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Safety factor"
      description="Define geometry, forces, and material strength for the safety factor assessment."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate safety factor" designAware />}
    >
<div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Diameter</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={diameter}
              min={0}
              step={0.001}
              onChange={(event) => setDiameter(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={diameterUnit}
              onChange={setDiameterUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Bending moment</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={bendingMoment}
              onChange={(event) => setBendingMoment(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="moment"
              value={bendingMomentUnit}
              onChange={setBendingMomentUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Axial force</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={axialForce}
              onChange={(event) => setAxialForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="force"
              value={axialForceUnit}
              onChange={setAxialForceUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Shear force</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={shearForce}
              onChange={(event) => setShearForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="force"
              value={shearForceUnit}
              onChange={setShearForceUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Torsion</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={torque}
              onChange={(event) => setTorque(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="torque"
              value={torqueUnit}
              onChange={setTorqueUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Yield strength</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={yieldStrength}
              onChange={(event) => setYieldStrength(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Ultimate strength</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={ultimateStrength}
              onChange={(event) => setUltimateStrength(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={stressUnit}
              onChange={setStressUnit}
            />
          </div>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

