import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorNumberInputClass } from "@/components/calculator/styles";
import type { BearingType, BearingReliability } from "@/lib/machine/bearings/types";
import { bearingsOfType } from "@/data/catalogs/bearingCatalog";

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
  setBearingType: (type: BearingType) => void;
  designation: string;
  setDesignation: (designation: string) => void;
  reliability: BearingReliability;
  setReliability: (reliability: BearingReliability) => void;
  onCalculate: () => void;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
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
  designation,
  setDesignation,
  reliability,
  setReliability,
  onCalculate,
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const catalogOptions = bearingsOfType(bearingType);
  return (
    <CalculatorInputPanel
      title="Bearing calculator"
      description="Estimate equivalent load, dynamic rating, and life for rolling bearings."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={onCalculate} label="Calculate bearing life" designAware />
          {onSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
          ) : null}
        </div>
      }
    >
      {setProjectName ? (
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Project name</span>
          <input
            type="text"
            value={projectName ?? ""}
            onChange={(event) => setProjectName(event.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          />
        </label>
      ) : null}
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
            <option value="angular_contact">Angular contact (40°)</option>
            <option value="cylindrical_roller">Cylindrical roller</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Catalog bearing</span>
        <select
          value={designation}
          onChange={(event) => setDesignation(event.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          {catalogOptions.map((entry) => (
            <option key={entry.designation} value={entry.designation}>
              {entry.designation} — d {entry.boreMm} mm, C {(entry.dynamicRatingN / 1000).toFixed(1)} kN
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Reliability (ISO 281 a1)</span>
        <select
          value={reliability}
          onChange={(event) => setReliability(Number(event.target.value) as BearingReliability)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value={90}>90% (a1 = 1.00)</option>
          <option value={95}>95% (a1 = 0.64)</option>
          <option value={96}>96% (a1 = 0.55)</option>
          <option value={97}>97% (a1 = 0.47)</option>
          <option value={98}>98% (a1 = 0.37)</option>
          <option value={99}>99% (a1 = 0.25)</option>
        </select>
      </label>
    </CalculatorInputPanel>
  );
}
