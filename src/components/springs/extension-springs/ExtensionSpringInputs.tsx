"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  wireDiameter: number;
  setWireDiameter: Dispatch<SetStateAction<number>>;
  meanDiameter: number;
  setMeanDiameter: Dispatch<SetStateAction<number>>;
  activeCoils: number;
  setActiveCoils: Dispatch<SetStateAction<number>>;
  freeLength: number;
  setFreeLength: Dispatch<SetStateAction<number>>;
  deflection: number;
  setDeflection: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  ultimateStrength: number;
  setUltimateStrength: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function ExtensionSpringInputs(props: Props) {
  return (
    <CalculatorInputPanel
      title="Extension spring"
      description="Helical extension spring with initial tension estimate."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate spring" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Wire diameter (d)"
          value={props.wireDiameter}
          onChange={props.setWireDiameter}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="wireDiameter" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Mean coil diameter (D)"
          value={props.meanDiameter}
          onChange={props.setMeanDiameter}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="meanDiameter" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Free length (coils only)"
          value={props.freeLength}
          onChange={props.setFreeLength}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="freeLength" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Extension at load"
          value={props.deflection}
          onChange={props.setDeflection}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="deflection" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Active coils (n)</span>
          <input
            type="number"
            min={1}
            step={0.5}
            value={props.activeCoils}
            onChange={(e) => props.setActiveCoils(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Shear modulus (G)"
          value={props.modulus}
          onChange={props.setModulus}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="modulus" value={props.stressUnit} onChange={props.setStressUnit} />
          }
        />
        <CalculatorUnitField
          label="Ultimate tensile strength"
          value={props.ultimateStrength}
          onChange={props.setUltimateStrength}
          unit={
            <ModuleUnitSelect moduleId="extension-springs" fieldKey="stress" value={props.stressUnit} onChange={props.setStressUnit} />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
