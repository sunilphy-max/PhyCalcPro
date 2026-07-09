"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { MaterialFormSection } from "@/components/materials/MaterialFormSection";
import { calculatorInputGridClass } from "@/components/calculator/styles";

type Props = {
  outerDiameter: number;
  setOuterDiameter: Dispatch<SetStateAction<number>>;
  outerDiameterUnit: string;
  setOuterDiameterUnit: Dispatch<SetStateAction<string>>;
  thickness: number;
  setThickness: Dispatch<SetStateAction<number>>;
  thicknessUnit: string;
  setThicknessUnit: Dispatch<SetStateAction<string>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  faceWidthUnit: string;
  setFaceWidthUnit: Dispatch<SetStateAction<string>>;
  density: number;
  setDensity: Dispatch<SetStateAction<number>>;
  densityUnit: string;
  setDensityUnit: Dispatch<SetStateAction<string>>;
  rpm: number;
  setRpm: Dispatch<SetStateAction<number>>;
  yieldStress: number;
  setYieldStress: Dispatch<SetStateAction<number>>;
  yieldStressUnit: string;
  setYieldStressUnit: Dispatch<SetStateAction<string>>;
  material: string;
  onMaterialChange: (name: string) => void;
  onCalculate: () => void;
};

export default function FlywheelInputs({
  outerDiameter,
  setOuterDiameter,
  outerDiameterUnit,
  setOuterDiameterUnit,
  thickness,
  setThickness,
  thicknessUnit,
  setThicknessUnit,
  faceWidth,
  setFaceWidth,
  faceWidthUnit,
  setFaceWidthUnit,
  density,
  setDensity,
  densityUnit,
  setDensityUnit,
  rpm,
  setRpm,
  yieldStress,
  setYieldStress,
  yieldStressUnit,
  setYieldStressUnit,
  material,
  onMaterialChange,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Flywheel design"
      description="Energy storage and inertia design for rotating systems."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate flywheel" designAware />}
    >
      <MaterialFormSection
        profile="structural"
        moduleId="flywheels"
        material={material}
        onMaterialChange={onMaterialChange}
        yieldStrength={yieldStress}
        setYieldStrength={setYieldStress}
        stressUnit={yieldStressUnit}
        setStressUnit={setYieldStressUnit}
        yieldOnly
      />
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Outer diameter"
          value={outerDiameter}
          onChange={setOuterDiameter}
          unit={
            <ModuleUnitSelect moduleId="flywheels" fieldKey="radius" value={outerDiameterUnit} onChange={setOuterDiameterUnit} />
          }
        />
        <CalculatorUnitField
          label="Thickness"
          value={thickness}
          onChange={setThickness}
          unit={
            <ModuleUnitSelect moduleId="flywheels" fieldKey="radius" value={thicknessUnit} onChange={setThicknessUnit} />
          }
        />
        <CalculatorUnitField
          label="Face width"
          value={faceWidth}
          onChange={setFaceWidth}
          unit={
            <ModuleUnitSelect moduleId="flywheels" fieldKey="radius" value={faceWidthUnit} onChange={setFaceWidthUnit} />
          }
        />
        <CalculatorUnitField
          label="Density"
          value={density}
          onChange={setDensity}
          unit={
            <ModuleUnitSelect moduleId="composites" fieldKey="density" value={densityUnit} onChange={setDensityUnit} />
          }
        />
        <CalculatorNumberField label="Speed (rpm)" value={rpm} onChange={setRpm} />
      </div>
    </CalculatorInputPanel>
  );
}
