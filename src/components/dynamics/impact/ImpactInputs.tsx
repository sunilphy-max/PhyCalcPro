"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Mass"
          value={props.mass}
          onChange={props.setMass}
          unit={
            <ModuleUnitSelect moduleId="impact" fieldKey="mass" value={props.massUnit} onChange={props.setMassUnit} />
          }
        />
        <CalculatorUnitField
          label="Velocity change"
          value={props.velocityChange}
          onChange={props.setVelocityChange}
          unit={
            <ModuleUnitSelect
              moduleId="impact"
              fieldKey="velocity"
              value={props.velocityUnit}
              onChange={props.setVelocityUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Impact duration"
          value={props.impactDuration}
          onChange={props.setImpactDuration}
          unit={
            <ModuleUnitSelect
              moduleId="impact"
              fieldKey="duration"
              value={props.durationUnit}
              onChange={props.setDurationUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Cross-section area"
          value={props.crossSectionArea}
          onChange={props.setCrossSectionArea}
          unit={
            <ModuleUnitSelect moduleId="impact" fieldKey="area" value={props.areaUnit} onChange={props.setAreaUnit} />
          }
        />
        <CalculatorUnitField
          label="Yield strength"
          value={props.yieldStrength}
          onChange={props.setYieldStrength}
          unit={
            <ModuleUnitSelect
              moduleId="impact"
              fieldKey="stress"
              value={props.stressUnit}
              onChange={props.setStressUnit}
            />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
