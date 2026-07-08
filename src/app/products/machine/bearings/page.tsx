"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import BearingInputs from "@/components/machine/bearings/BearingInputs";
import BearingResults from "@/components/machine/bearings/BearingResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { fromBase } from "@/lib/units/conversions";
import { toBase } from "@/lib/units/conversions";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import type {
  BearingResult,
  BearingMaterial,
  BearingType,
  BearingReliability,
  LubricationClass,
  BearingManufacturer,
  BearingCatalogTier,
  BearingArrangement,
} from "@/lib/machine/bearings/types";
import {
  bearingsOfType,
  findBearing,
  equivalentDesignation,
  catalogTierToManufacturer,
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
  /** @deprecated migrated to manufacturer on load */
  catalogTier?: BearingCatalogTier;
  arrangement: BearingArrangement;
  maxBoreMm: number | "";
};

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
  const [bearingType, setBearingType] = useState<BearingType>("deep_groove");
  const [designation, setDesignation] = useState("6205");
  const [reliability, setReliability] = useState<BearingReliability>(90);
  const [lubricationClass, setLubricationClass] = useState<LubricationClass | "">("");
  const [manufacturer, setManufacturer] = useState<BearingManufacturer>("SKF");
  const [arrangement, setArrangement] = useState<BearingArrangement>("single");
  const [maxBoreMm, setMaxBoreMm] = useState<number | "">("");
  const [result, setResult] = useState<BearingResult | null>(null);
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<BearingProjectData>("bearings", "Bearing Project");
  const completePowerTrainStep = usePowerTrainStepCompletion();

  const runCheck = () => {
    const catalogEntry = findBearing(designation);
    const config = {
      radialLoad: toBase(radialLoad, "force", radialUnit),
      axialLoad: toBase(axialLoad, "force", axialUnit),
      speed,
      lifeHours,
      safetyFactor,
      bearingType,
      designation: catalogEntry?.designation,
      dynamicLoadRatingN: catalogEntry?.dynamicRatingN,
      staticLoadRatingN: catalogEntry?.staticRatingN,
      limitingSpeedRpm: catalogEntry?.limitingSpeedRpm,
      reliabilityPercent: reliability,
      lubricationClass: lubricationClass || undefined,
      manufacturer,
      arrangement,
      material: LEGACY_MATERIAL,
    };

    const raw = solveBearingEngine(config);
    setResult(wrapResult(raw));

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
    requiredLife: lifeHours,
    targetSafetyFactor: safetyFactor,
    bearingType,
    bearingManufacturer: manufacturer,
    shaftDiameterMm: maxBoreMm === "" ? undefined : maxBoreMm,
  }), [radialLoad, radialUnit, axialLoad, axialUnit, speed, lifeHours, safetyFactor, bearingType, manufacturer, maxBoreMm]);

  useSyncDesignInputs("bearings", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.bearingType != null) setBearingType(fields.bearingType as BearingType);
    if (fields.manufacturer != null) setManufacturer(fields.manufacturer as BearingManufacturer);
    if (fields.designation != null && findBearing(String(fields.designation))) {
      setDesignation(String(fields.designation));
    }
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

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
    if (p.arrangement) setArrangement(p.arrangement);
    setMaxBoreMm(p.maxBoreMm ?? "");
  };

  return (
    <CalculatorLayout
      moduleId="bearings"
      title="Bearing Load Rating & Life"
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
            speed={speed}
            setSpeed={setSpeed}
            lifeHours={lifeHours}
            setLifeHours={setLifeHours}
            safetyFactor={safetyFactor}
            setSafetyFactor={setSafetyFactor}
            bearingType={bearingType}
            setBearingType={(type) => {
              setBearingType(type);
              const candidates = bearingsOfType(type, manufacturer);
              if (candidates.length && !candidates.some((b) => b.designation === designation)) {
                setDesignation(candidates[0]!.designation);
              }
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
              const mapped = equivalentDesignation(designation, mfr);
              if (mapped) {
                setDesignation(mapped);
              } else {
                const candidates = bearingsOfType(bearingType, mfr);
                if (candidates.length) setDesignation(candidates[0]!.designation);
              }
            }}
            arrangement={arrangement}
            setArrangement={setArrangement}
            maxBoreMm={maxBoreMm}
            setMaxBoreMm={setMaxBoreMm}
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
                arrangement,
                maxBoreMm,
              })
            }
            saving={saving}
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </div>
      }
      results={<BearingResults result={result} loadUnit={radialUnit} speedRpm={speed} />}
    />
  );
}
