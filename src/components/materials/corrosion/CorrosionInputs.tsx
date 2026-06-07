"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";

const defaults = moduleUnitProfiles.corrosion;

type Props = {
  initialThickness: number;
  setInitialThickness: (v: number) => void;
  thicknessUnit: string;
  setThicknessUnit: (u: string) => void;
  corrosionRate: number;
  setCorrosionRate: (v: number) => void;
  rateUnit: string;
  setRateUnit: (u: string) => void;
  designLife: number;
  setDesignLife: (v: number) => void;
  lifeUnit: string;
  setLifeUnit: (u: string) => void;
  safetyMargin: number;
  setSafetyMargin: (v: number) => void;
  marginUnit: string;
  setMarginUnit: (u: string) => void;
  onCalculate: () => void;
};

export default function CorrosionInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Design inputs"
      description="Estimate required material thickness for corrosion exposure."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate corrosion allowance" designAware />}
    >
      <ModuleUnitField moduleId="corrosion" fieldKey="initialThickness" value={props.initialThickness} unit={props.thicknessUnit} onValueChange={props.setInitialThickness} onUnitChange={props.setThicknessUnit} />
      <ModuleUnitField moduleId="corrosion" fieldKey="corrosionRate" value={props.corrosionRate} unit={props.rateUnit} onValueChange={props.setCorrosionRate} onUnitChange={props.setRateUnit} step="0.01" />
      <ModuleUnitField moduleId="corrosion" fieldKey="designLife" value={props.designLife} unit={props.lifeUnit} onValueChange={props.setDesignLife} onUnitChange={props.setLifeUnit} />
      <ModuleUnitField moduleId="corrosion" fieldKey="safetyMargin" value={props.safetyMargin} unit={props.marginUnit} onValueChange={props.setSafetyMargin} onUnitChange={props.setMarginUnit} />
    </CalculatorInputPanel>
  );
}
