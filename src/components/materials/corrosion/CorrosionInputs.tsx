"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Initial thickness"
          value={props.initialThickness}
          onChange={props.setInitialThickness}
          unit={
            <ModuleUnitSelect
              moduleId="corrosion"
              fieldKey="initialThickness"
              value={props.thicknessUnit}
              onChange={props.setThicknessUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Corrosion rate"
          value={props.corrosionRate}
          onChange={props.setCorrosionRate}
          step={0.01}
          unit={
            <ModuleUnitSelect
              moduleId="corrosion"
              fieldKey="corrosionRate"
              value={props.rateUnit}
              onChange={props.setRateUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Design life"
          value={props.designLife}
          onChange={props.setDesignLife}
          unit={
            <ModuleUnitSelect
              moduleId="corrosion"
              fieldKey="designLife"
              value={props.lifeUnit}
              onChange={props.setLifeUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Safety margin"
          value={props.safetyMargin}
          onChange={props.setSafetyMargin}
          unit={
            <ModuleUnitSelect
              moduleId="corrosion"
              fieldKey="safetyMargin"
              value={props.marginUnit}
              onChange={props.setMarginUnit}
            />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
