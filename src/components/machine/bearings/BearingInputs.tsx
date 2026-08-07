import { useMemo, useState } from "react";
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
import type {
  BearingLifeMethod,
  RollingElementMaterial,
} from "@/lib/machine/bearings/types";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import BearingTypePicker from "@/components/machine/bearings/BearingTypePicker";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";
import BearingDesignerSpine from "@/components/machine/bearings/BearingDesignerSpine";
import BearingCatalogDetail from "@/components/machine/bearings/BearingCatalogDetail";
import BearingSystemWizard, {
  BearingSystemWizardButton,
  type BearingSystemWizardValues,
} from "@/components/machine/bearings/BearingSystemWizard";
import BearingSystemStationsPanel from "@/components/machine/bearings/BearingSystemStationsPanel";
import BearingMethodLadder from "@/components/machine/bearings/BearingMethodLadder";
import type { BearingConfig } from "@/lib/machine/bearings/types";
import type {
  BearingDesignerIntent,
  BearingDesignerStageId,
  BearingMountingSystemId,
} from "@/lib/machine/bearings/bearingProject";
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
  SEAL_TYPE_LABELS,
  type BearingUnitSystem,
} from "@/data/catalogs/bearingCatalog";
import { toBase } from "@/lib/units/conversions";

export type LoadSpectrumUiStep = {
  loadPercent: number;
  durationPercent: number;
  speedRpm?: number;
};

type Props = {
  uiComplexity?: "simple" | "expert";
  setUiComplexity?: Dispatch<SetStateAction<"simple" | "expert">>;
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
  unitSystemFilter: BearingUnitSystem | "all";
  setUnitSystemFilter: (unit: BearingUnitSystem | "all") => void;
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
  lifeMethod: BearingLifeMethod;
  setLifeMethod: (v: BearingLifeMethod) => void;
  misalignmentAngleMrad: number | "";
  setMisalignmentAngleMrad: (v: number | "") => void;
  rollingElementMaterial: RollingElementMaterial;
  setRollingElementMaterial: (v: RollingElementMaterial) => void;
  stationRadialLoadsN?: number[];
  stationSlopesMrad?: number[];
  onSwapStations?: () => void;
  handoffAxialWarning?: boolean;
  ratingsOverrideEnabled?: boolean;
  setRatingsOverrideEnabled?: (v: boolean) => void;
  overrideC?: number;
  setOverrideC?: (v: number) => void;
  overrideC0?: number;
  setOverrideC0?: (v: number) => void;
  overridePu?: number;
  setOverridePu?: (v: number) => void;
  overrideNote?: string;
  setOverrideNote?: (v: string) => void;
  innerRingTempC?: number | "";
  setInnerRingTempC?: (v: number | "") => void;
  outerRingTempC?: number | "";
  setOuterRingTempC?: (v: number | "") => void;
  systemWizardSizingConfig?: BearingConfig;
  onSystemWizardApply?: (values: BearingSystemWizardValues) => void;
  workflowMode?: DesignWorkflowMode;
  mountingSystem?: BearingMountingSystemId;
  onMountingSystemChange?: (id: BearingMountingSystemId) => void;
  onSuggestBearingType?: (type: BearingType) => void;
  onCalculate: () => void;
  onSave?: () => void;
  saving?: boolean;
  projectName?: string;
  setProjectName?: (name: string) => void;
  /** System Designer persona intent */
  designerIntent?: BearingDesignerIntent;
  designerStage?: BearingDesignerStageId;
  onDesignerStageChange?: (stage: BearingDesignerStageId) => void;
};

function calculateLabelForMode(mode?: DesignWorkflowMode): string {
  if (mode === "design") return "Auto-design bearing";
  if (mode === "diagnose") return "Diagnose failure risk";
  if (mode === "select") return "Compare bearing options";
  return "Calculate bearing life";
}

export default function BearingInputs({
  uiComplexity = "expert",
  setUiComplexity,
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
  unitSystemFilter,
  setUnitSystemFilter,
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
  lifeMethod,
  setLifeMethod,
  misalignmentAngleMrad,
  setMisalignmentAngleMrad,
  rollingElementMaterial,
  setRollingElementMaterial,
  stationRadialLoadsN,
  stationSlopesMrad,
  onSwapStations,
  handoffAxialWarning = false,
  ratingsOverrideEnabled = false,
  setRatingsOverrideEnabled,
  overrideC = 0,
  setOverrideC,
  overrideC0 = 0,
  setOverrideC0,
  overridePu = 0,
  setOverridePu,
  overrideNote = "",
  setOverrideNote,
  innerRingTempC = "",
  setInnerRingTempC,
  outerRingTempC = "",
  setOuterRingTempC,
  systemWizardSizingConfig,
  onSystemWizardApply,
  workflowMode,
  mountingSystem = "single",
  onMountingSystemChange,
  onSuggestBearingType,
  onCalculate,
  onSave,
  saving = false,
  projectName,
  setProjectName,
  designerIntent = "design",
  designerStage,
  onDesignerStageChange,
}: Props) {
  const [ratingsPanelOpen, setRatingsPanelOpen] = useState(ratingsOverrideEnabled);
  const [wizardOpen, setWizardOpen] = useState(false);

  const isLocatingSystem =
    mountingSystem === "locating_dg_floating_nu" ||
    mountingSystem === "locating_ac_floating_nu" ||
    mountingSystem === "duplex_angular";

  const manufacturerPool = useMemo(
    () => filterCatalog(bearingCatalog, { manufacturer, applicationProfile, unitSystem: unitSystemFilter }),
    [manufacturer, applicationProfile, unitSystemFilter]
  );

  const availableTypes = useMemo(() => uniqueTypes(manufacturerPool), [manufacturerPool]);

  const typePool = useMemo(
    () =>
      filterCatalog(bearingCatalog, {
        manufacturer,
        applicationProfile,
        type: bearingType,
        unitSystem: unitSystemFilter,
      }),
    [manufacturer, applicationProfile, bearingType, unitSystemFilter]
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
        unitSystem: unitSystemFilter,
      }).filter((entry) => (maxOuterMm === "" ? true : entry.outerDiameterMm <= maxOuterMm)),
    [
      manufacturer,
      applicationProfile,
      bearingType,
      seriesFilter,
      sealFilter,
      unitSystemFilter,
      maxOuterMm,
    ]
  );

  const selected = findBearing(designation);
  const profileHint =
    applicationProfile !== "all" ? APPLICATION_PROFILE_META[applicationProfile].description : null;

  const spectrumDurationTotal = loadSpectrumSteps.reduce((sum, step) => sum + step.durationPercent, 0);

  const renderStage = (stage: BearingDesignerStageId) => {
    switch (stage) {
      case "system":
        return (
          <div className="space-y-4">
            {designerIntent === "service" ? (
              <p className="rounded-xl border border-cyan-200/80 bg-cyan-50/60 px-3 py-2 text-xs text-cyan-950 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-100">
                Use the designation search above to identify the installed bearing, then set topology
                and duty.
              </p>
            ) : null}

            {onMountingSystemChange ? (
              <div className="space-y-2">
                <BearingSystemStationsPanel
                  mountingSystem={mountingSystem}
                  onMountingSystemChange={onMountingSystemChange}
                  arrangement={arrangement}
                  onArrangementChange={setArrangement}
                  designation={designation}
                  floatingDesignation={floatingDesignation}
                  bearingType={bearingType}
                  stationRadialLoadsN={stationRadialLoadsN}
                  stationSlopesMrad={stationSlopesMrad}
                  onSwapStations={onSwapStations}
                  hasShaftHandoff={Boolean(stationRadialLoadsN && stationRadialLoadsN.length >= 2)}
                />
                {isLocatingSystem && onSystemWizardApply && systemWizardSizingConfig ? (
                  <BearingSystemWizardButton onClick={() => setWizardOpen(true)} />
                ) : null}
              </div>
            ) : null}

            <CalculatorFormSection
              title="Bearing type"
              description="Select the rolling bearing family for catalog filtering and ratings."
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
              description="Optional catalog filter only — does not change the ISO 281 calculation method."
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
                }}
              >
                {applicationProfileOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CalculatorSelectField>
            </CalculatorFormSection>

            {(arrangement === "back_to_back" ||
              arrangement === "face_to_face" ||
              arrangement === "tandem" ||
              mountingSystem === "duplex_angular") &&
            setPreloadClass ? (
              <CalculatorFormSection
                title="Duplex preload"
                description="Preload class feeds Ka/Kr/Km stiffness and thermal preload shift in results."
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
                title="Thermal float (locating + floating)"
                description="Floating station must accommodate shaft–housing differential growth."
              >
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
          </div>
        );

      case "duty":
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
                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Load (% of Fr/Fa)</span>
                    <span>Duration (%)</span>
                    <span className="col-span-2">Speed (rpm, optional)</span>
                  </div>
                  {loadSpectrumSteps.map((step, index) => (
                    <div key={index} className="grid min-w-0 grid-cols-[1fr_1fr_1fr_auto] gap-2">
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
                      <input
                        type="number"
                        min={0}
                        value={step.speedRpm ?? ""}
                        placeholder={String(speed)}
                        onChange={(event) => {
                          const next = [...loadSpectrumSteps];
                          const raw = event.target.value;
                          next[index] = {
                            ...step,
                            speedRpm: raw === "" ? undefined : Number(raw),
                          };
                          setLoadSpectrumSteps(next);
                        }}
                        className={calculatorNumberInputClass}
                        aria-label={`Load step ${index + 1} speed rpm`}
                      />
                      <button
                        type="button"
                        disabled={loadSpectrumSteps.length <= 1}
                        onClick={() => {
                          setLoadSpectrumSteps(loadSpectrumSteps.filter((_, i) => i !== index));
                        }}
                        className="rounded-lg border border-slate-200 px-2 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
                        aria-label={`Remove step ${index + 1}`}
                      >
                        −
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={loadSpectrumSteps.length >= 12}
                      onClick={() =>
                        setLoadSpectrumSteps([
                          ...loadSpectrumSteps,
                          { loadPercent: 100, durationPercent: 10 },
                        ])
                      }
                      className="rounded-lg border border-cyan-300/80 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 disabled:opacity-40 dark:border-cyan-800/60 dark:bg-cyan-950/40 dark:text-cyan-100"
                    >
                      + Add step
                    </button>
                    <p
                      className={`text-xs ${Math.abs(spectrumDurationTotal - 100) > 1 ? "text-amber-700 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {loadSpectrumSteps.length} step{loadSpectrumSteps.length === 1 ? "" : "s"} · duration{" "}
                      {spectrumDurationTotal}% (normalized on calculate)
                    </p>
                  </div>
                </div>
              ) : null}
            </CalculatorFormSection>

            <CalculatorFormSection title="Speed & life target" description="Required rating life for sizing and utilization.">
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
          </div>
        );

      case "verify":
        return (
          <div className="space-y-4">
            <BearingMethodLadder lifeMethod={lifeMethod} onChange={setLifeMethod} />

            {designerIntent === "service" ? (
              <p className="rounded-xl border border-cyan-200/80 bg-cyan-50/60 px-3 py-2 text-xs text-cyan-950 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-100">
                After Calculate, open the Diagnose results tab for failure modes, interchange
                candidates, grease life, and defect frequencies.
              </p>
            ) : null}

            <CalculatorFormSection title="Clearance & reliability">
              <div className={calculatorInputGridClass}>
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
                  label="Reliability factor a₁ (ISO 281)"
                  value={String(reliability)}
                  onChange={(value) => setReliability(Number(value) as BearingReliability)}
                >
                  <option value="90">90% — a₁ = 1.00</option>
                  <option value="95">95% — a₁ = 0.64</option>
                  <option value="96">96% — a₁ = 0.55</option>
                  <option value="97">97% — a₁ = 0.47</option>
                  <option value="98">98% — a₁ = 0.37</option>
                  <option value="99">99% — a₁ = 0.25</option>
                </CalculatorSelectField>
              </div>
            </CalculatorFormSection>

            <CalculatorFormSection
              title="Lubrication & environment"
              description="Modified life Lnm = a₁ · aISO · (C/P)^p. aISO from viscosity ratio κ, contamination eC (ηc), and Pu/P."
            >
              <div className={calculatorInputGridClass}>
                <CalculatorSelectField
                  label="Lubricant"
                  value={lubricantType}
                  onChange={(value) => setLubricantType(value as LubricantType)}
                >
                  <option value="none">Basic L₁₀ only (aISO = 1)</option>
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
                    {setInnerRingTempC ? (
                      <div className="min-w-0 space-y-1.5">
                        <label className={calculatorFieldLabelClass}>Inner ring T (°C, optional)</label>
                        <input
                          type="number"
                          value={innerRingTempC}
                          placeholder={String(operatingTempC)}
                          onChange={(event) =>
                            setInnerRingTempC(
                              event.target.value === "" ? "" : Number(event.target.value)
                            )
                          }
                          className={calculatorNumberInputClass}
                        />
                      </div>
                    ) : null}
                    {setOuterRingTempC ? (
                      <div className="min-w-0 space-y-1.5">
                        <label className={calculatorFieldLabelClass}>Outer ring T (°C, optional)</label>
                        <input
                          type="number"
                          value={outerRingTempC}
                          placeholder={String(operatingTempC)}
                          onChange={(event) =>
                            setOuterRingTempC(
                              event.target.value === "" ? "" : Number(event.target.value)
                            )
                          }
                          className={calculatorNumberInputClass}
                        />
                      </div>
                    ) : null}
                    <CalculatorSelectField
                      label="Contamination factor eC (ηc)"
                      value={contamination}
                      onChange={(value) => setContamination(value as ContaminationLevel)}
                    >
                      <option value="extreme_clean">Extreme clean — eC = 1.0</option>
                      <option value="high_clean">High cleanliness — eC = 0.8</option>
                      <option value="normal_clean">Normal clean — eC = 0.5</option>
                      <option value="slight_contamination">Slight contamination — eC = 0.3</option>
                      <option value="typical_contamination">Typical / severe — eC = 0.1</option>
                      <option value="heavy_contamination">Heavy contamination — eC = 0.05</option>
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
                      Use thermal equilibrium for life (friction power → ΔT → ν → κ / aISO). Uncheck to
                      force the temperature entered above.
                    </label>
                  </div>
                ) : null}
              </div>
            </CalculatorFormSection>

            <CalculatorFormSection
              title="Advanced life factors"
              description="Material and misalignment inputs for the method selected in the ladder above. Screening paths are not a substitute for full elastic FEA."
            >
              <div className={calculatorInputGridClass}>
                <CalculatorSelectField
                  label="Rolling elements"
                  value={rollingElementMaterial}
                  onChange={(value) => setRollingElementMaterial(value as RollingElementMaterial)}
                >
                  <option value="steel">Steel</option>
                  <option value="hybrid_ceramic">Hybrid ceramic (ISO 20056-inspired)</option>
                  <option value="full_ceramic">Full ceramic</option>
                </CalculatorSelectField>
                <div className="min-w-0 space-y-1.5">
                  <label className={calculatorFieldLabelClass}>Misalignment (mrad)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={misalignmentAngleMrad}
                    onChange={(event) =>
                      setMisalignmentAngleMrad(
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                    placeholder="0 or from shaft handoff"
                    className={calculatorNumberInputClass}
                  />
                </div>
              </div>
              {lifeMethod === "iso16281_screen" ? (
                <p className="mt-2 text-xs text-slate-500">
                  ISO 16281-inspired screening adjusts P for clearance, misalignment, and load
                  distribution — not full ISO 16281:2025 contact analysis.
                </p>
              ) : null}
              {lifeMethod === "stress_life_screen" ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Stress-life screening uses a transparent contact-pressure / film modifier. Screening
                  only — not a substitute for full elastic FEA.
                </p>
              ) : null}
            </CalculatorFormSection>
          </div>
        );

      case "size":
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
                  label="Dimension system"
                  value={unitSystemFilter}
                  onChange={(value) => setUnitSystemFilter(value as BearingUnitSystem | "all")}
                >
                  <option value="all">Metric + inch</option>
                  <option value="metric">Metric (ISO)</option>
                  <option value="inch">Inch (ABMA / Timken)</option>
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
                    {entry.designation} —{" "}
                    {entry.unitSystem === "inch" && entry.boreIn != null
                      ? `d ${entry.boreIn.toFixed(3)} in, D ${entry.outerDiameterIn?.toFixed(3)} in`
                      : `d ${entry.boreMm} mm, D ${entry.outerDiameterMm} mm`}
                    , C {(entry.dynamicRatingN / 1000).toFixed(1)} kN
                    {entry.sealType !== "open" ? ` · ${SEAL_TYPE_LABELS[entry.sealType]}` : ""}
                  </option>
                ))}
              </CalculatorSelectField>

              {selected ? <BearingCatalogDetail entry={selected} /> : null}

              {setRatingsOverrideEnabled && setOverrideC && setOverrideC0 && setOverridePu && setOverrideNote ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setRatingsPanelOpen((v) => !v)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50"
                    aria-expanded={ratingsPanelOpen}
                  >
                    <span>Catalog ratings override</span>
                    <span className="text-xs text-slate-400">{ratingsOverrideEnabled ? "On" : "Off"}</span>
                  </button>
                  {ratingsPanelOpen ? (
                    <div className="space-y-3 border-t border-slate-200/80 px-3 py-3 dark:border-slate-700/60">
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={ratingsOverrideEnabled}
                          onChange={(e) => setRatingsOverrideEnabled(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                        />
                        Use user-supplied C / C₀ / Pu instead of catalog
                      </label>
                      {ratingsOverrideEnabled ? (
                        <div className={calculatorInputGridClass}>
                          <div className="min-w-0 space-y-1.5">
                            <label className={calculatorFieldLabelClass}>
                              C dynamic (N){" "}
                              <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                                User override
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={overrideC}
                              onChange={(e) => setOverrideC(Number(e.target.value))}
                              className={calculatorNumberInputClass}
                            />
                          </div>
                          <div className="min-w-0 space-y-1.5">
                            <label className={calculatorFieldLabelClass}>
                              C₀ static (N){" "}
                              <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                                User override
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={overrideC0}
                              onChange={(e) => setOverrideC0(Number(e.target.value))}
                              className={calculatorNumberInputClass}
                            />
                          </div>
                          <div className="min-w-0 space-y-1.5">
                            <label className={calculatorFieldLabelClass}>
                              Pu fatigue (N){" "}
                              <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                                User override
                              </span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={overridePu}
                              onChange={(e) => setOverridePu(Number(e.target.value))}
                              className={calculatorNumberInputClass}
                            />
                          </div>
                          <div className="col-span-full min-w-0 space-y-1.5">
                            <label className={calculatorFieldLabelClass}>Source note</label>
                            <input
                              type="text"
                              value={overrideNote}
                              onChange={(e) => setOverrideNote(e.target.value)}
                              placeholder="e.g. OEM datasheet Rev B"
                              className={calculatorTextInputClass}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CalculatorFormSection>

            {(mountingSystem === "locating_dg_floating_nu" ||
              mountingSystem === "locating_ac_floating_nu") &&
            setFloatingDesignation ? (
              <CalculatorFormSection
                title="Floating station designation"
                description="NU / NJ cylindrical or CARB toroidal for the non-locating end — sized separately from the locating bearing."
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
                          e.type === "cylindrical_nup" ||
                          e.type === "toroidal_roller")
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

      case "report":
        return (
          <div className="space-y-4">
            <CalculatorFormSection
              title={designerIntent === "service" ? "Actions" : "Report & calculate"}
              description={
                designerIntent === "service"
                  ? "Run the evaluation, then use Diagnose / Report results for corrective actions."
                  : "Run the system design, review the decision strip, and export the report."
              }
            >
              {setProjectName ? (
                <label className={calculatorFieldLabelClass}>
                  Project name
                  <input
                    className={`${calculatorTextInputClass} mt-1`}
                    value={projectName ?? ""}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Bearing project"
                  />
                </label>
              ) : null}
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  Topology:{" "}
                  {mountingSystem === "single"
                    ? "single"
                    : mountingSystem === "duplex_angular"
                      ? "duplex"
                      : "locating + floating"}
                </li>
                <li>
                  Duty: Fr / Fa with{useVariableLoad ? " spectrum" : " steady loads"} @ {speed} rpm
                </li>
                <li>
                  {designerIntent === "service" ? "Evaluate" : "Size"}: {designation || "auto-design"}
                  {floatingDesignation ? ` + float ${floatingDesignation}` : ""}
                </li>
                <li>Life method: {lifeMethod}</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Use Calculate below. Results open with a Pass / Marginal / Fail decision strip.
              </p>
            </CalculatorFormSection>
          </div>
        );
    }
  };

  return (
    <CalculatorInputPanel
      title={
        designerIntent === "service"
          ? "Bearing System Designer — Service"
          : "Bearing System Designer"
      }
      description="PhyCalc selection: Requirements → Type & arrangement → Size → Lube & interfaces → Decision. ISO 281 / ISO 76 screening."
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

      {setUiComplexity ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500">
            {uiComplexity === "simple"
              ? "Simple: type, loads, speed, life, designation"
              : "Expert: full ISO 281 factors, duplex, spectrum, overrides"}
          </p>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600">
            <button
              type="button"
              onClick={() => setUiComplexity("simple")}
              className={`px-2.5 py-1 text-xs font-semibold ${
                uiComplexity === "simple" ? "bg-cyan-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setUiComplexity("expert")}
              className={`px-2.5 py-1 text-xs font-semibold ${
                uiComplexity === "expert" ? "bg-cyan-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Expert
            </button>
          </div>
        </div>
      ) : null}

      {uiComplexity === "simple" ? (
        <div className="space-y-4">
          <BearingTypePicker
            value={bearingType}
            availableTypes={availableTypes}
            onChange={setBearingType}
          />
          <div className={calculatorInputGridClass}>
            <CalculatorUnitField
              label="Radial load Fr"
              value={radialLoad}
              onChange={setRadialLoad}
              min={0}
              step="any"
              unit={
                <ModuleUnitSelect moduleId="bearings" fieldKey="load" value={radialUnit} onChange={setRadialUnit} />
              }
            />
            <CalculatorUnitField
              label="Axial load Fa"
              value={axialLoad}
              onChange={setAxialLoad}
              min={0}
              step="any"
              unit={<span className="text-xs text-slate-500">{axialUnit}</span>}
            />
            <CalculatorUnitField label="Speed" value={speed} onChange={setSpeed} min={0} unit="rpm" />
            <CalculatorUnitField label="Required L10h" value={lifeHours} onChange={setLifeHours} min={0} unit="h" />
          </div>
          <label className={calculatorFieldLabelClass}>
            Designation
            <input
              className={`${calculatorTextInputClass} mt-1`}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. 6205"
            />
          </label>
          <p className="text-xs text-slate-500">
            Need κ, duplex, spectrum, or overrides? Switch to Expert. Or open the{" "}
            <a href="/products/bearings/database" className="text-cyan-700 underline dark:text-cyan-400">
              catalog database
            </a>
            .
          </p>
        </div>
      ) : (
        <BearingDesignerSpine
          intent={designerIntent}
          stage={designerStage}
          onStageChange={onDesignerStageChange}
        >
          {renderStage}
        </BearingDesignerSpine>
      )}

      {wizardOpen && onSystemWizardApply && systemWizardSizingConfig ? (
        <BearingSystemWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          values={{
            mountingSystem,
            designation,
            floatingDesignation,
            stationRadialLoadsN: stationRadialLoadsN ?? [
              toBase(radialLoad, "force", radialUnit) * shockFactor * 0.5,
              toBase(radialLoad, "force", radialUnit) * shockFactor * 0.5,
            ],
            axialLoad: toBase(axialLoad, "force", axialUnit) * shockFactor,
            bearingSpanMm,
            availableFloatMm,
          }}
          sizingConfig={systemWizardSizingConfig}
          manufacturer={manufacturer}
          onMountingSystemChange={(id) => onMountingSystemChange?.(id)}
          onSuggestBearingType={onSuggestBearingType}
          onApply={onSystemWizardApply}
        />
      ) : null}
    </CalculatorInputPanel>
  );
}
