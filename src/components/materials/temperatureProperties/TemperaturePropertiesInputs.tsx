"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitField from "@/components/shared/ModuleUnitField";

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
      <ModuleUnitField moduleId="temperature-properties" fieldKey="baseYield" value={props.baseYield} unit={props.yieldUnit} onValueChange={props.setBaseYield} onUnitChange={props.setYieldUnit} />
      <ModuleUnitField moduleId="temperature-properties" fieldKey="baseModulus" value={props.baseModulus} unit={props.modulusUnit} onValueChange={props.setBaseModulus} onUnitChange={props.setModulusUnit} />
      <ModuleUnitField moduleId="temperature-properties" fieldKey="coefficient" value={props.coefficient} unit={props.coeffUnit} onValueChange={props.setCoefficient} onUnitChange={props.setCoeffUnit} step="0.000000001" />
      <ModuleUnitField moduleId="temperature-properties" fieldKey="temperature" value={props.temperature} unit={props.tempUnit} onValueChange={props.setTemperature} onUnitChange={props.setTempUnit} />
    </CalculatorInputPanel>
  );
}
