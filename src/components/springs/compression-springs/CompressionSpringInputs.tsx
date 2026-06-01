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

export default function CompressionSpringInputs({
  wireDiameter,
  setWireDiameter,
  meanDiameter,
  setMeanDiameter,
  activeCoils,
  setActiveCoils,
  freeLength,
  setFreeLength,
  deflection,
  setDeflection,
  modulus,
  setModulus,
  ultimateStrength,
  setUltimateStrength,
  lengthUnit,
  setLengthUnit,
  stressUnit,
  setStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Compression spring"
      description="Size wire and coils; estimate rate, solid height, shear stress and safety factor."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate spring" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Wire diameter (d)"
          value={wireDiameter}
          onChange={setWireDiameter}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="wireDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Mean coil diameter (D)"
          value={meanDiameter}
          onChange={setMeanDiameter}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Free length"
          value={freeLength}
          onChange={setFreeLength}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="freeLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Operating deflection"
          value={deflection}
          onChange={setDeflection}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="deflection" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Active coils (n)</span>
          <input
            type="number"
            min={1}
            step={0.5}
            value={activeCoils}
            onChange={(e) => setActiveCoils(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Shear modulus (G ≈ E/2.6)"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="modulus" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <CalculatorUnitField
          label="Ultimate tensile strength"
          value={ultimateStrength}
          onChange={setUltimateStrength}
          unit={
            <ModuleUnitSelect moduleId="compression-springs" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
