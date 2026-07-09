"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MaterialSelect from "@/components/materials/MaterialSelect";
import {
  calculatorFieldLabelClass,
  calculatorInputGridClass,
  calculatorSelectClass,
} from "@/components/calculator/styles";
import type { RivetType } from "@/lib/fasteners/rivets/types";

type Props = {
  rivetDiameter: number;
  setRivetDiameter: Dispatch<SetStateAction<number>>;
  rivetDiameterUnit: string;
  setRivetDiameterUnit: Dispatch<SetStateAction<string>>;
  plateThickness: number;
  setPlateThickness: Dispatch<SetStateAction<number>>;
  plateThicknessUnit: string;
  setPlateThicknessUnit: Dispatch<SetStateAction<string>>;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  shearForce: number;
  setShearForce: Dispatch<SetStateAction<number>>;
  shearUnit: string;
  setShearUnit: Dispatch<SetStateAction<string>>;
  axialForce: number;
  setAxialForce: Dispatch<SetStateAction<number>>;
  axialUnit: string;
  setAxialUnit: Dispatch<SetStateAction<string>>;
  material: string;
  setMaterial: Dispatch<SetStateAction<string>>;
  rivetType: RivetType;
  setRivetType: Dispatch<SetStateAction<RivetType>>;
  onCalculate: () => void;
};

export default function RivetInputs({
  rivetDiameter,
  setRivetDiameter,
  rivetDiameterUnit,
  setRivetDiameterUnit,
  plateThickness,
  setPlateThickness,
  plateThicknessUnit,
  setPlateThicknessUnit,
  quantity,
  setQuantity,
  shearForce,
  setShearForce,
  shearUnit,
  setShearUnit,
  axialForce,
  setAxialForce,
  axialUnit,
  setAxialUnit,
  material,
  setMaterial,
  rivetType,
  setRivetType,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Rivet joint"
      description="Specify rivet geometry, plate thickness, and load cases for shear and axial service."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Evaluate rivet" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Rivet diameter"
          value={rivetDiameter}
          onChange={setRivetDiameter}
          unit={
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="diameter"
              value={rivetDiameterUnit}
              onChange={setRivetDiameterUnit}
            />
          }
        />
        <CalculatorUnitField
          label="Plate thickness"
          value={plateThickness}
          onChange={setPlateThickness}
          unit={
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="thickness"
              value={plateThicknessUnit}
              onChange={setPlateThicknessUnit}
            />
          }
        />
        <CalculatorNumberField label="Number of rivets" value={quantity} onChange={setQuantity} min={1} />
        <label className="space-y-2">
          <span className={calculatorFieldLabelClass}>Rivet type</span>
          <select
            value={rivetType}
            onChange={(event) => setRivetType(event.target.value as RivetType)}
            className={calculatorSelectClass}
          >
            <option value="solid">Solid rivet</option>
            <option value="blind">Blind rivet</option>
          </select>
        </label>
        <CalculatorUnitField
          label="Shear load"
          value={shearForce}
          onChange={setShearForce}
          unit={<ModuleUnitSelect moduleId="rivets" fieldKey="force" value={shearUnit} onChange={setShearUnit} />}
        />
        <CalculatorUnitField
          label="Axial load"
          value={axialForce}
          onChange={setAxialForce}
          unit={<ModuleUnitSelect moduleId="rivets" fieldKey="force" value={axialUnit} onChange={setAxialUnit} />}
        />
        <MaterialSelect profile="rivet" value={material} onChange={setMaterial} />
      </div>
    </CalculatorInputPanel>
  );
}
