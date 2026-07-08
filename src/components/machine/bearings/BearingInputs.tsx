import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import type { BearingType, BearingReliability, LubricationClass, BearingManufacturer, BearingArrangement } from "@/lib/machine/bearings/types";
import { bearingsOfType, findBearing, BEARING_MANUFACTURERS, BEARING_MANUFACTURER_LABELS } from "@/data/catalogs/bearingCatalog";

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
  lubricationClass: LubricationClass | "";
  setLubricationClass: (v: LubricationClass | "") => void;
  manufacturer: BearingManufacturer;
  setManufacturer: (manufacturer: BearingManufacturer) => void;
  arrangement: BearingArrangement;
  setArrangement: (a: BearingArrangement) => void;
  maxBoreMm: number | "";
  setMaxBoreMm: (v: number | "") => void;
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
  lubricationClass,
  setLubricationClass,
  manufacturer,
  setManufacturer,
  arrangement,
  setArrangement,
  maxBoreMm,
  setMaxBoreMm,
  onCalculate,
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const catalogOptions = bearingsOfType(bearingType, manufacturer);
  const selected = findBearing(designation);

  return (
    <CalculatorInputPanel
      title="Bearing calculator"
      description="ISO 281 basic and modified rating life, ISO 76 static check, and catalog speed margin."
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

      <div className={`${calculatorInputGridClass}`}>
        <CalculatorUnitField
          label="Radial load Fr"
          value={radialLoad}
          onChange={setRadialLoad}
          unit={
            <ModuleUnitSelect moduleId="bearings" fieldKey="load" value={radialUnit} onChange={setRadialUnit} />
          }
        />
        <CalculatorUnitField
          label="Axial load Fa"
          value={axialLoad}
          onChange={setAxialLoad}
          unit={
            <ModuleUnitSelect moduleId="bearings" fieldKey="load" value={axialUnit} onChange={setAxialUnit} />
          }
        />
        <CalculatorUnitField
          label="Speed n"
          value={speed}
          onChange={setSpeed}
          min={0}
          unit={<span className="text-sm text-slate-500">RPM</span>}
        />
        <CalculatorUnitField
          label="Required rating life L10h"
          value={lifeHours}
          onChange={setLifeHours}
          min={0}
          unit={<span className="text-sm text-slate-500">h</span>}
        />
        <label className="space-y-2 text-sm text-slate-700">
          <span>Life safety factor on C</span>
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
        <span>Manufacturer</span>
        <select
          value={manufacturer}
          onChange={(event) => setManufacturer(event.target.value as BearingManufacturer)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          {BEARING_MANUFACTURERS.map((mfr) => (
            <option key={mfr} value={mfr}>
              {BEARING_MANUFACTURER_LABELS[mfr]}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Catalog bearing</span>
        <select
          value={designation}
          onChange={(event) => setDesignation(event.target.value)}
          className="w-full rounded border border-slate-300 bg-white px-3 py-2"
        >
          {catalogOptions.map((entry) => (
            <option key={entry.designation} value={entry.designation}>
              {entry.designation} — d {entry.boreMm} mm, C {(entry.dynamicRatingN / 1000).toFixed(1)} kN, C₀{" "}
              {(entry.staticRatingN / 1000).toFixed(1)} kN
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <p className="text-xs text-slate-500">
          {BEARING_MANUFACTURER_LABELS[selected.manufacturer]} · {selected.designation}: d={selected.boreMm} D=
          {selected.outerDiameterMm} B={selected.widthMm} mm · n_lim={selected.limitingSpeedRpm} RPM
        </p>
      )}

      <div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Mounting arrangement</span>
          <select
            value={arrangement}
            onChange={(event) => setArrangement(event.target.value as BearingArrangement)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="single">Single bearing</option>
            <option value="back_to_back">Back-to-back (O)</option>
            <option value="face_to_face">Face-to-face (X)</option>
            <option value="tandem">Tandem (T)</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
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
        <label className="space-y-2 text-sm text-slate-700">
          <span>Modified life lubrication (a_ISO screening)</span>
          <select
            value={lubricationClass}
            onChange={(event) => setLubricationClass(event.target.value as LubricationClass | "")}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Basic L10 only (a_ISO = 1)</option>
            <option value="poor">Poor (a_ISO ≈ 0.15)</option>
            <option value="average">Average (a_ISO ≈ 0.5)</option>
            <option value="good">Good (a_ISO ≈ 1.0)</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Max bore from shaft (design mode hint, mm)</span>
          <input
            type="number"
            value={maxBoreMm}
            onChange={(event) =>
              setMaxBoreMm(event.target.value === "" ? "" : Number(event.target.value))
            }
            placeholder="Optional"
            className={calculatorNumberInputClass}
          />
        </label>
      </div>
    </CalculatorInputPanel>
  );
}
