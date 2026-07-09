"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MaterialSelect from "@/components/materials/MaterialSelect";
import { getMaterialFieldUpdates } from "@/lib/materials/materialCatalogService";
import { CUSTOM_MATERIAL } from "@/data/materials";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import type { ShellConfig } from "@/lib/structural/shells/types";

type Props = {
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  thickness: number;
  setThickness: Dispatch<SetStateAction<number>>;
  length: number;
  setLength: Dispatch<SetStateAction<number>>;
  internalPressure: number;
  setInternalPressure: Dispatch<SetStateAction<number>>;
  axialForce: number;
  setAxialForce: Dispatch<SetStateAction<number>>;
  bendingMoment: number;
  setBendingMoment: Dispatch<SetStateAction<number>>;
  modulus: number;
  setModulus: Dispatch<SetStateAction<number>>;
  allowableStress: number;
  setAllowableStress: Dispatch<SetStateAction<number>>;
  endCondition: ShellConfig["endCondition"];
  setEndCondition: Dispatch<SetStateAction<ShellConfig["endCondition"]>>;
  lengthUnit: string;
  setLengthUnit: Dispatch<SetStateAction<string>>;
  pressureUnit: string;
  setPressureUnit: Dispatch<SetStateAction<string>>;
  forceUnit: string;
  setForceUnit: Dispatch<SetStateAction<string>>;
  momentUnit: string;
  setMomentUnit: Dispatch<SetStateAction<string>>;
  modulusUnit: string;
  setModulusUnit: Dispatch<SetStateAction<string>>;
  stressUnit: string;
  setStressUnit: Dispatch<SetStateAction<string>>;
  material: string;
  onMaterialChange: (name: string) => void;
  onCalculate: () => void;
};

export default function ShellsInputs(props: Props) {
  const handleMaterial = (name: string) => {
    props.onMaterialChange(name);
    if (name !== CUSTOM_MATERIAL) {
      const u = getMaterialFieldUpdates(name, "structural");
      props.setModulus(u.E / 1e9);
      props.setAllowableStress(u.yieldStress / 1e6);
    }
  };

  return (
    <CalculatorInputPanel
      title="Cylindrical shell"
      description="Thin-shell hoop, axial and bending stress with von Mises screening."
      footer={<CalculatorCalculateButton onClick={props.onCalculate} label="Calculate shell" designAware />}
    >
      <MaterialSelect profile="structural" value={props.material} onChange={handleMaterial} />
      <div className={calculatorInputGridClass}>
        <CalculatorUnitField
          label="Mean radius"
          value={props.radius}
          onChange={props.setRadius}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="radius" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Wall thickness"
          value={props.thickness}
          onChange={props.setThickness}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="thickness" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Shell length"
          value={props.length}
          onChange={props.setLength}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="length" value={props.lengthUnit} onChange={props.setLengthUnit} />
          }
        />
        <CalculatorUnitField
          label="Internal pressure"
          value={props.internalPressure}
          onChange={props.setInternalPressure}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="pressure" value={props.pressureUnit} onChange={props.setPressureUnit} />
          }
        />
        <CalculatorUnitField
          label="Axial force"
          value={props.axialForce}
          onChange={props.setAxialForce}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="force" value={props.forceUnit} onChange={props.setForceUnit} />
          }
        />
        <CalculatorUnitField
          label="Bending moment"
          value={props.bendingMoment}
          onChange={props.setBendingMoment}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="moment" value={props.momentUnit} onChange={props.setMomentUnit} />
          }
        />
        <CalculatorUnitField
          label="Young's modulus"
          value={props.modulus}
          onChange={props.setModulus}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="modulus" value={props.modulusUnit} onChange={props.setModulusUnit} />
          }
        />
        <CalculatorUnitField
          label="Allowable stress"
          value={props.allowableStress}
          onChange={props.setAllowableStress}
          unit={
            <ModuleUnitSelect moduleId="shells" fieldKey="stress" value={props.stressUnit} onChange={props.setStressUnit} />
          }
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>End condition</span>
          <select
            value={props.endCondition}
            onChange={(e) => props.setEndCondition(e.target.value as ShellConfig["endCondition"])}
            className={calculatorNumberInputClass}
          >
            <option value="closed">Closed ends (pressure caps)</option>
            <option value="open">Open ends</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
