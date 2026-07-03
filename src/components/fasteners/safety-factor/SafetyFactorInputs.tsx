"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
        <CalculatorUnitField
          label="Diameter"
          value={diameter}
          onChange={setDiameter}
          min={0}
          step={0.001}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="diameter" value={diameterUnit} onChange={setDiameterUnit} />
          }
        />
        <CalculatorUnitField
          label="Bending moment"
          value={bendingMoment}
          onChange={setBendingMoment}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="moment" value={bendingMomentUnit} onChange={setBendingMomentUnit} />
          }
        />
        <CalculatorUnitField
          label="Axial force"
          value={axialForce}
          onChange={setAxialForce}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="force" value={axialForceUnit} onChange={setAxialForceUnit} />
          }
        />
        <CalculatorUnitField
          label="Shear force"
          value={shearForce}
          onChange={setShearForce}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="force" value={shearForceUnit} onChange={setShearForceUnit} />
          }
        />
        <CalculatorUnitField
          label="Torsion"
          value={torque}
          onChange={setTorque}
          unit={<ModuleUnitSelect moduleId="shafts" fieldKey="torque" value={torqueUnit} onChange={setTorqueUnit} />}
        />
        <CalculatorUnitField
          label="Yield strength"
          value={yieldStrength}
          onChange={setYieldStrength}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <CalculatorUnitField
          label="Ultimate strength"
          value={ultimateStrength}
          onChange={setUltimateStrength}
          unit={
            <ModuleUnitSelect moduleId="shafts" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
