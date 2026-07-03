"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorFieldLabelClass, calculatorInputGridClass, calculatorSelectClass } from "@/components/calculator/styles";
import type { WeldType } from "@/lib/fasteners/welds/types";

type Props = {
  weldType: WeldType;
  setWeldType: Dispatch<SetStateAction<WeldType>>;
  weldSize: number;
  setWeldSize: Dispatch<SetStateAction<number>>;
  weldSizeUnit: string;
  setWeldSizeUnit: Dispatch<SetStateAction<string>>;
  weldLength: number;
  setWeldLength: Dispatch<SetStateAction<number>>;
  weldLengthUnit: string;
  setWeldLengthUnit: Dispatch<SetStateAction<string>>;
  weldCount: number;
  setWeldCount: Dispatch<SetStateAction<number>>;
  shearForce: number;
  setShearForce: Dispatch<SetStateAction<number>>;
  shearForceUnit: string;
  setShearForceUnit: Dispatch<SetStateAction<string>>;
  axialForce: number;
  setAxialForce: Dispatch<SetStateAction<number>>;
  axialForceUnit: string;
  setAxialForceUnit: Dispatch<SetStateAction<string>>;
  eccentricity: number;
  setEccentricity: Dispatch<SetStateAction<number>>;
  eccentricityUnit: string;
  setEccentricityUnit: Dispatch<SetStateAction<string>>;
  material: string;
  setMaterial: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function WeldInputs({
  weldType,
  setWeldType,
  weldSize,
  setWeldSize,
  weldSizeUnit,
  setWeldSizeUnit,
  weldLength,
  setWeldLength,
  weldLengthUnit,
  setWeldLengthUnit,
  weldCount,
  setWeldCount,
  shearForce,
  setShearForce,
  shearForceUnit,
  setShearForceUnit,
  axialForce,
  setAxialForce,
  axialForceUnit,
  setAxialForceUnit,
  eccentricity,
  setEccentricity,
  eccentricityUnit,
  setEccentricityUnit,
  material,
  setMaterial,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Weld joint"
      description="Define weld throat size, group geometry, and applied shear/axial forces."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Evaluate weld" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Weld type</span>
          <select
            value={weldType}
            onChange={(event) => setWeldType(event.target.value as WeldType)}
            className={calculatorSelectClass}
          >
            <option value="fillet">Fillet weld</option>
            <option value="groove">Groove weld</option>
          </select>
        </label>
        <CalculatorUnitField
          label="Weld size"
          value={weldSize}
          onChange={setWeldSize}
          unit={
            <ModuleUnitSelect moduleId="welds" fieldKey="length" value={weldSizeUnit} onChange={setWeldSizeUnit} />
          }
        />
        <CalculatorUnitField
          label="Weld length"
          value={weldLength}
          onChange={setWeldLength}
          unit={
            <ModuleUnitSelect moduleId="welds" fieldKey="length" value={weldLengthUnit} onChange={setWeldLengthUnit} />
          }
        />
        <CalculatorNumberField label="Weld count" value={weldCount} onChange={setWeldCount} min={1} />
        <CalculatorUnitField
          label="Shear force"
          value={shearForce}
          onChange={setShearForce}
          unit={
            <ModuleUnitSelect moduleId="welds" fieldKey="force" value={shearForceUnit} onChange={setShearForceUnit} />
          }
        />
        <CalculatorUnitField
          label="Axial force"
          value={axialForce}
          onChange={setAxialForce}
          unit={
            <ModuleUnitSelect moduleId="welds" fieldKey="force" value={axialForceUnit} onChange={setAxialForceUnit} />
          }
        />
        <CalculatorUnitField
          label="Eccentricity (shear line to group CG)"
          value={eccentricity}
          onChange={setEccentricity}
          min={0}
          unit={
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="length"
              value={eccentricityUnit}
              onChange={setEccentricityUnit}
            />
          }
        />
        <label className="space-y-2 col-span-full">
          <span className={calculatorFieldLabelClass}>Material</span>
          <select value={material} onChange={(event) => setMaterial(event.target.value)} className={calculatorSelectClass}>
            <option value="Steel">Steel</option>
            <option value="Stainless">Stainless</option>
            <option value="Aluminum">Aluminum</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
