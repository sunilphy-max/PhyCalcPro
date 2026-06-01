import type { Dispatch, SetStateAction } from "react";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
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
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Weld joint inputs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define weld throat size, group geometry, and applied shear/axial forces.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Weld type</span>
          <select
            value={weldType}
            onChange={(event) => setWeldType(event.target.value as WeldType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="fillet">Fillet weld</option>
            <option value="groove">Groove weld</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Weld size</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={weldSize}
              onChange={(event) => setWeldSize(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="length"
              value={weldSizeUnit}
              onChange={setWeldSizeUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Weld length</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={weldLength}
              onChange={(event) => setWeldLength(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="length"
              value={weldLengthUnit}
              onChange={setWeldLengthUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Weld count</span>
          <input
            type="number"
            min={1}
            value={weldCount}
            onChange={(event) => setWeldCount(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Shear force</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={shearForce}
              onChange={(event) => setShearForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="force"
              value={shearForceUnit}
              onChange={setShearForceUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Axial force</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={axialForce}
              onChange={(event) => setAxialForce(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="force"
              value={axialForceUnit}
              onChange={setAxialForceUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Eccentricity (shear line to group CG)</span>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={eccentricity}
              onChange={(event) => setEccentricity(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <ModuleUnitSelect
              moduleId="welds"
              fieldKey="length"
              value={eccentricityUnit}
              onChange={setEccentricityUnit}
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
            <option value="Stainless">Stainless</option>
            <option value="Aluminum">Aluminum</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 font-medium hover:bg-slate-800"
      >
        Evaluate Weld Strength
      </button>
    </div>
  );
}
