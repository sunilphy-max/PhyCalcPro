"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

type Props = {
  baseYield: number;
  setBaseYield: (v: number) => void;
  yieldUnit: string;
  setYieldUnit: (u: string) => void;
  baseModulus: number;
  setBaseModulus: (v: number) => void;
  modulusUnit: string;
  setModulusUnit: (u: string) => void;
  coefficient: number;
  setCoefficient: (v: number) => void;
  coeffUnit: string;
  setCoeffUnit: (u: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  tempUnit: string;
  setTempUnit: (u: string) => void;
  onCalculate: () => void;
};

export default function TemperaturePropertiesInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Material inputs"
      description="Estimate property reductions with temperature exposure."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate properties" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Yield strength"
          value={props.baseYield}
          onChange={props.setBaseYield}
          unit={
            <ModuleUnitSelect
              moduleId="temperature-properties"
              fieldKey="baseYield"
              value={props.yieldUnit}
              onChange={props.setYieldUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Young's modulus"
          value={props.baseModulus}
          onChange={props.setBaseModulus}
          unit={
            <ModuleUnitSelect
              moduleId="temperature-properties"
              fieldKey="baseModulus"
              value={props.modulusUnit}
              onChange={props.setModulusUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Thermal expansion coeff."
          value={props.coefficient}
          onChange={props.setCoefficient}
          step="0.000000001"
          unit={
            <ModuleUnitSelect
              moduleId="temperature-properties"
              fieldKey="coefficient"
              value={props.coeffUnit}
              onChange={props.setCoeffUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Operating temperature"
          value={props.temperature}
          onChange={props.setTemperature}
          unit={
            <ModuleUnitSelect
              moduleId="temperature-properties"
              fieldKey="temperature"
              value={props.tempUnit}
              onChange={props.setTempUnit}
            />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
