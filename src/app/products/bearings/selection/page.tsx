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
import { rankCatalogBearings } from "@/lib/machine/bearings/catalogSelection";
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
} from "@/lib/machine/bearings/types";
import {
  findBearing,
  equivalentDesignation,
  catalogTierToManufacturer,
  filterCatalog,
  bearingCatalog,
} from "@/data/catalogs/bearingCatalog";

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
  const [result, setResult] = useState<BearingResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<BearingDiagnosis | null>(null);
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<BearingProjectData>("bearings", "Bearing Project");
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const runCheck = () => {
    const catalogEntry = findBearing(designation);
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
      designation: catalogEntry?.designation,
      dynamicLoadRatingN: catalogEntry?.dynamicRatingN,
      staticLoadRatingN: catalogEntry?.staticRatingN,
      limitingSpeedRpm: catalogEntry?.limitingSpeedRpm,
      catalogFactors: catalogEntry?.catalogFactors,
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

  const recommendations = useMemo(() => {
    if (!result || workflowMode === "diagnose") return [];
    return rankCatalogBearings({
      bearingType: result.bearingType,
      requiredDynamicRatingN: result.requiredDynamicRating,
      requiredStaticRatingN: result.requiredStaticRating,
      speedRpm: speed,
      manufacturer,
      applicationProfile,
      series: seriesFilter,
      sealType: sealFilter,
      boreMaxMm: maxBoreMm === "" ? undefined : maxBoreMm,
      outerMaxMm: maxOuterMm === "" ? undefined : maxOuterMm,
    }).slice(0, 5);
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
  ]);

  const applyDesignation = useCallback((next: string) => {
    if (findBearing(next)) setDesignation(next);
  }, []);

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
          recommendations={recommendations}
          inputRows={reportInputRows}
          onSelectDesignation={applyDesignation}
        />
      }
    />
  );
}
