"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";

type Props = {
  axialForce: number;
  setAxialForce: (v: number) => void;
  axialUnit: string;
  setAxialUnit: (u: string) => void;
  bendingMoment: number;
  setBendingMoment: (v: number) => void;
  momentUnit: string;
  setMomentUnit: (u: string) => void;
  torque: number;
  setTorque: (v: number) => void;
  torqueUnit: string;
  setTorqueUnit: (u: string) => void;
  shearForce: number;
  setShearForce: (v: number) => void;
  shearUnit: string;
  setShearUnit: (u: string) => void;
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

export default function CombinedLoadingInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Loading inputs"
      description="Combine axial, bending, torsion, and shear for a von Mises-style check."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate combined stress" designAware />}
    >
      <ModuleUnitField moduleId="combined-loading" fieldKey="axialForce" value={props.axialForce} unit={props.axialUnit} onValueChange={props.setAxialForce} onUnitChange={props.setAxialUnit} />
      <ModuleUnitField moduleId="combined-loading" fieldKey="bendingMoment" value={props.bendingMoment} unit={props.momentUnit} onValueChange={props.setBendingMoment} onUnitChange={props.setMomentUnit} />
      <ModuleUnitField moduleId="combined-loading" fieldKey="torque" value={props.torque} unit={props.torqueUnit} onValueChange={props.setTorque} onUnitChange={props.setTorqueUnit} />
      <ModuleUnitField moduleId="combined-loading" fieldKey="shearForce" value={props.shearForce} unit={props.shearUnit} onValueChange={props.setShearForce} onUnitChange={props.setShearUnit} />
      <ModuleUnitField moduleId="combined-loading" fieldKey="sectionWidth" value={props.width} unit={props.widthUnit} onValueChange={props.setWidth} onUnitChange={props.setWidthUnit} step="0.01" />
      <ModuleUnitField moduleId="combined-loading" fieldKey="sectionHeight" value={props.height} unit={props.heightUnit} onValueChange={props.setHeight} onUnitChange={props.setHeightUnit} step="0.01" />
      <ModuleUnitField moduleId="combined-loading" fieldKey="yieldStrength" value={props.yieldStrength} unit={props.stressUnit} onValueChange={props.setYieldStrength} onUnitChange={props.setStressUnit} />
    </CalculatorInputPanel>
  );
}
