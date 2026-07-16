"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRollingBearingPresetSync } from "@/hooks/useBearingPresetSync";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState, useMemo, useCallback, useDeferredValue } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import BearingInputs, {
  type LoadSpectrumUiStep,
} from "@/components/machine/bearings/BearingInputs";
import BearingCopilotPanel from "@/components/machine/bearings/BearingCopilotPanel";
import BearingMountingSystem, {
  type BearingMountingSystemId,
} from "@/components/machine/bearings/BearingMountingSystem";
import BearingResults from "@/components/machine/bearings/BearingResults";
import BearingDesignSummaryPanel from "@/components/machine/bearings/BearingDesignSummaryPanel";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { fromBase } from "@/lib/units/conversions";
import { toBase } from "@/lib/units/conversions";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import { diagnoseBearing, type BearingDiagnosis } from "@/lib/machine/bearings/diagnosis";
import { buildCrossManufacturerRecommendation } from "@/lib/machine/bearings/catalogAlternatives";
import { buildBearingReportInputRows } from "@/lib/machine/bearings/reportInputs";
import { buildMountedBom } from "@/lib/machine/housing/mountedBom";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import type {
  BearingResult,
  BearingMaterial,
  BearingType,
  BearingReliability,
  LubricationClass,
  BearingManufacturer,
  BearingCatalogTier,
  BearingArrangement,
  BearingApplicationProfile,
  BearingSealType,
  BearingClearance,
  ContaminationLevel,
  LubricantType,
  LoadSpectrumStep,
  BearingPreloadClass,
  BearingLifeMethod,
  RollingElementMaterial,
} from "@/lib/machine/bearings/types";
import {
  findBearing,
  equivalentDesignation,
  catalogTierToManufacturer,
  filterCatalog,
  bearingCatalog,
  type BearingUnitSystem,
} from "@/data/catalogs/bearingCatalog";
import type { BearingCopilotApplyPayload } from "@/lib/copilot/bearingCopilot";
import type { BearingSystemWizardValues } from "@/components/machine/bearings/BearingSystemWizard";
import type { BearingConfig } from "@/lib/machine/bearings/types";

type BearingProjectData = {
  radialLoad: number;
  axialLoad: number;
  speed: number;
  lifeHours: number;
  safetyFactor: number;
  bearingType: BearingType;
  designation: string;
  reliability: BearingReliability;
  lubricationClass: LubricationClass | "";
  manufacturer: BearingManufacturer;
  applicationProfile?: BearingApplicationProfile | "all";
  seriesFilter?: string | "all";
  sealFilter?: BearingSealType | "all";
  unitSystemFilter?: BearingUnitSystem | "all";
  catalogTier?: BearingCatalogTier;
  arrangement: BearingArrangement;
  maxBoreMm: number | "";
  lubricantType: LubricantType;
  isoVgGrade: number;
  operatingTempC: number;
  contamination: ContaminationLevel;
  clearanceOverride: BearingClearance | "";
  useVariableLoad: boolean;
  loadSpectrumSteps: LoadSpectrumUiStep[];
  shockFactor: number;
  lifeInputMode: "hours" | "revolutions";
  lifeRevolutions: number;
  maxOuterMm: number | "";
  mountingSystem?: BearingMountingSystemId;
  floatingDesignation?: string;
  preloadClass?: BearingPreloadClass;
  bearingSpanMm?: number;
  availableFloatMm?: number;
  useThermalEquilibrium?: boolean;
  lifeMethod?: BearingLifeMethod;
  misalignmentAngleMrad?: number | "";
  rollingElementMaterial?: RollingElementMaterial;
  ratingsOverrideEnabled?: boolean;
  overrideC?: number;
  overrideC0?: number;
  overridePu?: number;
  overrideNote?: string;
  innerRingTempC?: number | "";
  outerRingTempC?: number | "";
  /** @deprecated migrated to loadSpectrumSteps */
  variableLoadPercent?: number;
  /** @deprecated migrated to loadSpectrumSteps */
  variableLoadFraction?: number;
};

const DEFAULT_LOAD_SPECTRUM: LoadSpectrumUiStep[] = [
  { loadPercent: 100, durationPercent: 70 },
  { loadPercent: 75, durationPercent: 20 },
  { loadPercent: 125, durationPercent: 10 },
];

const LEGACY_MATERIAL: BearingMaterial = {
  name: "Bearing steel",
  dynamicRatingFactor: 35000,
  staticRatingFactor: 15000,
  allowableLife: 10000,
};

function buildLoadSpectrum(
  useVariableLoad: boolean,
  loadSpectrumSteps: LoadSpectrumUiStep[],
  Fr: number,
  Fa: number
): LoadSpectrumStep[] | undefined {
  if (!useVariableLoad) return undefined;
  const totalDuration = loadSpectrumSteps.reduce(
    (sum, step) => sum + Math.max(step.durationPercent, 0),
    0
  );
  return loadSpectrumSteps.map((step) => ({
    durationFraction: Math.max(step.durationPercent, 0) / Math.max(totalDuration, 1),
    radialLoad: Fr * (step.loadPercent / 100),
    axialLoad: Fa * (step.loadPercent / 100),
    ...(step.speedRpm != null && step.speedRpm > 0 ? { speedRpm: step.speedRpm } : {}),
  }));
}

function buildRatingsOverride(
  enabled: boolean,
  overrideC: number,
  overrideC0: number,
  overridePu: number,
  overrideNote: string
): BearingConfig["ratingsOverride"] | undefined {
  if (!enabled) return undefined;
  return {
    enabled: true,
    dynamicLoadRatingN: overrideC,
    staticLoadRatingN: overrideC0,
    fatigueLoadLimitN: overridePu,
    sourceNote: overrideNote || undefined,
  };
}


export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const [radialLoad, setRadialLoad] = useState(500);
  const [radialUnit, setRadialUnit] = useState("N");
  const [axialLoad, setAxialLoad] = useState(100);
  const [axialUnit, setAxialUnit] = useState("N");
  const { wrapResult } = useStandardCalculation("bearings", (units) =>
    applyUnitMap(units, {
      load: (unit) => {
        setRadialUnit(unit);
        setAxialUnit(unit);
      },
    })
  );
  const [speed, setSpeed] = useState(1800);
  const [lifeHours, setLifeHours] = useState(20000);
  const [safetyFactor, setSafetyFactor] = useState(1.5);
  const [shockFactor, setShockFactor] = useState(1);
  const [lifeInputMode, setLifeInputMode] = useState<"hours" | "revolutions">("hours");
  const [lifeRevolutions, setLifeRevolutions] = useState(90e6);
  const [applicationProfile, setApplicationProfile] = useState<BearingApplicationProfile | "all">("all");
  const [bearingType, setBearingType] = useState<BearingType>("deep_groove");
  const [designation, setDesignation] = useState("6205");
  const [reliability, setReliability] = useState<BearingReliability>(90);
  const [lubricationClass, setLubricationClass] = useState<LubricationClass | "">("");
  const [manufacturer, setManufacturer] = useState<BearingManufacturer>("SKF");
  const [seriesFilter, setSeriesFilter] = useState<string | "all">("all");
  const [sealFilter, setSealFilter] = useState<BearingSealType | "all">("all");
  const [unitSystemFilter, setUnitSystemFilter] = useState<BearingUnitSystem | "all">("all");
  const [arrangement, setArrangement] = useState<BearingArrangement>("single");
  const [lubricantType, setLubricantType] = useState<LubricantType>("oil");
  const [isoVgGrade, setIsoVgGrade] = useState(68);
  const [operatingTempC, setOperatingTempC] = useState(70);
  const [contamination, setContamination] = useState<ContaminationLevel>("normal_clean");
  const [clearanceOverride, setClearanceOverride] = useState<BearingClearance | "">("");
  const [useVariableLoad, setUseVariableLoad] = useState(false);
  const [loadSpectrumSteps, setLoadSpectrumSteps] = useState<LoadSpectrumUiStep[]>(DEFAULT_LOAD_SPECTRUM);
  const [maxBoreMm, setMaxBoreMm] = useState<number | "">("");
  const [maxOuterMm, setMaxOuterMm] = useState<number | "">("");
  const [maxWidthMm, setMaxWidthMm] = useState<number | "">("");
  const [mountingSystem, setMountingSystem] = useState<BearingMountingSystemId>("single");
  const [floatingDesignation, setFloatingDesignation] = useState("");
  const [preloadClass, setPreloadClass] = useState<BearingPreloadClass>("none");
  const [bearingSpanMm, setBearingSpanMm] = useState(400);
  const [availableFloatMm, setAvailableFloatMm] = useState(1);
  const [useThermalEquilibrium, setUseThermalEquilibrium] = useState(true);
  const [lifeMethod, setLifeMethod] = useState<BearingLifeMethod>("iso281");
  const [misalignmentAngleMrad, setMisalignmentAngleMrad] = useState<number | "">("");
  const [rollingElementMaterial, setRollingElementMaterial] =
    useState<RollingElementMaterial>("steel");
  const [stationRadialLoadsN, setStationRadialLoadsN] = useState<number[] | undefined>(undefined);
  const [stationSlopesMrad, setStationSlopesMrad] = useState<number[] | undefined>(undefined);
  const [ratingsOverrideEnabled, setRatingsOverrideEnabled] = useState(false);
  const [overrideC, setOverrideC] = useState(14000);
  const [overrideC0, setOverrideC0] = useState(7800);
  const [overridePu, setOverridePu] = useState(630);
  const [overrideNote, setOverrideNote] = useState("");
  const [innerRingTempC, setInnerRingTempC] = useState<number | "">("");
  const [outerRingTempC, setOuterRingTempC] = useState<number | "">("");
  const [handoffAxialWarning, setHandoffAxialWarning] = useState(false);
  const [result, setResult] = useState<BearingResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<BearingDiagnosis | null>(null);
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<BearingProjectData>("bearings", "Bearing Project");
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const runCheck = () => {
    const catalogEntry = findBearing(designation);
    if (!catalogEntry && designation.trim()) {
      // Soft warning path: still solve with legacy ratings but surface designation miss in result
    }
    const Fr = toBase(radialLoad, "force", radialUnit) * shockFactor;
    const Fa = toBase(axialLoad, "force", axialUnit) * shockFactor;
    const effectiveLifeHours =
      lifeInputMode === "hours"
        ? lifeHours
        : lifeRevolutions / (60 * Math.max(speed, 1));

    let loadSpectrum: LoadSpectrumStep[] | undefined;
    if (useVariableLoad) {
      loadSpectrum = buildLoadSpectrum(useVariableLoad, loadSpectrumSteps, Fr, Fa);
    }

    const config = {
      radialLoad: Fr,
      axialLoad: Fa,
      speed,
      lifeHours: effectiveLifeHours,
      safetyFactor,
      bearingType: catalogEntry?.type ?? bearingType,
      designation: catalogEntry?.designation ?? (designation.trim() || undefined),
      dynamicLoadRatingN: catalogEntry?.dynamicRatingN,
      staticLoadRatingN: catalogEntry?.staticRatingN,
      fatigueLoadLimitN: catalogEntry?.fatigueLoadLimitN,
      limitingSpeedRpm: catalogEntry?.limitingSpeedRpm,
      referenceSpeedRpm: catalogEntry?.referenceSpeedRpm,
      catalogFactors: catalogEntry?.catalogFactors,
      boreMm: catalogEntry?.boreMm,
      outerDiameterMm: catalogEntry?.outerDiameterMm,
      reliabilityPercent: reliability,
      lubricationClass: lubricantType === "none" ? lubricationClass || undefined : undefined,
      lubricantType: lubricantType === "none" ? undefined : lubricantType,
      isoVgGrade: lubricantType === "none" ? undefined : isoVgGrade,
      operatingTempC,
      contamination: lubricantType === "none" ? undefined : contamination,
      clearance: clearanceOverride || catalogEntry?.clearance,
      loadSpectrum,
      ratingsOverride: buildRatingsOverride(
        ratingsOverrideEnabled,
        overrideC,
        overrideC0,
        overridePu,
        overrideNote
      ),
      innerRingTempC: innerRingTempC === "" ? undefined : innerRingTempC,
      outerRingTempC: outerRingTempC === "" ? undefined : outerRingTempC,
      manufacturer,
      applicationProfile,
      arrangement,
      mountingSystem: (
        mountingSystem === "locating_dg_floating_nu" || mountingSystem === "locating_ac_floating_nu"
          ? "locating_floating"
          : mountingSystem === "duplex_angular"
            ? "duplex"
            : "single"
      ) as "single" | "locating_floating" | "duplex",
      locatingBearingType: (mountingSystem === "locating_dg_floating_nu"
        ? "deep_groove"
        : mountingSystem === "locating_ac_floating_nu"
          ? "angular_contact"
          : undefined) as BearingType | undefined,
      floatingBearingType: (mountingSystem === "locating_dg_floating_nu" ||
      mountingSystem === "locating_ac_floating_nu"
        ? "cylindrical_roller"
        : undefined) as BearingType | undefined,
      floatingDesignation: floatingDesignation || undefined,
      preloadClass,
      bearingSpanMm,
      availableFloatMm,
      stationRadialLoadsN,
      useThermalEquilibrium,
      ambientTempC: 20,
      lifeMethod,
      misalignmentAngleMrad:
        misalignmentAngleMrad === "" ? undefined : misalignmentAngleMrad,
      stationSlopesMrad,
      rollingElementMaterial,
      material: LEGACY_MATERIAL,
    };

    const raw = solveBearingEngine(config);
    setResult(wrapResult(raw));
    setDiagnosis(
      workflowMode === "diagnose"
        ? diagnoseBearing(raw, {
            radialLoad: Fr,
            axialLoad: Fa,
            speed,
            bearingType: config.bearingType,
            manufacturer,
            applicationProfile,
            arrangement,
            lubricantType,
            contamination,
            operatingTempC,
          })
        : null
    );

    const bore = raw.geometry?.boreMm;
    publishHandoff("housing", {
      fromModuleId: "bearings",
      fromTitle: "Bearing Selection",
      summary: `Bore ${bore != null ? `${bore} mm` : "—"}; Fr ≈ ${(config.radialLoad / 1000).toFixed(2)} kN at ${config.speed} rpm.`,
      params: {
        ...(bore != null ? { boreMm: bore / 1000 } : {}),
        radialLoad: config.radialLoad,
        axialLoad: config.axialLoad,
        speed: config.speed,
      },
    });
    completePowerTrainStep("bearings", designation, {
      ...(bore != null ? { boreMm: bore / 1000 } : {}),
      radialLoad: config.radialLoad,
      axialLoad: config.axialLoad,
      speed: config.speed,
    });
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    maxForce: toBase(radialLoad, "force", radialUnit),
    axialLoad: toBase(axialLoad, "force", axialUnit),
    speedDriver: speed,
    requiredLife: lifeInputMode === "hours" ? lifeHours : lifeRevolutions / (60 * Math.max(speed, 1)),
    targetSafetyFactor: safetyFactor,
    bearingType,
    bearingManufacturer: manufacturer,
    bearingApplicationProfile: applicationProfile,
    bearingArrangement: arrangement,
    shaftDiameterMm: maxBoreMm === "" ? undefined : maxBoreMm,
    bearingLubricantType: lubricantType,
    bearingIsoVgGrade: isoVgGrade,
    bearingOperatingTempC: operatingTempC,
    bearingContamination: contamination,
  }), [
    radialLoad,
    radialUnit,
    axialLoad,
    axialUnit,
    speed,
    lifeHours,
    lifeInputMode,
    lifeRevolutions,
    safetyFactor,
    bearingType,
    manufacturer,
    applicationProfile,
    maxBoreMm,
    arrangement,
    lubricantType,
    isoVgGrade,
    operatingTempC,
    contamination,
  ]);

  useSyncDesignInputs("bearings", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.bearingType != null) setBearingType(fields.bearingType as BearingType);
    if (fields.manufacturer != null) setManufacturer(fields.manufacturer as BearingManufacturer);
    if (fields.designation != null && findBearing(String(fields.designation))) {
      setDesignation(String(fields.designation));
    }
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  useRollingBearingPresetSync({
    setReliability,
    setLubricationClass,
    setSafetyFactor,
    setShockFactor,
    setLubricantType,
    setContamination,
    setLifeMethod,
    setRollingElementMaterial,
  });

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("bearings", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  const loadProjectIntoForm = (p: BearingProjectData & { name: string }) => {
    setProjectName(p.name);
    setRadialLoad(p.radialLoad);
    setAxialLoad(p.axialLoad);
    setSpeed(p.speed);
    setLifeHours(p.lifeHours);
    setSafetyFactor(p.safetyFactor);
    setBearingType(p.bearingType);
    setDesignation(p.designation);
    setReliability(p.reliability);
    setLubricationClass(p.lubricationClass ?? "");
    if (p.manufacturer) {
      setManufacturer(p.manufacturer);
    } else if (p.catalogTier) {
      setManufacturer(catalogTierToManufacturer(p.catalogTier));
    }
    setApplicationProfile(p.applicationProfile ?? "all");
    setSeriesFilter(p.seriesFilter ?? "all");
    setSealFilter(p.sealFilter ?? "all");
    setUnitSystemFilter(p.unitSystemFilter ?? "all");
    if (p.arrangement) setArrangement(p.arrangement);
    setMaxBoreMm(p.maxBoreMm ?? "");
    if (p.lubricantType) setLubricantType(p.lubricantType);
    if (p.isoVgGrade) setIsoVgGrade(p.isoVgGrade);
    if (p.operatingTempC) setOperatingTempC(p.operatingTempC);
    if (p.contamination) setContamination(p.contamination);
    setClearanceOverride(p.clearanceOverride ?? "");
    setUseVariableLoad(p.useVariableLoad ?? false);
    if (p.loadSpectrumSteps?.length) {
      setLoadSpectrumSteps(p.loadSpectrumSteps);
    } else if (p.variableLoadPercent != null) {
      setLoadSpectrumSteps([
        { loadPercent: 100, durationPercent: Math.round((1 - (p.variableLoadFraction ?? 0.3)) * 100) },
        { loadPercent: p.variableLoadPercent, durationPercent: Math.round((p.variableLoadFraction ?? 0.3) * 100) },
        { loadPercent: 125, durationPercent: 10 },
      ]);
    }
    setShockFactor(p.shockFactor ?? 1);
    setLifeInputMode(p.lifeInputMode ?? "hours");
    setLifeRevolutions(p.lifeRevolutions ?? 90e6);
    setMaxOuterMm(p.maxOuterMm ?? "");
    if (p.mountingSystem) setMountingSystem(p.mountingSystem);
    if (p.floatingDesignation != null) setFloatingDesignation(p.floatingDesignation);
    if (p.preloadClass) setPreloadClass(p.preloadClass);
    if (p.bearingSpanMm != null) setBearingSpanMm(p.bearingSpanMm);
    if (p.availableFloatMm != null) setAvailableFloatMm(p.availableFloatMm);
    if (p.useThermalEquilibrium != null) setUseThermalEquilibrium(p.useThermalEquilibrium);
    if (p.lifeMethod) setLifeMethod(p.lifeMethod);
    if (p.misalignmentAngleMrad !== undefined) setMisalignmentAngleMrad(p.misalignmentAngleMrad);
    if (p.rollingElementMaterial) setRollingElementMaterial(p.rollingElementMaterial);
    if (p.ratingsOverrideEnabled != null) setRatingsOverrideEnabled(p.ratingsOverrideEnabled);
    if (p.overrideC != null) setOverrideC(p.overrideC);
    if (p.overrideC0 != null) setOverrideC0(p.overrideC0);
    if (p.overridePu != null) setOverridePu(p.overridePu);
    if (p.overrideNote != null) setOverrideNote(p.overrideNote);
    if (p.innerRingTempC !== undefined) setInnerRingTempC(p.innerRingTempC);
    if (p.outerRingTempC !== undefined) setOuterRingTempC(p.outerRingTempC);
  };

  const syncDesignation = (
    mfr: BearingManufacturer,
    type: BearingType,
    profile: BearingApplicationProfile | "all",
    series: string | "all",
    seal: BearingSealType | "all",
    current: string,
    unitSystem: BearingUnitSystem | "all" = unitSystemFilter
  ) => {
    const pool = filterCatalog(bearingCatalog, {
      manufacturer: mfr,
      type,
      applicationProfile: profile,
      series,
      sealType: seal,
      unitSystem,
    });
    if (pool.some((b) => b.designation === current)) return;
    const mapped = equivalentDesignation(current, mfr);
    if (mapped && pool.some((b) => b.designation === mapped)) {
      setDesignation(mapped);
      return;
    }
    const first = pool[0]?.designation;
    if (first) setDesignation(first);
  };

  const reportInputRows = useMemo(
    () =>
      buildBearingReportInputRows({
        radialLoad,
        radialUnit,
        axialLoad,
        axialUnit,
        shockFactor,
        speed,
        lifeHours,
        lifeInputMode,
        lifeRevolutions,
        safetyFactor,
        bearingType,
        designation,
        manufacturer,
        applicationProfile,
        arrangement,
        reliability,
        lubricantType,
        isoVgGrade,
        operatingTempC,
        contamination,
        sealFilter,
        useVariableLoad,
        loadSpectrumSteps,
        maxBoreMm,
        maxOuterMm,
      }),
    [
      radialLoad,
      radialUnit,
      axialLoad,
      axialUnit,
      shockFactor,
      speed,
      lifeHours,
      lifeInputMode,
      lifeRevolutions,
      safetyFactor,
      bearingType,
      designation,
      manufacturer,
      applicationProfile,
      arrangement,
      reliability,
      lubricantType,
      isoVgGrade,
      operatingTempC,
      contamination,
      sealFilter,
      useVariableLoad,
      loadSpectrumSteps,
      maxBoreMm,
      maxOuterMm,
    ]
  );

  const crossManufacturerRecommendation = useMemo(() => {
    if (!result || workflowMode === "diagnose") return null;
    const Fr = toBase(radialLoad, "force", radialUnit) * shockFactor;
    const Fa = toBase(axialLoad, "force", axialUnit) * shockFactor;
    return buildCrossManufacturerRecommendation(
      {
        bearingType: result.bearingType,
        requiredDynamicRatingN: result.requiredDynamicRating,
        requiredStaticRatingN: result.requiredStaticRating,
        speedRpm: speed,
        manufacturer,
        applicationProfile,
        series: seriesFilter,
        sealType: sealFilter,
        outerMaxMm: maxOuterMm === "" ? undefined : maxOuterMm,
        widthMaxMm: maxWidthMm === "" ? undefined : maxWidthMm,
        boreMaxMm: maxBoreMm === "" ? undefined : maxBoreMm,
      },
      designation,
      {
        result,
        radialLoadN: Fr,
        axialLoadN: Fa,
        requiredLifeHours: lifeHours,
        contamination: lubricantType === "none" ? undefined : contamination,
        sealFilter,
        preferredManufacturer: manufacturer,
      }
    );
  }, [
    result,
    workflowMode,
    speed,
    manufacturer,
    applicationProfile,
    seriesFilter,
    sealFilter,
    maxBoreMm,
    maxOuterMm,
    maxWidthMm,
    designation,
    radialLoad,
    radialUnit,
    axialLoad,
    axialUnit,
    shockFactor,
    lifeHours,
    lubricantType,
    contamination,
  ]);

  const compareRows = useMemo(() => {
    if (!result || !crossManufacturerRecommendation) return [];
    const candidates = [
      crossManufacturerRecommendation.primary,
      ...crossManufacturerRecommendation.alternatives.slice(0, 2),
    ].filter(Boolean);
    const rows = [];
    const Fr = toBase(radialLoad, "force", radialUnit) * shockFactor;
    const Fa = toBase(axialLoad, "force", axialUnit) * shockFactor;
    for (const c of candidates) {
      if (!c) continue;
      const entry = c.entry;
      try {
        const solved = solveBearingEngine({
          radialLoad: Fr,
          axialLoad: Fa,
          speed,
          lifeHours,
          safetyFactor,
          bearingType: entry.type,
          designation: entry.designation,
          dynamicLoadRatingN: entry.dynamicRatingN,
          staticLoadRatingN: entry.staticRatingN,
          fatigueLoadLimitN: entry.fatigueLoadLimitN,
          limitingSpeedRpm: entry.limitingSpeedRpm,
          referenceSpeedRpm: entry.referenceSpeedRpm,
          catalogFactors: entry.catalogFactors,
          boreMm: entry.boreMm,
          outerDiameterMm: entry.outerDiameterMm,
          reliabilityPercent: reliability,
          lubricantType: lubricantType === "none" ? undefined : lubricantType,
          isoVgGrade: lubricantType === "none" ? undefined : isoVgGrade,
          operatingTempC,
          contamination: lubricantType === "none" ? undefined : contamination,
          clearance: clearanceOverride || entry.clearance,
          ratingsOverride: buildRatingsOverride(
            ratingsOverrideEnabled,
            overrideC,
            overrideC0,
            overridePu,
            overrideNote
          ),
          innerRingTempC: innerRingTempC === "" ? undefined : innerRingTempC,
          outerRingTempC: outerRingTempC === "" ? undefined : outerRingTempC,
          manufacturer: entry.manufacturer,
          lifeMethod,
          misalignmentAngleMrad:
            misalignmentAngleMrad === "" ? undefined : misalignmentAngleMrad,
          stationSlopesMrad,
          rollingElementMaterial,
          material: LEGACY_MATERIAL,
        });
        rows.push({
          designation: entry.designation,
          result: solved,
          costIndex: entry.costIndex,
        });
      } catch {
        /* skip invalid */
      }
    }
    return rows;
  }, [
    result,
    crossManufacturerRecommendation,
    radialLoad,
    radialUnit,
    axialLoad,
    axialUnit,
    shockFactor,
    speed,
    lifeHours,
    safetyFactor,
    reliability,
    lubricantType,
    isoVgGrade,
    operatingTempC,
    contamination,
    clearanceOverride,
    lifeMethod,
    misalignmentAngleMrad,
    stationSlopesMrad,
    rollingElementMaterial,
    ratingsOverrideEnabled,
    overrideC,
    overrideC0,
    overridePu,
    overrideNote,
    innerRingTempC,
    outerRingTempC,
  ]);

  const mountedBom = useMemo(() => {
    if (!result?.geometry?.boreMm) return null;
    return buildMountedBom({
      boreMm: result.geometry.boreMm,
      bearingDesignation: result.designation,
      bearingTypeLabel: BEARING_TYPE_LABELS[result.bearingType],
    });
  }, [result]);

  /** Continuous Design Summary preview — rebuilds on every input change. */
  const livePreviewSource = useMemo(() => {
    const catalogEntry = findBearing(designation);
    const Fr = toBase(radialLoad, "force", radialUnit) * shockFactor;
    const Fa = toBase(axialLoad, "force", axialUnit) * shockFactor;
    const effectiveLifeHours =
      lifeInputMode === "hours"
        ? lifeHours
        : lifeRevolutions / (60 * Math.max(speed, 1));

    if (!(Fr >= 0) || !(Fa >= 0) || !(speed > 0) || !(effectiveLifeHours > 0)) {
      return null;
    }

    let loadSpectrum: LoadSpectrumStep[] | undefined;
    if (useVariableLoad) {
      loadSpectrum = buildLoadSpectrum(useVariableLoad, loadSpectrumSteps, Fr, Fa);
    }

    try {
      return {
        requiredLifeHours: effectiveLifeHours,
        preview: solveBearingEngine({
          radialLoad: Fr,
          axialLoad: Fa,
          speed,
          lifeHours: effectiveLifeHours,
          safetyFactor,
          bearingType: catalogEntry?.type ?? bearingType,
          designation: catalogEntry?.designation ?? (designation.trim() || undefined),
          dynamicLoadRatingN: catalogEntry?.dynamicRatingN,
          staticLoadRatingN: catalogEntry?.staticRatingN,
          fatigueLoadLimitN: catalogEntry?.fatigueLoadLimitN,
          limitingSpeedRpm: catalogEntry?.limitingSpeedRpm,
          referenceSpeedRpm: catalogEntry?.referenceSpeedRpm,
          catalogFactors: catalogEntry?.catalogFactors,
          boreMm: catalogEntry?.boreMm,
          outerDiameterMm: catalogEntry?.outerDiameterMm,
          reliabilityPercent: reliability,
          lubricationClass: lubricantType === "none" ? lubricationClass || undefined : undefined,
          lubricantType: lubricantType === "none" ? undefined : lubricantType,
          isoVgGrade: lubricantType === "none" ? undefined : isoVgGrade,
          operatingTempC,
          contamination: lubricantType === "none" ? undefined : contamination,
          clearance: clearanceOverride || catalogEntry?.clearance,
          loadSpectrum,
          ratingsOverride: buildRatingsOverride(
            ratingsOverrideEnabled,
            overrideC,
            overrideC0,
            overridePu,
            overrideNote
          ),
          innerRingTempC: innerRingTempC === "" ? undefined : innerRingTempC,
          outerRingTempC: outerRingTempC === "" ? undefined : outerRingTempC,
          manufacturer,
          applicationProfile,
          arrangement,
          mountingSystem: (
            mountingSystem === "locating_dg_floating_nu" ||
            mountingSystem === "locating_ac_floating_nu"
              ? "locating_floating"
              : mountingSystem === "duplex_angular"
                ? "duplex"
                : "single"
          ) as "single" | "locating_floating" | "duplex",
          locatingBearingType: (mountingSystem === "locating_dg_floating_nu"
            ? "deep_groove"
            : mountingSystem === "locating_ac_floating_nu"
              ? "angular_contact"
              : undefined) as BearingType | undefined,
          floatingBearingType: (mountingSystem === "locating_dg_floating_nu" ||
          mountingSystem === "locating_ac_floating_nu"
            ? "cylindrical_roller"
            : undefined) as BearingType | undefined,
          floatingDesignation: floatingDesignation || undefined,
          preloadClass,
          bearingSpanMm,
          availableFloatMm,
          stationRadialLoadsN,
          useThermalEquilibrium,
          ambientTempC: 20,
          lifeMethod,
          misalignmentAngleMrad:
            misalignmentAngleMrad === "" ? undefined : misalignmentAngleMrad,
          stationSlopesMrad,
          rollingElementMaterial,
          material: LEGACY_MATERIAL,
        }),
      };
    } catch {
      return null;
    }
  }, [
    designation,
    radialLoad,
    radialUnit,
    axialLoad,
    axialUnit,
    shockFactor,
    speed,
    lifeInputMode,
    lifeHours,
    lifeRevolutions,
    safetyFactor,
    bearingType,
    reliability,
    lubricantType,
    lubricationClass,
    isoVgGrade,
    operatingTempC,
    contamination,
    clearanceOverride,
    useVariableLoad,
    loadSpectrumSteps,
    manufacturer,
    applicationProfile,
    arrangement,
    mountingSystem,
    floatingDesignation,
    preloadClass,
    bearingSpanMm,
    availableFloatMm,
    stationRadialLoadsN,
    useThermalEquilibrium,
    lifeMethod,
    misalignmentAngleMrad,
    stationSlopesMrad,
    rollingElementMaterial,
    ratingsOverrideEnabled,
    overrideC,
    overrideC0,
    overridePu,
    overrideNote,
    innerRingTempC,
    outerRingTempC,
  ]);

  const deferredLivePreview = useDeferredValue(livePreviewSource);

  const applyDesignation = useCallback((next: string) => {
    if (findBearing(next)) setDesignation(next);
  }, []);

  const swapStations = useCallback(() => {
    if (!stationRadialLoadsN || stationRadialLoadsN.length < 2) return;
    setStationRadialLoadsN([stationRadialLoadsN[1]!, stationRadialLoadsN[0]!]);
    if (stationSlopesMrad && stationSlopesMrad.length >= 2) {
      setStationSlopesMrad([stationSlopesMrad[1]!, stationSlopesMrad[0]!]);
    }
  }, [stationRadialLoadsN, stationSlopesMrad]);

  const systemWizardSizingConfig = useMemo((): BearingConfig => {
    const catalogEntry = findBearing(designation);
    const Fr = toBase(radialLoad, "force", radialUnit) * shockFactor;
    const Fa = toBase(axialLoad, "force", axialUnit) * shockFactor;
    const effectiveLifeHours =
      lifeInputMode === "hours"
        ? lifeHours
        : lifeRevolutions / (60 * Math.max(speed, 1));
    return {
      radialLoad: Fr,
      axialLoad: Fa,
      speed,
      lifeHours: effectiveLifeHours,
      safetyFactor,
      bearingType: catalogEntry?.type ?? bearingType,
      designation: catalogEntry?.designation ?? designation,
      boreMm: catalogEntry?.boreMm ?? (maxBoreMm === "" ? undefined : maxBoreMm),
      manufacturer,
      applicationProfile,
      material: LEGACY_MATERIAL,
    };
  }, [
    designation,
    radialLoad,
    radialUnit,
    axialLoad,
    axialUnit,
    shockFactor,
    speed,
    lifeInputMode,
    lifeHours,
    lifeRevolutions,
    safetyFactor,
    bearingType,
    maxBoreMm,
    manufacturer,
    applicationProfile,
  ]);

  const applySystemWizard = useCallback(
    (values: BearingSystemWizardValues) => {
      setMountingSystem(values.mountingSystem);
      if (values.designation && findBearing(values.designation)) {
        setDesignation(values.designation);
      }
      setFloatingDesignation(values.floatingDesignation);
      setStationRadialLoadsN(values.stationRadialLoadsN);
      setAxialLoad(fromBase(values.axialLoad, "force", axialUnit));
      setBearingSpanMm(values.bearingSpanMm);
      setAvailableFloatMm(values.availableFloatMm);
      if (values.mountingSystem === "locating_dg_floating_nu") {
        setBearingType("deep_groove");
      } else if (values.mountingSystem === "locating_ac_floating_nu") {
        setBearingType("angular_contact");
      }
    },
    [axialUnit]
  );

  const applyCopilot = useCallback(
    (payload: BearingCopilotApplyPayload) => {
      const nextRadial =
        payload.radialLoad != null ? fromBase(payload.radialLoad, "force", radialUnit) : radialLoad;
      const nextAxial =
        payload.axialLoad != null ? fromBase(payload.axialLoad, "force", axialUnit) : axialLoad;
      const nextSpeed = payload.speed ?? speed;
      const nextLife = payload.lifeHours ?? lifeHours;
      const nextSf = payload.safetyFactor ?? safetyFactor;
      const nextType = payload.bearingType ?? bearingType;
      const nextMfr = payload.manufacturer ?? manufacturer;
      const nextProfile = payload.applicationProfile ?? applicationProfile;
      const nextArrangement = payload.arrangement ?? arrangement;
      const nextLube = payload.lubricantType ?? lubricantType;
      const nextVg = payload.isoVgGrade ?? isoVgGrade;
      const nextTemp = payload.operatingTempC ?? operatingTempC;
      const nextContam = payload.contamination ?? contamination;
      const nextBore = payload.maxBoreMm ?? maxBoreMm;

      if (payload.radialLoad != null) setRadialLoad(nextRadial);
      if (payload.axialLoad != null) setAxialLoad(nextAxial);
      if (payload.speed != null) setSpeed(nextSpeed);
      if (payload.lifeHours != null) {
        setLifeInputMode("hours");
        setLifeHours(nextLife);
      }
      if (payload.safetyFactor != null) setSafetyFactor(nextSf);
      if (payload.bearingType) setBearingType(nextType);
      if (payload.manufacturer) setManufacturer(nextMfr);
      if (payload.applicationProfile) setApplicationProfile(nextProfile);
      if (payload.arrangement) {
        setArrangement(nextArrangement);
        if (nextArrangement !== "single") setMountingSystem("duplex_angular");
      }
      if (payload.lubricantType) setLubricantType(nextLube);
      if (payload.isoVgGrade != null) setIsoVgGrade(nextVg);
      if (payload.operatingTempC != null) setOperatingTempC(nextTemp);
      if (payload.contamination) setContamination(nextContam);
      if (payload.maxBoreMm != null) setMaxBoreMm(nextBore);

      if (payload.resetCatalogFilters) {
        setSeriesFilter("all");
        setSealFilter("all");
      }

      const resolvedDesignation =
        payload.designation && findBearing(payload.designation)
          ? findBearing(payload.designation)!.designation
          : designation;
      if (payload.designation && findBearing(payload.designation)) {
        setDesignation(resolvedDesignation);
      }

      // Solve immediately with applied values (React state updates are async).
      const catalogEntry = findBearing(resolvedDesignation);
      const Fr = toBase(nextRadial, "force", radialUnit) * shockFactor;
      const Fa = toBase(nextAxial, "force", axialUnit) * shockFactor;
      const raw = solveBearingEngine({
        radialLoad: Fr,
        axialLoad: Fa,
        speed: nextSpeed,
        lifeHours: nextLife,
        safetyFactor: nextSf,
        bearingType: catalogEntry?.type ?? nextType,
        designation: catalogEntry?.designation,
        dynamicLoadRatingN: catalogEntry?.dynamicRatingN,
        staticLoadRatingN: catalogEntry?.staticRatingN,
        fatigueLoadLimitN: catalogEntry?.fatigueLoadLimitN,
        limitingSpeedRpm: catalogEntry?.limitingSpeedRpm,
        referenceSpeedRpm: catalogEntry?.referenceSpeedRpm,
        catalogFactors: catalogEntry?.catalogFactors,
        boreMm: catalogEntry?.boreMm,
        outerDiameterMm: catalogEntry?.outerDiameterMm,
        reliabilityPercent: reliability,
        lubricantType: nextLube === "none" ? undefined : nextLube,
        isoVgGrade: nextLube === "none" ? undefined : nextVg,
        operatingTempC: nextTemp,
        contamination: nextLube === "none" ? undefined : nextContam,
        clearance: clearanceOverride || catalogEntry?.clearance,
        manufacturer: nextMfr,
        applicationProfile: nextProfile,
        arrangement: nextArrangement,
        lifeMethod,
        misalignmentAngleMrad:
          misalignmentAngleMrad === "" ? undefined : misalignmentAngleMrad,
        stationSlopesMrad,
        rollingElementMaterial,
        material: LEGACY_MATERIAL,
      });
      setResult(wrapResult(raw));
      setDiagnosis(null);
    },
    [
      axialLoad,
      axialUnit,
      applicationProfile,
      arrangement,
      bearingType,
      clearanceOverride,
      contamination,
      designation,
      isoVgGrade,
      lifeHours,
      lifeMethod,
      lubricantType,
      manufacturer,
      maxBoreMm,
      misalignmentAngleMrad,
      operatingTempC,
      radialLoad,
      radialUnit,
      reliability,
      rollingElementMaterial,
      safetyFactor,
      shockFactor,
      speed,
      stationSlopesMrad,
      wrapResult,
    ]
  );

  return (
    <CalculatorLayout
      moduleId="bearings"
      title="Bearing Load Rating & Life (SKF / ISO 281)"
      summary={
        <BearingDesignSummaryPanel
          preview={deferredLivePreview?.preview ?? null}
          manufacturer={manufacturer}
          requiredLifeHours={deferredLivePreview?.requiredLifeHours}
          committed={result != null}
        />
      }
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as unknown as BearingProjectData & { name: string })}
        />
      }
      inputs={
        <div className="space-y-4">
          <BearingCopilotPanel onApply={applyCopilot} />
          <CrossCalcHandoffBanner
            moduleId="bearings"
            warningNote={
              handoffAxialWarning ? "Axial Fa not from planar FEM — verify thrust manually." : undefined
            }
            onApply={(params) => {
              if (params.radialLoad != null) {
                setRadialLoad(fromBase(params.radialLoad, "force", radialUnit));
              }
              if (params.axialLoad != null) {
                setAxialLoad(fromBase(params.axialLoad, "force", axialUnit));
                setHandoffAxialWarning(false);
              } else {
                setHandoffAxialWarning(true);
              }
              if (params.speed != null) setSpeed(params.speed);
              const boreM = params.boreMm ?? params.shaftDiameter;
              if (boreM != null) setMaxBoreMm(boreM * 1000);
              if (params.station0Radial != null && params.station1Radial != null) {
                setStationRadialLoadsN([params.station0Radial, params.station1Radial]);
                setMountingSystem((prev) =>
                  prev === "single" ? "locating_dg_floating_nu" : prev
                );
              }
              if (params.bearingSpanMm != null) setBearingSpanMm(params.bearingSpanMm);
              const slopes: number[] = [];
              if (params.station0Slope != null) slopes.push(params.station0Slope * 1000);
              if (params.station1Slope != null) slopes.push(params.station1Slope * 1000);
              if (slopes.length > 0) {
                setStationSlopesMrad(slopes);
              } else if (params.maxBearingSlope != null) {
                setStationSlopesMrad([params.maxBearingSlope * 1000]);
              }
              if (params.maxBearingSlope != null && misalignmentAngleMrad === "") {
                setMisalignmentAngleMrad(Math.round(params.maxBearingSlope * 1000 * 100) / 100);
              } else if (slopes.length > 0 && misalignmentAngleMrad === "") {
                setMisalignmentAngleMrad(Math.round(Math.max(...slopes) * 100) / 100);
              }
            }}
          />
          <BearingInputs
            radialLoad={radialLoad}
            setRadialLoad={setRadialLoad}
            radialUnit={radialUnit}
            setRadialUnit={setRadialUnit}
            axialLoad={axialLoad}
            setAxialLoad={setAxialLoad}
            axialUnit={axialUnit}
            setAxialUnit={setAxialUnit}
            shockFactor={shockFactor}
            setShockFactor={setShockFactor}
            speed={speed}
            setSpeed={setSpeed}
            lifeHours={lifeHours}
            setLifeHours={setLifeHours}
            lifeInputMode={lifeInputMode}
            setLifeInputMode={setLifeInputMode}
            lifeRevolutions={lifeRevolutions}
            setLifeRevolutions={setLifeRevolutions}
            safetyFactor={safetyFactor}
            setSafetyFactor={setSafetyFactor}
            applicationProfile={applicationProfile}
            setApplicationProfile={setApplicationProfile}
            bearingType={bearingType}
            setBearingType={(type) => {
              setBearingType(type);
              setSeriesFilter("all");
              syncDesignation(manufacturer, type, applicationProfile, "all", sealFilter, designation);
            }}
            mountingSystem={mountingSystem}
            onMountingSystemChange={(id) => {
              setMountingSystem(id);
              if (id === "duplex_angular" && arrangement === "single") {
                setArrangement("back_to_back");
              }
              if (id === "single" && arrangement !== "single") {
                setArrangement("single");
              }
            }}
            onSuggestBearingType={(type) => {
              setBearingType(type);
              syncDesignation(manufacturer, type, applicationProfile, seriesFilter, sealFilter, designation);
            }}
            designation={designation}
            setDesignation={setDesignation}
            reliability={reliability}
            setReliability={setReliability}
            lubricationClass={lubricationClass}
            setLubricationClass={setLubricationClass}
            manufacturer={manufacturer}
            setManufacturer={(mfr) => {
              setManufacturer(mfr);
              syncDesignation(mfr, bearingType, applicationProfile, seriesFilter, sealFilter, designation);
            }}
            seriesFilter={seriesFilter}
            setSeriesFilter={(series) => {
              setSeriesFilter(series);
              syncDesignation(manufacturer, bearingType, applicationProfile, series, sealFilter, designation);
            }}
            sealFilter={sealFilter}
            setSealFilter={(seal) => {
              setSealFilter(seal);
              syncDesignation(manufacturer, bearingType, applicationProfile, seriesFilter, seal, designation);
            }}
            unitSystemFilter={unitSystemFilter}
            setUnitSystemFilter={(unit) => {
              setUnitSystemFilter(unit);
              setSeriesFilter("all");
              syncDesignation(
                manufacturer,
                bearingType,
                applicationProfile,
                "all",
                sealFilter,
                designation,
                unit
              );
            }}
            arrangement={arrangement}
            setArrangement={setArrangement}
            lubricantType={lubricantType}
            setLubricantType={setLubricantType}
            isoVgGrade={isoVgGrade}
            setIsoVgGrade={setIsoVgGrade}
            operatingTempC={operatingTempC}
            setOperatingTempC={setOperatingTempC}
            contamination={contamination}
            setContamination={setContamination}
            clearanceOverride={clearanceOverride}
            setClearanceOverride={setClearanceOverride}
            useVariableLoad={useVariableLoad}
            setUseVariableLoad={setUseVariableLoad}
            loadSpectrumSteps={loadSpectrumSteps}
            setLoadSpectrumSteps={setLoadSpectrumSteps}
            maxBoreMm={maxBoreMm}
            setMaxBoreMm={setMaxBoreMm}
            maxOuterMm={maxOuterMm}
            setMaxOuterMm={setMaxOuterMm}
            maxWidthMm={maxWidthMm}
            setMaxWidthMm={setMaxWidthMm}
            floatingDesignation={floatingDesignation}
            setFloatingDesignation={setFloatingDesignation}
            preloadClass={preloadClass}
            setPreloadClass={setPreloadClass}
            bearingSpanMm={bearingSpanMm}
            setBearingSpanMm={setBearingSpanMm}
            availableFloatMm={availableFloatMm}
            setAvailableFloatMm={setAvailableFloatMm}
            useThermalEquilibrium={useThermalEquilibrium}
            setUseThermalEquilibrium={setUseThermalEquilibrium}
            lifeMethod={lifeMethod}
            setLifeMethod={setLifeMethod}
            misalignmentAngleMrad={misalignmentAngleMrad}
            setMisalignmentAngleMrad={setMisalignmentAngleMrad}
            rollingElementMaterial={rollingElementMaterial}
            setRollingElementMaterial={setRollingElementMaterial}
            stationRadialLoadsN={stationRadialLoadsN}
            stationSlopesMrad={stationSlopesMrad}
            onSwapStations={swapStations}
            handoffAxialWarning={handoffAxialWarning}
            ratingsOverrideEnabled={ratingsOverrideEnabled}
            setRatingsOverrideEnabled={setRatingsOverrideEnabled}
            overrideC={overrideC}
            setOverrideC={setOverrideC}
            overrideC0={overrideC0}
            setOverrideC0={setOverrideC0}
            overridePu={overridePu}
            setOverridePu={setOverridePu}
            overrideNote={overrideNote}
            setOverrideNote={setOverrideNote}
            innerRingTempC={innerRingTempC}
            setInnerRingTempC={setInnerRingTempC}
            outerRingTempC={outerRingTempC}
            setOuterRingTempC={setOuterRingTempC}
            systemWizardSizingConfig={systemWizardSizingConfig}
            onSystemWizardApply={applySystemWizard}
            workflowMode={workflowMode}
            onCalculate={calculate}
            onSave={() =>
              saveProject({
                radialLoad,
                axialLoad,
                speed,
                lifeHours,
                safetyFactor,
                bearingType,
                designation,
                reliability,
                lubricationClass,
                manufacturer,
                applicationProfile,
                seriesFilter,
                sealFilter,
                unitSystemFilter,
                arrangement,
                maxBoreMm,
                lubricantType,
                isoVgGrade,
                operatingTempC,
                contamination,
                clearanceOverride,
                useVariableLoad,
                loadSpectrumSteps,
                shockFactor,
                lifeInputMode,
                lifeRevolutions,
                maxOuterMm,
                mountingSystem,
                floatingDesignation,
                preloadClass,
                bearingSpanMm,
                availableFloatMm,
                useThermalEquilibrium,
                lifeMethod,
                misalignmentAngleMrad,
                rollingElementMaterial,
                ratingsOverrideEnabled,
                overrideC,
                overrideC0,
                overridePu,
                overrideNote,
                innerRingTempC,
                outerRingTempC,
              })
            }
            saving={saving}
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </div>
      }
      results={
        <BearingResults
          result={result}
          loadUnit={radialUnit}
          speedRpm={speed}
          arrangement={arrangement}
          workflowMode={workflowMode}
          diagnosis={diagnosis}
          crossManufacturerRecommendation={crossManufacturerRecommendation}
          compareRows={compareRows}
          mountedBom={mountedBom}
          inputRows={reportInputRows}
          onSelectDesignation={applyDesignation}
        />
      }
    />
  );
}
