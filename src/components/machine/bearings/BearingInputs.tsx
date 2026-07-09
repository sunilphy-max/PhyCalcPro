import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { calculatorInputGridClass, calculatorNumberInputClass } from "@/components/calculator/styles";
import type {
  BearingType,
  BearingReliability,
  LubricationClass,
  BearingManufacturer,
  BearingArrangement,
  BearingApplicationProfile,
  BearingSealType,
  BearingClearance,
  ContaminationLevel,
  LubricantType,
} from "@/lib/machine/bearings/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";
import BearingInputTabs, { type BearingInputTabId } from "@/components/machine/bearings/BearingInputTabs";
import {
  bearingCatalog,
  findBearing,
  filterCatalog,
  uniqueSeries,
  uniqueTypes,
  suggestedTypeForApplication,
  applicationProfileOptions,
  APPLICATION_PROFILE_META,
  BEARING_MANUFACTURERS,
  BEARING_MANUFACTURER_LABELS,
  BEARING_TYPE_LABELS,
  SEAL_TYPE_LABELS,
} from "@/data/catalogs/bearingCatalog";

export type LoadSpectrumUiStep = {
  loadPercent: number;
  durationPercent: number;
};

type Props = {
  radialLoad: number;
  setRadialLoad: Dispatch<SetStateAction<number>>;
  radialUnit: string;
  setRadialUnit: Dispatch<SetStateAction<string>>;
  axialLoad: number;
  setAxialLoad: Dispatch<SetStateAction<number>>;
  axialUnit: string;
  setAxialUnit: Dispatch<SetStateAction<string>>;
  shockFactor: number;
  setShockFactor: Dispatch<SetStateAction<number>>;
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  lifeHours: number;
  setLifeHours: Dispatch<SetStateAction<number>>;
  lifeInputMode: "hours" | "revolutions";
  setLifeInputMode: Dispatch<SetStateAction<"hours" | "revolutions">>;
  lifeRevolutions: number;
  setLifeRevolutions: Dispatch<SetStateAction<number>>;
  safetyFactor: number;
  setSafetyFactor: Dispatch<SetStateAction<number>>;
  applicationProfile: BearingApplicationProfile | "all";
  setApplicationProfile: (profile: BearingApplicationProfile | "all") => void;
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
  seriesFilter: string | "all";
  setSeriesFilter: (series: string | "all") => void;
  sealFilter: BearingSealType | "all";
  setSealFilter: (seal: BearingSealType | "all") => void;
  arrangement: BearingArrangement;
  setArrangement: (a: BearingArrangement) => void;
  lubricantType: LubricantType;
  setLubricantType: (v: LubricantType) => void;
  isoVgGrade: number;
  setIsoVgGrade: (v: number) => void;
  operatingTempC: number;
  setOperatingTempC: (v: number) => void;
  contamination: ContaminationLevel;
  setContamination: (v: ContaminationLevel) => void;
  clearanceOverride: BearingClearance | "";
  setClearanceOverride: (v: BearingClearance | "") => void;
  useVariableLoad: boolean;
  setUseVariableLoad: (v: boolean) => void;
  loadSpectrumSteps: LoadSpectrumUiStep[];
  setLoadSpectrumSteps: Dispatch<SetStateAction<LoadSpectrumUiStep[]>>;
  maxBoreMm: number | "";
  setMaxBoreMm: (v: number | "") => void;
  maxOuterMm: number | "";
  setMaxOuterMm: (v: number | "") => void;
  workflowMode?: DesignWorkflowMode;
  onCalculate: () => void;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
};

function calculateLabelForMode(mode?: DesignWorkflowMode): string {
  if (mode === "design") return "Auto-design bearing";
  if (mode === "diagnose") return "Diagnose failure risk";
  if (mode === "select") return "Compare bearing options";
  return "Calculate bearing life";
}

export default function BearingInputs({
  radialLoad,
  setRadialLoad,
  radialUnit,
  setRadialUnit,
  axialLoad,
  setAxialLoad,
  axialUnit,
  setAxialUnit,
  shockFactor,
  setShockFactor,
  speed,
  setSpeed,
  lifeHours,
  setLifeHours,
  lifeInputMode,
  setLifeInputMode,
  lifeRevolutions,
  setLifeRevolutions,
  safetyFactor,
  setSafetyFactor,
  applicationProfile,
  setApplicationProfile,
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
  seriesFilter,
  setSeriesFilter,
  sealFilter,
  setSealFilter,
  arrangement,
  setArrangement,
  lubricantType,
  setLubricantType,
  isoVgGrade,
  setIsoVgGrade,
  operatingTempC,
  setOperatingTempC,
  contamination,
  setContamination,
  clearanceOverride,
  setClearanceOverride,
  useVariableLoad,
  setUseVariableLoad,
  loadSpectrumSteps,
  setLoadSpectrumSteps,
  maxBoreMm,
  setMaxBoreMm,
  maxOuterMm,
  setMaxOuterMm,
  workflowMode,
  onCalculate,
  onSave,
  saving = false,
  projectName,
  setProjectName,
}: Props) {
  const manufacturerPool = useMemo(
    () => filterCatalog(bearingCatalog, { manufacturer, applicationProfile }),
    [manufacturer, applicationProfile]
  );

  const availableTypes = useMemo(() => uniqueTypes(manufacturerPool), [manufacturerPool]);

  const typePool = useMemo(
    () => filterCatalog(bearingCatalog, { manufacturer, applicationProfile, type: bearingType }),
    [manufacturer, applicationProfile, bearingType]
  );

  const seriesOptions = useMemo(() => uniqueSeries(typePool), [typePool]);

  const catalogOptions = useMemo(
    () =>
      filterCatalog(bearingCatalog, {
        manufacturer,
        applicationProfile,
        type: bearingType,
        series: seriesFilter,
        sealType: sealFilter,
      }).filter((entry) => (maxOuterMm === "" ? true : entry.outerDiameterMm <= maxOuterMm)),
    [manufacturer, applicationProfile, bearingType, seriesFilter, sealFilter, maxOuterMm]
  );

  const selected = findBearing(designation);
  const profileHint =
    applicationProfile !== "all" ? APPLICATION_PROFILE_META[applicationProfile].description : null;

  const spectrumDurationTotal = loadSpectrumSteps.reduce((sum, step) => sum + step.durationPercent, 0);

  const renderTab = (tab: BearingInputTabId) => {
    switch (tab) {
      case "application":
        return (
          <div className="space-y-3">
            <BearingReferenceVisual
              bearingType={bearingType}
              sealType={selected?.sealType ?? (sealFilter !== "all" ? sealFilter : "open")}
              arrangement={arrangement}
            />
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Application profile</span>
              <select
                value={applicationProfile}
                onChange={(event) => {
                  const profile = event.target.value as BearingApplicationProfile | "all";
                  setApplicationProfile(profile);
                  setSeriesFilter("all");
                  setSealFilter("all");
                  if (profile !== "all") {
                    const pool = filterCatalog(bearingCatalog, { manufacturer, applicationProfile: profile });
                    const types = uniqueTypes(pool);
                    const suggested = suggestedTypeForApplication(profile, types);
                    if (suggested) {
                      setBearingType(suggested);
                      const first = filterCatalog(bearingCatalog, {
                        manufacturer,
                        applicationProfile: profile,
                        type: suggested,
                      })[0];
                      if (first) setDesignation(first.designation);
                    }
                  }
                }}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2"
              >
                {applicationProfileOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {profileHint ? <p className="text-xs text-slate-500">{profileHint}</p> : null}
            </label>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>Bearing family / type</span>
              <select
                value={bearingType}
                onChange={(event) => setBearingType(event.target.value as BearingType)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2"
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {BEARING_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );

      case "loads":
        return (
          <div className="space-y-4">
            <div className={calculatorInputGridClass}>
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
              <label className="space-y-2 text-sm text-slate-700">
                <span>Shock factor Ks</span>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  value={shockFactor}
                  onChange={(event) => setShockFactor(Number(event.target.value))}
                  className={calculatorNumberInputClass}
                />
                <p className="text-xs text-slate-500">Multiplies Fr and Fa for impact / shock duty screening.</p>
              </label>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={useVariableLoad}
                  onChange={(event) => setUseVariableLoad(event.target.checked)}
                />
                <span>Loading spectrum (ISO 281-1)</span>
              </label>
              {useVariableLoad ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr] gap-2 text-xs font-semibold uppercase text-slate-500">
                    <span>Load (% of Fr/Fa)</span>
                    <span>Duration (%)</span>
                  </div>
                  {loadSpectrumSteps.map((step, index) => (
                    <div key={index} className={`${calculatorInputGridClass}`}>
                      <input
                        type="number"
                        min={10}
                        max={300}
                        value={step.loadPercent}
                        onChange={(event) => {
                          const next = [...loadSpectrumSteps];
                          next[index] = { ...step, loadPercent: Number(event.target.value) };
                          setLoadSpectrumSteps(next);
                        }}
                        className={calculatorNumberInputClass}
                        aria-label={`Load step ${index + 1} percent`}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={step.durationPercent}
                        onChange={(event) => {
                          const next = [...loadSpectrumSteps];
                          next[index] = { ...step, durationPercent: Number(event.target.value) };
                          setLoadSpectrumSteps(next);
                        }}
                        className={calculatorNumberInputClass}
                        aria-label={`Load step ${index + 1} duration percent`}
                      />
                    </div>
                  ))}
                  <p
                    className={`text-xs ${Math.abs(spectrumDurationTotal - 100) > 1 ? "text-amber-700" : "text-slate-500"}`}
                  >
                    Duration total: {spectrumDurationTotal}% (normalized on calculate)
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        );

      case "operating":
        return (
          <div className="space-y-4">
            <div className={calculatorInputGridClass}>
              <CalculatorUnitField
                label="Speed n"
                value={speed}
                onChange={setSpeed}
                min={0}
                unit={<span className="text-sm text-slate-500">RPM</span>}
              />
              <label className="space-y-2 text-sm text-slate-700">
                <span>Life target input</span>
                <select
                  value={lifeInputMode}
                  onChange={(event) =>
                    setLifeInputMode(event.target.value as "hours" | "revolutions")
                  }
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="hours">Required rating life L10h (hours)</option>
                  <option value="revolutions">Required life (million revolutions)</option>
                </select>
              </label>
              {lifeInputMode === "hours" ? (
                <CalculatorUnitField
                  label="Required rating life L10h"
                  value={lifeHours}
                  onChange={setLifeHours}
                  min={0}
                  unit={<span className="text-sm text-slate-500">h</span>}
                />
              ) : (
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Required life (million rev)</span>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={lifeRevolutions / 1e6}
                    onChange={(event) => setLifeRevolutions(Number(event.target.value) * 1e6)}
                    className={calculatorNumberInputClass}
                  />
                </label>
              )}
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
            </div>

            <div className={calculatorInputGridClass}>
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
                <span>Internal clearance (ISO)</span>
                <select
                  value={clearanceOverride || selected?.clearance || "CN"}
                  onChange={(event) =>
                    setClearanceOverride(
                      event.target.value === (selected?.clearance ?? "CN")
                        ? ""
                        : (event.target.value as BearingClearance)
                    )
                  }
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="C2">C2 (tight)</option>
                  <option value="CN">CN (normal)</option>
                  <option value="C3">C3 (greater than normal)</option>
                  <option value="C4">C4 (loose)</option>
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
            </div>

            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-3 dark:border-violet-900/40 dark:bg-violet-950/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-200">
                Lubrication & environment
              </p>
              <div className={calculatorInputGridClass}>
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Lubricant</span>
                  <select
                    value={lubricantType}
                    onChange={(event) => setLubricantType(event.target.value as LubricantType)}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                  >
                    <option value="none">Basic L10 only (aISO = 1)</option>
                    <option value="oil">Oil (ISO VG)</option>
                    <option value="grease">Grease (base oil VG)</option>
                  </select>
                </label>
                {lubricantType !== "none" ? (
                  <>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>ISO VG grade @ 40 °C</span>
                      <select
                        value={isoVgGrade}
                        onChange={(event) => setIsoVgGrade(Number(event.target.value))}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                      >
                        {[10, 15, 22, 32, 46, 68, 100, 150, 220].map((vg) => (
                          <option key={vg} value={vg}>
                            VG {vg}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Operating temperature (°C)</span>
                      <input
                        type="number"
                        value={operatingTempC}
                        onChange={(event) => setOperatingTempC(Number(event.target.value))}
                        className={calculatorNumberInputClass}
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-700">
                      <span>Contamination</span>
                      <select
                        value={contamination}
                        onChange={(event) => setContamination(event.target.value as ContaminationLevel)}
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                      >
                        <option value="extreme_clean">Clean</option>
                        <option value="high_clean">High cleanliness</option>
                        <option value="normal_clean">Moderate</option>
                        <option value="slight_contamination">Slight contamination</option>
                        <option value="typical_contamination">Typical / severe</option>
                        <option value="heavy_contamination">Heavy contamination</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Legacy lubrication screening (optional)</span>
                    <select
                      value={lubricationClass}
                      onChange={(event) => setLubricationClass(event.target.value as LubricationClass | "")}
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="">—</option>
                      <option value="poor">Poor</option>
                      <option value="average">Average</option>
                      <option value="good">Good</option>
                    </select>
                  </label>
                )}
              </div>
            </div>
          </div>
        );

      case "selection":
        return (
          <div className="space-y-3">
            <div className={calculatorInputGridClass}>
              <label className="space-y-2 text-sm text-slate-700">
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
              <label className="space-y-2 text-sm text-slate-700">
                <span>Series</span>
                <select
                  value={seriesFilter}
                  onChange={(event) => setSeriesFilter(event.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="all">All series</option>
                  {seriesOptions.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>Sealing</span>
                <select
                  value={sealFilter}
                  onChange={(event) => setSealFilter(event.target.value as BearingSealType | "all")}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="all">All seals</option>
                  {(Object.keys(SEAL_TYPE_LABELS) as BearingSealType[]).map((seal) => (
                    <option key={seal} value={seal}>
                      {SEAL_TYPE_LABELS[seal]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2 text-sm text-slate-700">
              <span>Catalog designation</span>
              <select
                value={designation}
                onChange={(event) => setDesignation(event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2"
              >
                {catalogOptions.map((entry) => (
                  <option key={entry.designation} value={entry.designation}>
                    {entry.designation} — d {entry.boreMm} mm, D {entry.outerDiameterMm} mm, C{" "}
                    {(entry.dynamicRatingN / 1000).toFixed(1)} kN
                    {entry.sealType !== "open" ? ` · ${SEAL_TYPE_LABELS[entry.sealType]}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {selected ? (
              <p className="text-xs text-slate-600">
                {BEARING_MANUFACTURER_LABELS[selected.manufacturer]} · {BEARING_TYPE_LABELS[selected.type]} · series{" "}
                {selected.series} · d={selected.boreMm} D={selected.outerDiameterMm} B={selected.widthMm} mm · n_lim=
                {selected.limitingSpeedRpm} RPM
              </p>
            ) : null}

            <div className={calculatorInputGridClass}>
              <label className="space-y-2 text-sm text-slate-700">
                <span>Max bore from shaft (mm)</span>
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
              <label className="space-y-2 text-sm text-slate-700">
                <span>Max outer diameter D (mm)</span>
                <input
                  type="number"
                  value={maxOuterMm}
                  onChange={(event) =>
                    setMaxOuterMm(event.target.value === "" ? "" : Number(event.target.value))
                  }
                  placeholder="Optional"
                  className={calculatorNumberInputClass}
                />
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <CalculatorInputPanel
      title="Bearing calculator"
      description="ISO 281 basic and modified rating life, ISO 76 static check, and catalog speed margin."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={onCalculate}
            label={calculateLabelForMode(workflowMode)}
            designAware
          />
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

      <BearingInputTabs>{renderTab}</BearingInputTabs>
    </CalculatorInputPanel>
  );
}
