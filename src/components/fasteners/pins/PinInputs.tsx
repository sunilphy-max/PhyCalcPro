"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";

type Props = {
  force: number;
  setForce: Dispatch<SetStateAction<number>>;
  forceUnit: string;
  setForceUnit: Dispatch<SetStateAction<string>>;
  pinDiameter: number;
  setPinDiameter: Dispatch<SetStateAction<number>>;
  plateThickness: number;
  setPlateThickness: Dispatch<SetStateAction<number>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  pinMaterialYield: number;
  setPinMaterialYield: Dispatch<SetStateAction<number>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  pinCount: number;
  setPinCount: Dispatch<SetStateAction<number>>;
  onCalculate: () => void;
};

export default function PinInputs({
  force,
  setForce,
  forceUnit,
  setForceUnit,
  pinDiameter,
  setPinDiameter,
  plateThickness,
  setPlateThickness,
  lengthUnit,
  setLengthUnit,
  pinMaterialYield,
  setPinMaterialYield,
  stressUnit,
  setStressUnit,
  pinCount,
  setPinCount,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Pin & clevis"
      description="Check pin shear and bearing stress for clevis or hinge joints."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate pin" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Shear force"
          value={force}
          onChange={setForce}
          unit={<ModuleUnitSelect moduleId="pins" fieldKey="force" value={forceUnit} onChange={setForceUnit} />}
        />
        <CalculatorUnitField
          label="Pin diameter"
          value={pinDiameter}
          onChange={setPinDiameter}
          unit={
            <ModuleUnitSelect moduleId="pins" fieldKey="pinDiameter" value={lengthUnit} onChange={setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Plate thickness"
          value={plateThickness}
          onChange={setPlateThickness}
          unit={
            <ModuleUnitSelect
              moduleId="pins"
              fieldKey="plateThickness"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Pin yield stress"
          value={pinMaterialYield}
          onChange={setPinMaterialYield}
          unit={<ModuleUnitSelect moduleId="pins" fieldKey="stress" value={stressUnit} onChange={setStressUnit} />}
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Number of pins in shear</span>
          <input
            type="number"
            min={1}
            value={pinCount}
            onChange={(e) => setPinCount(Number(e.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
