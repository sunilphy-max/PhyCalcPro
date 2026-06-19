"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass } from "@/components/calculator/styles";

type Props = {
  wireDiameter: number;
  setWireDiameter: Dispatch<SetStateAction<number>>;
  meanDiameter: number;
  setMeanDiameter: Dispatch<SetStateAction<number>>;
  activeCoils: number;
  setActiveCoils: Dispatch<SetStateAction<number>>;
  legLength: number;
  setLegLength: Dispatch<SetStateAction<number>>;
  deflectionAngleDeg: number;
  setDeflectionAngleDeg: Dispatch<SetStateAction<number>>;
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

export default function TorsionSpringInputs({
  wireDiameter,
  setWireDiameter,
  meanDiameter,
  setMeanDiameter,
  activeCoils,
  setActiveCoils,
  legLength,
  setLegLength,
  deflectionAngleDeg,
  setDeflectionAngleDeg,
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
      title="Torsion spring"
      description="Helical torsion spring — rate from bending, stress in wire."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate spring" designAware />}
    >
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label="Wire diameter (d)"
          value={wireDiameter}
          onChange={setWireDiameter}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="wireDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Mean coil diameter (D)"
          value={meanDiameter}
          onChange={setMeanDiameter}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="meanDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Leg length"
          value={legLength}
          onChange={setLegLength}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="legLength" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorNumberField
          label="Deflection angle (deg)"
          value={deflectionAngleDeg}
          onChange={setDeflectionAngleDeg}
          min={0}
        />
        <CalculatorNumberField
          label="Active coils (n)"
          value={activeCoils}
          onChange={setActiveCoils}
          min={1}
          step={0.5}
        />
        <CalculatorUnitField
          label="Elastic modulus (E)"
          value={modulus}
          onChange={setModulus}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="modulus" value={stressUnit} onChange={setStressUnit} />
          }
        />
        <CalculatorUnitField
          label="Ultimate tensile strength"
          value={ultimateStrength}
          onChange={setUltimateStrength}
          unit={
            <ModuleUnitSelect moduleId="torsion-springs" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />
          }
        />
      </div>
    </CalculatorInputPanel>
  );
}
