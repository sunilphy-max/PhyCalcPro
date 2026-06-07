"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";

type Props = {
  mass: number;
  setMass: (v: number) => void;
  massUnit: string;
  setMassUnit: (u: string) => void;
  velocityChange: number;
  setVelocityChange: (v: number) => void;
  velocityUnit: string;
  setVelocityUnit: (u: string) => void;
  impactDuration: number;
  setImpactDuration: (v: number) => void;
  durationUnit: string;
  setDurationUnit: (u: string) => void;
  crossSectionArea: number;
  setCrossSectionArea: (v: number) => void;
  areaUnit: string;
  setAreaUnit: (u: string) => void;
  yieldStrength: number;
  setYieldStrength: (v: number) => void;
  stressUnit: string;
  setStressUnit: (u: string) => void;
  onCalculate: () => void;
};

export default function ImpactInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Impact parameters"
      description="Estimate average impact force and dynamic stress for a sudden loading event."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate impact results" designAware />}
    >
      <ModuleUnitField
        moduleId="impact"
        fieldKey="mass"
        value={props.mass}
        unit={props.massUnit}
        onValueChange={props.setMass}
        onUnitChange={props.setMassUnit}
      />
      <ModuleUnitField
        moduleId="impact"
        fieldKey="velocity"
        value={props.velocityChange}
        unit={props.velocityUnit}
        onValueChange={props.setVelocityChange}
        onUnitChange={props.setVelocityUnit}
      />
      <ModuleUnitField
        moduleId="impact"
        fieldKey="duration"
        value={props.impactDuration}
        unit={props.durationUnit}
        onValueChange={props.setImpactDuration}
        onUnitChange={props.setDurationUnit}
      />
      <ModuleUnitField
        moduleId="impact"
        fieldKey="area"
        value={props.crossSectionArea}
        unit={props.areaUnit}
        onValueChange={props.setCrossSectionArea}
        onUnitChange={props.setAreaUnit}
      />
      <ModuleUnitField
        moduleId="impact"
        fieldKey="stress"
        value={props.yieldStrength}
        unit={props.stressUnit}
        onValueChange={props.setYieldStrength}
        onUnitChange={props.setStressUnit}
      />
    </CalculatorInputPanel>
  );
}
