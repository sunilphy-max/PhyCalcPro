import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorSelectField from "@/components/calculator/CalculatorSelectField";
import CalculatorFormSection from "@/components/calculator/CalculatorFormSection";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import {
  calculatorFieldLabelClass,
  calculatorInputGridClass,
  calculatorNumberInputClass,
  calculatorTextInputClass,
} from "@/components/calculator/styles";
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
  BearingPreloadClass,
} from "@/lib/machine/bearings/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import BearingTypePicker from "@/components/machine/bearings/BearingTypePicker";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";
import BearingInputTabs, { type BearingInputTabId } from "@/components/machine/bearings/BearingInputTabs";
import BearingMountingSystem, { type BearingMountingSystemId } from "@/components/machine/bearings/BearingMountingSystem";
import BearingArrangementGuide from "@/components/machine/bearings/BearingArrangementGuide";
import BearingCatalogDetail from "@/components/machine/bearings/BearingCatalogDetail";
import {
  bearingCatalog,
  findBearing,
  filterCatalog,
  uniqueSeries,
  uniqueTypes,
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
  maxWidthMm?: number | "";
  setMaxWidthMm?: (v: number | "") => void;
  floatingDesignation?: string;
  setFloatingDesignation?: (v: string) => void;
  preloadClass?: BearingPreloadClass;
  setPreloadClass?: (v: BearingPreloadClass) => void;
  bearingSpanMm?: number;
  setBearingSpanMm?: (v: number) => void;
  availableFloatMm?: number;
  setAvailableFloatMm?: (v: number) => void;
  useThermalEquilibrium?: boolean;
  setUseThermalEquilibrium?: (v: boolean) => void;
  stationRadialLoadsN?: number[];
  workflowMode?: DesignWorkflowMode;
  mountingSystem?: BearingMountingSystemId;
  onMountingSystemChange?: (id: BearingMountingSystemId) => void;
  onSuggestBearingType?: (type: BearingType) => void;
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
  maxWidthMm = "",
  setMaxWidthMm,
  floatingDesignation = "",
  setFloatingDesignation,
  preloadClass = "none",
  setPreloadClass,
  bearingSpanMm = 400,
  setBearingSpanMm,
  availableFloatMm = 1,
  setAvailableFloatMm,
  useThermalEquilibrium = true,
  setUseThermalEquilibrium,
  stationRadialLoadsN,
  workflowMode,
  mountingSystem = "single",
  onMountingSystemChange,
  onSuggestBearingType,
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
          <div className="space-y-4">
            <CalculatorFormSection
              title="Shaft mounting system"
              description="Locating + floating pairs (MITCalc / SKF shaft design step 2)."
            >
              {onMountingSystemChange ? (
                <BearingMountingSystem
                  value={mountingSystem}
                  onChange={onMountingSystemChange}
                  onSuggestType={onSuggestBearingType}
                />
              ) : null}
            </CalculatorFormSection>

            <CalculatorFormSection
              title="Bearing type"
              description="Select the rolling bearing family — SKF bearing selection step 2."
            >
              <BearingTypePicker
                value={bearingType}
                availableTypes={availableTypes}
                onChange={(type) => setBearingType(type)}
              />
            </CalculatorFormSection>

            <BearingReferenceVisual
              bearingType={bearingType}
              sealType={selected?.sealType ?? (sealFilter !== "all" ? sealFilter : "open")}
              arrangement={arrangement}
            />

            <CalculatorFormSection
              title="Application profile"
              description="Optional catalog filter only — does not change ISO 281 / SKF calculation method. Calculation standard comes from the application preset."
            >
              <CalculatorSelectField
                label="Application profile"
                value={applicationProfile}
                hint={profileHint ?? undefined}
                onChange={(value) => {
                  const profile = value as BearingApplicationProfile | "all";
                  setApplicationProfile(profile);
                  setSeriesFilter("all");
                  setSealFilter("all");
                  // Profile only filters catalog options — never forces bearing type.
                }}
              >
                {applicationProfileOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CalculatorSelectField>
            </CalculatorFormSection>
          </div>
        );

      case "loads":
        return (
          <div className="space-y-4">
            <CalculatorFormSection
              title="Steady loads"
              description="Enter radial and axial components. Shock factor scales both for impact duty."
            >
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
                <div className="min-w-0 space-y-1.5">
                  <label className={calculatorFieldLabelClass}>Shock factor Ks</label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    value={shockFactor}
                    onChange={(event) => setShockFactor(Number(event.target.value))}
                    className={calculatorNumberInputClass}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multiplies Fr and Fa for impact / shock duty screening.
                  </p>
                </div>
              </div>
            </CalculatorFormSection>

            <CalculatorFormSection
              title="Loading spectrum (optional)"
              description="ISO 281-1 variable load duty — duration percentages are normalized on calculate."
            >
              <label className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 text-sm font-medium text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={useVariableLoad}
                  onChange={(event) => setUseVariableLoad(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                />
                <span>Enable loading spectrum</span>
              </label>
              {useVariableLoad ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr] gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Load (% of Fr/Fa)</span>
                    <span>Duration (%)</span>
                  </div>
                  {loadSpectrumSteps.map((step, index) => (
                    <div key={index} className="grid min-w-0 grid-cols-2 gap-2">
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
                    className={`text-xs ${Math.abs(spectrumDurationTotal - 100) > 1 ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    Duration total: {spectrumDurationTotal}% (normalized on calculate)
                  </p>
                </div>
              ) : null}
            </CalculatorFormSection>
          </div>
        );

      case "operating":
        return (
          <div className="space-y-4">
            <CalculatorFormSection title="Speed & life target" description="Required rating life and reliability factor a₁.">
              <div className={calculatorInputGridClass}>
                <CalculatorUnitField
                  label="Speed n"
                  value={speed}
                  onChange={setSpeed}
                  min={0}
                  unit={<span className="text-sm text-slate-500">RPM</span>}
                />
                <CalculatorSelectField
                  label="Life target input"
                  value={lifeInputMode}
                  onChange={(value) => setLifeInputMode(value as "hours" | "revolutions")}
                >
                  <option value="hours">Required rating life L10h (hours)</option>
                  <option value="revolutions">Required life (million revolutions)</option>
                </CalculatorSelectField>
                {lifeInputMode === "hours" ? (
                  <CalculatorUnitField
                    label="Required rating life L10h"
                    value={lifeHours}
                    onChange={setLifeHours}
                    min={0}
                    unit={<span className="text-sm text-slate-500">h</span>}
                  />
                ) : (
                  <div className="min-w-0 space-y-1.5">
                    <label className={calculatorFieldLabelClass}>Required life (million rev)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={lifeRevolutions / 1e6}
                      onChange={(event) => setLifeRevolutions(Number(event.target.value) * 1e6)}
                      className={calculatorNumberInputClass}
                    />
                  </div>
                )}
                <div className="min-w-0 space-y-1.5">
                  <label className={calculatorFieldLabelClass}>Life safety factor on C</label>
                  <input
                    type="number"
                    step="0.1"
                    value={safetyFactor}
                    onChange={(event) => setSafetyFactor(Number(event.target.value))}
                    className={calculatorNumberInputClass}
                  />
                </div>
              </div>
            </CalculatorFormSection>

            <BearingArrangementGuide
              arrangement={arrangement}
              onChange={setArrangement}
              bearingType={bearingType}
            />

            {(arrangement === "back_to_back" ||
              arrangement === "face_to_face" ||
              arrangement === "tandem" ||
              mountingSystem === "duplex_angular") &&
            setPreloadClass ? (
              <CalculatorFormSection
                title="Duplex preload"
                description="Preload increases stiffness and adds to axial load for life. O has higher moment stiffness than X."
              >
                <CalculatorSelectField
                  label="Preload class"
                  value={preloadClass}
                  onChange={(value) => setPreloadClass(value as BearingPreloadClass)}
                >
                  <option value="none">None (clearance)</option>
                  <option value="light">Light (~2% of C)</option>
                  <option value="medium">Medium (~5% of C)</option>
                  <option value="heavy">Heavy (~10% of C)</option>
                </CalculatorSelectField>
              </CalculatorFormSection>
            ) : null}

            {(mountingSystem === "locating_dg_floating_nu" ||
              mountingSystem === "locating_ac_floating_nu") &&
            setBearingSpanMm ? (
              <CalculatorFormSection
                title="Thermal expansion (locating + floating)"
                description="Floating NU must accommodate shaft–housing differential growth over the bearing span."
              >
                {stationRadialLoadsN && stationRadialLoadsN.length >= 2 ? (
                  <p className="mb-2 rounded-lg border border-emerald-200/70 bg-emerald-50/60 px-2.5 py-1.5 text-[11px] text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                    Shaft FBD reactions applied: Fr₀ = {(stationRadialLoadsN[0]! / 1000).toFixed(2)}{" "}
                    kN (locating), Fr₁ = {(stationRadialLoadsN[1]! / 1000).toFixed(2)} kN (floating).
                  </p>
                ) : (
                  <p className="mb-2 text-[11px] text-slate-500">
                    Without shaft handoff, radial load is split Fr/2 per station. Run Shaft Analysis to
                    import true support reactions.
                  </p>
                )}
                <div className={calculatorInputGridClass}>
                  <CalculatorUnitField
                    label="Bearing span L"
                    value={bearingSpanMm}
                    onChange={setBearingSpanMm}
                    min={0}
                    unit={<span className="text-sm text-slate-500">mm</span>}
                  />
                  <CalculatorUnitField
                    label="Available float"
                    value={availableFloatMm}
                    onChange={setAvailableFloatMm ?? (() => undefined)}
                    min={0}
                    unit={<span className="text-sm text-slate-500">mm</span>}
                  />
                </div>
              </CalculatorFormSection>
            ) : null}

            <CalculatorFormSection title="Mounting & reliability">
              <div className={calculatorInputGridClass}>
                <CalculatorSelectField
                  label="Mounting arrangement (detail)"
                  value={arrangement}
                  onChange={(value) => setArrangement(value as BearingArrangement)}
                >
                  <option value="single">Single bearing</option>
                  <option value="back_to_back">Back-to-back (O)</option>
                  <option value="face_to_face">Face-to-face (X)</option>
                  <option value="tandem">Tandem (T)</option>
                </CalculatorSelectField>
                <CalculatorSelectField
                  label="Internal clearance (ISO)"
                  value={clearanceOverride || selected?.clearance || "CN"}
                  onChange={(value) =>
                    setClearanceOverride(
                      value === (selected?.clearance ?? "CN") ? "" : (value as BearingClearance)
                    )
                  }
                >
                  <option value="C2">C2 (tight)</option>
                  <option value="CN">CN (normal)</option>
                  <option value="C3">C3 (greater than normal)</option>
                  <option value="C4">C4 (loose)</option>
                </CalculatorSelectField>
                <CalculatorSelectField
                  label="Reliability (ISO 281 a1)"
                  value={String(reliability)}
                  onChange={(value) => setReliability(Number(value) as BearingReliability)}
                >
                  <option value="90">90% (a1 = 1.00)</option>
                  <option value="95">95% (a1 = 0.64)</option>
                  <option value="96">96% (a1 = 0.55)</option>
                  <option value="97">97% (a1 = 0.47)</option>
                  <option value="98">98% (a1 = 0.37)</option>
                  <option value="99">99% (a1 = 0.25)</option>
                </CalculatorSelectField>
              </div>
            </CalculatorFormSection>

            <CalculatorFormSection
              title="Lubrication & environment"
              description="Modified life a_ISO uses viscosity ratio κ and contamination factor eC."
            >
              <div className={calculatorInputGridClass}>
                <CalculatorSelectField
                  label="Lubricant"
                  value={lubricantType}
                  onChange={(value) => setLubricantType(value as LubricantType)}
                >
                  <option value="none">Basic L10 only (aISO = 1)</option>
                  <option value="oil">Oil (ISO VG)</option>
                  <option value="grease">Grease (base oil VG)</option>
                </CalculatorSelectField>
                {lubricantType !== "none" ? (
                  <>
                    <CalculatorSelectField
                      label="ISO VG grade @ 40 °C"
                      value={String(isoVgGrade)}
                      onChange={(value) => setIsoVgGrade(Number(value))}
                    >
                      {[10, 15, 22, 32, 46, 68, 100, 150, 220].map((vg) => (
                        <option key={vg} value={vg}>
                          VG {vg}
                        </option>
                      ))}
                    </CalculatorSelectField>
                    <div className="min-w-0 space-y-1.5">
                      <label className={calculatorFieldLabelClass}>Operating temperature (°C)</label>
                      <input
                        type="number"
                        value={operatingTempC}
                        onChange={(event) => setOperatingTempC(Number(event.target.value))}
                        className={calculatorNumberInputClass}
                      />
                    </div>
                    <CalculatorSelectField
                      label="Contamination"
                      value={contamination}
                      onChange={(value) => setContamination(value as ContaminationLevel)}
                    >
                      <option value="extreme_clean">Clean</option>
                      <option value="high_clean">High cleanliness</option>
                      <option value="normal_clean">Moderate</option>
                      <option value="slight_contamination">Slight contamination</option>
                      <option value="typical_contamination">Typical / severe</option>
                      <option value="heavy_contamination">Heavy contamination</option>
                    </CalculatorSelectField>
                  </>
                ) : (
                  <CalculatorSelectField
                    label="Legacy lubrication screening (optional)"
                    value={lubricationClass}
                    onChange={(value) => setLubricationClass(value as LubricationClass | "")}
                  >
                    <option value="">—</option>
                    <option value="poor">Poor</option>
                    <option value="average">Average</option>
                    <option value="good">Good</option>
                  </CalculatorSelectField>
                )}
                {lubricantType !== "none" && setUseThermalEquilibrium ? (
                  <div className="col-span-full flex items-start gap-2 rounded-lg border border-orange-200/70 bg-orange-50/50 p-2.5 text-xs dark:border-orange-900/40 dark:bg-orange-950/20">
                    <input
                      id="thermal-eq"
                      type="checkbox"
                      checked={useThermalEquilibrium}
                      onChange={(e) => setUseThermalEquilibrium(e.target.checked)}
                      className="mt-0.5"
                    />
                    <label htmlFor="thermal-eq" className="leading-relaxed text-slate-600 dark:text-slate-300">
                      Use thermal equilibrium for life (friction power → ΔT → ν → κ / aSKF). Uncheck to
                      force the temperature entered above.
                    </label>
                  </div>
                ) : null}
              </div>
            </CalculatorFormSection>
          </div>
        );

      case "selection":
        return (
          <div className="space-y-4">
            <CalculatorFormSection
              title="Catalog filters"
              description="Narrow manufacturer, series, and sealing before picking a designation."
            >
              <div className={calculatorInputGridClass}>
                <CalculatorSelectField
                  label="Manufacturer"
                  value={manufacturer}
                  onChange={(value) => setManufacturer(value as BearingManufacturer)}
                >
                  {BEARING_MANUFACTURERS.map((mfr) => (
                    <option key={mfr} value={mfr}>
                      {BEARING_MANUFACTURER_LABELS[mfr]}
                    </option>
                  ))}
                </CalculatorSelectField>
                <CalculatorSelectField
                  label="Series"
                  value={seriesFilter}
                  onChange={(value) => setSeriesFilter(value)}
                >
                  <option value="all">All series</option>
                  {seriesOptions.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </CalculatorSelectField>
                <CalculatorSelectField
                  label="Sealing"
                  value={sealFilter}
                  onChange={(value) => setSealFilter(value as BearingSealType | "all")}
                >
                  <option value="all">All seals</option>
                  {(Object.keys(SEAL_TYPE_LABELS) as BearingSealType[]).map((seal) => (
                    <option key={seal} value={seal}>
                      {SEAL_TYPE_LABELS[seal]}
                    </option>
                  ))}
                </CalculatorSelectField>
              </div>
            </CalculatorFormSection>

            <CalculatorFormSection title="Catalog designation">
              <CalculatorSelectField
                label="Bearing designation"
                value={designation}
                onChange={(value) => setDesignation(value)}
              >
                {catalogOptions.map((entry) => (
                  <option key={entry.designation} value={entry.designation}>
                    {entry.designation} — d {entry.boreMm} mm, D {entry.outerDiameterMm} mm, C{" "}
                    {(entry.dynamicRatingN / 1000).toFixed(1)} kN
                    {entry.sealType !== "open" ? ` · ${SEAL_TYPE_LABELS[entry.sealType]}` : ""}
                  </option>
                ))}
              </CalculatorSelectField>

              {selected ? <BearingCatalogDetail entry={selected} /> : null}
            </CalculatorFormSection>

            {(mountingSystem === "locating_dg_floating_nu" ||
              mountingSystem === "locating_ac_floating_nu") &&
            setFloatingDesignation ? (
              <CalculatorFormSection
                title="Floating station designation"
                description="NU / NJ cylindrical roller for the non-locating end — sized separately from the locating bearing."
              >
                <CalculatorSelectField
                  label="Floating bearing"
                  value={floatingDesignation}
                  onChange={setFloatingDesignation}
                >
                  <option value="">Auto-recommend</option>
                  {bearingCatalog
                    .filter(
                      (e) =>
                        e.manufacturer === manufacturer &&
                        (e.type === "cylindrical_roller" ||
                          e.type === "cylindrical_nj" ||
                          e.type === "cylindrical_nup")
                    )
                    .map((entry) => (
                      <option key={entry.designation} value={entry.designation}>
                        {entry.designation} — d {entry.boreMm} · C{" "}
                        {(entry.dynamicRatingN / 1000).toFixed(1)} kN
                      </option>
                    ))}
                </CalculatorSelectField>
              </CalculatorFormSection>
            ) : null}

            <CalculatorFormSection title="Envelope limits (optional)">
              <div className={calculatorInputGridClass}>
                <div className="min-w-0 space-y-1.5">
                  <label className={calculatorFieldLabelClass}>Max bore from shaft (mm)</label>
                  <input
                    type="number"
                    value={maxBoreMm}
                    onChange={(event) =>
                      setMaxBoreMm(event.target.value === "" ? "" : Number(event.target.value))
                    }
                    placeholder="Optional"
                    className={calculatorNumberInputClass}
                  />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <label className={calculatorFieldLabelClass}>Max outer diameter D (mm)</label>
                  <input
                    type="number"
                    value={maxOuterMm}
                    onChange={(event) =>
                      setMaxOuterMm(event.target.value === "" ? "" : Number(event.target.value))
                    }
                    placeholder="Optional"
                    className={calculatorNumberInputClass}
                  />
                </div>
                {setMaxWidthMm ? (
                  <div className="min-w-0 space-y-1.5">
                    <label className={calculatorFieldLabelClass}>Max width B (mm)</label>
                    <input
                      type="number"
                      value={maxWidthMm}
                      onChange={(event) =>
                        setMaxWidthMm(event.target.value === "" ? "" : Number(event.target.value))
                      }
                      placeholder="Optional"
                      className={calculatorNumberInputClass}
                    />
                  </div>
                ) : null}
              </div>
            </CalculatorFormSection>
          </div>
        );
    }
  };

  return (
    <CalculatorInputPanel
      title="Rolling bearing calculator"
      description="SKF rating life (ISO 281:2007), ISO 76 static check, and multi-manufacturer catalog selection."
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
        <div className="min-w-0 space-y-1.5">
          <label className={calculatorFieldLabelClass}>Project name</label>
          <input
            type="text"
            value={projectName ?? ""}
            onChange={(event) => setProjectName(event.target.value)}
            className={calculatorTextInputClass}
          />
        </div>
      ) : null}

      <BearingInputTabs>{renderTab}</BearingInputTabs>
    </CalculatorInputPanel>
  );
}
