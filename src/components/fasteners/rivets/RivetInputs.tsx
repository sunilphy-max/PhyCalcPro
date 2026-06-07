"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

import type { Dispatch, SetStateAction } from "react";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
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
<div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Rivet diameter</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={rivetDiameter}
              onChange={(event) => setRivetDiameter(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="diameter"
              value={rivetDiameterUnit}
              onChange={setRivetDiameterUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Plate thickness</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={plateThickness}
              onChange={(event) => setPlateThickness(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="thickness"
              value={plateThicknessUnit}
              onChange={setPlateThicknessUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Number of rivets</span>
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Rivet type</span>
          <select
            value={rivetType}
            onChange={(event) => setRivetType(event.target.value as RivetType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="solid">Solid rivet</option>
            <option value="blind">Blind rivet</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Shear load</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={shearForce}
              onChange={(event) => setShearForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="force"
              value={shearUnit}
              onChange={setShearUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Axial load</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={axialForce}
              onChange={(event) => setAxialForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="rivets"
              fieldKey="force"
              value={axialUnit}
              onChange={setAxialUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700 col-span-full">
          <span>Material</span>
          <select
            value={material}
            onChange={(event) => setMaterial(event.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="Steel">Steel</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Brass">Brass</option>
          </select>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

