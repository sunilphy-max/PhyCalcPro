import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";
import type { BearingType } from "@/lib/machine/bearings/types";

type Props = {
  radialLoad: number;
  setRadialLoad: Dispatch<SetStateAction<number>>;
  radialUnit: string;
  setRadialUnit: Dispatch<SetStateAction<string>>;
  axialLoad: number;
  setAxialLoad: Dispatch<SetStateAction<number>>;
  axialUnit: string;
  setAxialUnit: Dispatch<SetStateAction<string>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  lifeHours: number;
  setLifeHours: Dispatch<SetStateAction<number>>;
  safetyFactor: number;
  setSafetyFactor: Dispatch<SetStateAction<number>>;
  bearingType: BearingType;
  setBearingType: Dispatch<SetStateAction<BearingType>>;
  material: string;
  setMaterial: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function BearingInputs({
  radialLoad,
  setRadialLoad,
  radialUnit,
  setRadialUnit,
  axialLoad,
  setAxialLoad,
  axialUnit,
  setAxialUnit,
  speed,
  setSpeed,
  lifeHours,
  setLifeHours,
  safetyFactor,
  setSafetyFactor,
  bearingType,
  setBearingType,
  material,
  setMaterial,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Bearing calculator"
      description="Estimate equivalent load, dynamic rating, and life for rolling bearings."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate bearing life" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CalculatorUnitField
          label="Radial load"
          value={radialLoad}
          onChange={setRadialLoad}
          unit={
            <ModuleUnitSelect
              moduleId="bearings"
              fieldKey="load"
              value={radialUnit}
              onChange={setRadialUnit}
            />
          }
        />

        <CalculatorUnitField
          label="Axial load"
          value={axialLoad}
          onChange={setAxialLoad}
          unit={
            <ModuleUnitSelect
              moduleId="bearings"
              fieldKey="load"
              value={axialUnit}
              onChange={setAxialUnit}
            />
          }
        />

        <CalculatorUnitField
          label="Speed"
          value={speed}
          onChange={setSpeed}
          min={0}
          unit={<span className="text-sm text-slate-500">RPM</span>}
        />

        <CalculatorUnitField
          label="Desired life"
          value={lifeHours}
          onChange={setLifeHours}
          min={0}
          unit={<span className="text-sm text-slate-500">h</span>}
        />

        <label className="space-y-2 text-sm text-slate-700">
          <span>Safety factor</span>
          <input
            type="number"
            step="0.1"
            value={safetyFactor}
            onChange={(event) => setSafetyFactor(Number(event.target.value))}
            className={calculatorNumberInputClass}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Bearing type</span>
          <select
            value={bearingType}
            onChange={(event) => setBearingType(event.target.value as BearingType)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="deep_groove">Deep groove ball</option>
            <option value="angular_contact">Angular contact</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Material</span>
        <select
          value={material}
          onChange={(event) => setMaterial(event.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value="Steel">Steel</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Bronze">Bronze</option>
        </select>
      </label>
    </CalculatorInputPanel>
  );
}
