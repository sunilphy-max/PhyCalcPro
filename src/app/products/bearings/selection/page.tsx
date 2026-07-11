"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useRollingBearingPresetSync } from "@/hooks/useBearingPresetSync";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
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
} from "@/lib/machine/bearings/types";
import {
  findBearing,
  equivalentDesignation,
  catalogTierToManufacturer,
  filterCatalog,
  bearingCatalog,
} from "@/data/catalogs/bearingCatalog";
import type { BearingCopilotApplyPayload } from "@/lib/copilot/bearingCopilot";

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


export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("bearings");
  const [radialLoad, setRadialLoad] = useState(500);
  const [radialUnit, setRadialUnit] = useState("N");
  const [axialLoad, setAxialLoad] = useState(100);
  const [axialUnit, setAxialUnit] = useState("N");
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
  const [stationRadialLoadsN, setStationRadialLoadsN] = useState<number[] | undefined>(undefined);
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
      const totalDuration = loadSpectrumSteps.reduce(
        (sum, step) => sum + Math.max(step.durationPercent, 0),
        0
      );
      loadSpectrum = loadSpectrumSteps.map((step) => ({
        durationFraction: Math.max(step.durationPercent, 0) / Math.max(totalDuration, 1),
        radialLoad: Fr * (step.loadPercent / 100),
        axialLoad: Fa * (step.loadPercent / 100),
      }));
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
    setApplicationProfile,
    setBearingType,
    setManufacturer,
    setReliability,
    setLubricationClass,
    setSafetyFactor,
    setDesignation,
    designation,
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
  };

  const syncDesignation = (
    mfr: BearingManufacturer,
    type: BearingType,
    profile: BearingApplicationProfile | "all",
    series: string | "all",
    seal: BearingSealType | "all",
    current: string
  ) => {
    const pool = filterCatalog(bearingCatalog, {
      manufacturer: mfr,
      type,
      applicationProfile: profile,
      series,
      sealType: seal,
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
      designation
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
  ]);

  const applyDesignation = useCallback((next: string) => {
    if (findBearing(next)) setDesignation(next);
  }, []);

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
      lubricantType,
      manufacturer,
      maxBoreMm,
      operatingTempC,
      radialLoad,
      radialUnit,
      reliability,
      safetyFactor,
      shockFactor,
      speed,
      wrapResult,
    ]
  );

  return (
    <CalculatorLayout
      moduleId="bearings"
      title="Bearing Load Rating & Life (SKF / ISO 281)"
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
            onApply={(params) => {
              if (params.radialLoad != null) {
                setRadialLoad(fromBase(params.radialLoad, "force", radialUnit));
              }
              if (params.axialLoad != null) {
                setAxialLoad(fromBase(params.axialLoad, "force", axialUnit));
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
            stationRadialLoadsN={stationRadialLoadsN}
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
          inputRows={reportInputRows}
          onSelectDesignation={applyDesignation}
        />
      }
    />
  );
}
