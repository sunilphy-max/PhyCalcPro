import type { Dispatch, SetStateAction } from "react";
import UnitSelector from "@/components/shared/UnitSelector";
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
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Bearing calculator</h2>
        <p className="text-sm text-slate-500 mt-1">
          Estimate equivalent load, dynamic rating, and life for rolling bearings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Radial load</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={radialLoad}
              onChange={(event) => setRadialLoad(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="force"
              value={radialUnit}
              onChange={setRadialUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Axial load</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={axialLoad}
              onChange={(event) => setAxialLoad(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="force"
              value={axialUnit}
              onChange={setAxialUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Speed</span>
          <input
            type="number"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">RPM</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Desired life</span>
          <input
            type="number"
            value={lifeHours}
            onChange={(event) => setLifeHours(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">Hours</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Safety factor</span>
          <input
            type="number"
            step="0.1"
            value={safetyFactor}
            onChange={(event) => setSafetyFactor(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
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

      <div className="space-y-2 text-sm text-slate-700">
        <label className="block">Material</label>
        <select
          value={material}
          onChange={(event) => setMaterial(event.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value="Steel">Steel</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Bronze">Bronze</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 font-medium hover:bg-slate-800"
      >
        Calculate Bearing Life
      </button>
    </div>
  );
}
