"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  boltCount: number;
  setBoltCount: (v: number) => void;
  patternRadius: number;
  setPatternRadius: (v: number) => void;
  shearForce: number;
  setShearForce: (v: number) => void;
  axialForce: number;
  setAxialForce: (v: number) => void;
  eccentricityX: number;
  setEccentricityX: (v: number) => void;
  eccentricityY: number;
  setEccentricityY: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (v: string) => void;
  forceUnit: string;
  setForceUnit: (v: string) => void;
  onCalculate: () => void;
};

export default function BoltPatternInputs({
  boltCount,
  setBoltCount,
  patternRadius,
  setPatternRadius,
  shearForce,
  setShearForce,
  axialForce,
  setAxialForce,
  eccentricityX,
  setEccentricityX,
  eccentricityY,
  setEccentricityY,
  lengthUnit,
  setLengthUnit,
  forceUnit,
  setForceUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Bolt pattern load sharing"
      description="Elastic distribution of shear and eccentric moment across N bolts on a bolt circle."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate pattern" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Bolt count</span>
          <input
            type="number"
            min={2}
            max={24}
            value={boltCount}
            onChange={(e) => setBoltCount(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
        <CalculatorUnitField
          label="Pattern radius"
          value={patternRadius}
          onChange={setPatternRadius}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />}
        />
        <CalculatorUnitField
          label="Shear force"
          value={shearForce}
          onChange={setShearForce}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Axial force (total)"
          value={axialForce}
          onChange={setAxialForce}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Load eccentricity X"
          value={eccentricityX}
          onChange={setEccentricityX}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />}
        />
        <CalculatorUnitField
          label="Load eccentricity Y"
          value={eccentricityY}
          onChange={setEccentricityY}
          unit={<ModuleUnitSelect moduleId="bolts" fieldKey="length" value={lengthUnit} onChange={setLengthUnit} />}
        />
      </div>
    </CalculatorInputPanel>
  );
}
