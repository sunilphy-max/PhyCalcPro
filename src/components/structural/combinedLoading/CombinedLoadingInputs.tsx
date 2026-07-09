"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";
import { MaterialFormSection } from "@/components/materials/MaterialFormSection";

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
  material: string;
  onMaterialChange: (name: string) => void;
  onCalculate: () => void;
};

export default function CombinedLoadingInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Loading inputs"
      description="Combine axial, bending, torsion, and shear for a von Mises-style check."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate combined stress" designAware />}
    >
      <MaterialFormSection
        profile="structural"
        moduleId="combined-loading"
        material={props.material}
        onMaterialChange={props.onMaterialChange}
        yieldStrength={props.yieldStrength}
        setYieldStrength={props.setYieldStrength}
        stressUnit={props.stressUnit}
        setStressUnit={props.setStressUnit}
        yieldOnly
      />
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Axial force"
          value={props.axialForce}
          onChange={props.setAxialForce}
          unit={
            <ModuleUnitSelect
              moduleId="combined-loading"
              fieldKey="axialForce"
              value={props.axialUnit}
              onChange={props.setAxialUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Bending moment"
          value={props.bendingMoment}
          onChange={props.setBendingMoment}
          unit={
            <ModuleUnitSelect
              moduleId="combined-loading"
              fieldKey="bendingMoment"
              value={props.momentUnit}
              onChange={props.setMomentUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Torsion"
          value={props.torque}
          onChange={props.setTorque}
          unit={
            <ModuleUnitSelect
              moduleId="combined-loading"
              fieldKey="torque"
              value={props.torqueUnit}
              onChange={props.setTorqueUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Shear force"
          value={props.shearForce}
          onChange={props.setShearForce}
          unit={
            <ModuleUnitSelect
              moduleId="combined-loading"
              fieldKey="shearForce"
              value={props.shearUnit}
              onChange={props.setShearUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Section width"
          value={props.width}
          onChange={props.setWidth}
          step={0.01}
          unit={
            <ModuleUnitSelect
              moduleId="combined-loading"
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
              moduleId="combined-loading"
              fieldKey="sectionHeight"
              value={props.heightUnit}
              onChange={props.setHeightUnit}
            />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
