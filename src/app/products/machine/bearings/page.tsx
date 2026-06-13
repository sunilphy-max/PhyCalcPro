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
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { fromBase } from "@/lib/units/conversions";
import { toBase } from "@/lib/units/conversions";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import type { BearingResult, BearingMaterial, BearingType, BearingReliability } from "@/lib/machine/bearings/types";
import { bearingsOfType, findBearing } from "@/data/catalogs/bearingCatalog";

type BearingProjectData = {
  radialLoad: number;
  axialLoad: number;
  speed: number;
  lifeHours: number;
  safetyFactor: number;
  bearingType: BearingType;
  designation: string;
  reliability: BearingReliability;
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
  const [result, setResult] = useState<BearingResult | null>(null);
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<BearingProjectData>("bearings", "Bearing Project");

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
      reliabilityPercent: reliability,
      material: LEGACY_MATERIAL,
    };

    setResult(wrapResult(solveBearingEngine(config)));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(radialLoad, "force", radialUnit),
      axialLoad: toBase(axialLoad, "force", axialUnit),
      speedDriver: speed,
      requiredLife: lifeHours,
      targetSafetyFactor: safetyFactor,
    }), [radialLoad, radialUnit, axialLoad, axialUnit, speed, lifeHours, safetyFactor]);

  useSyncDesignInputs("bearings", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.bearingSeries != null) setBearingType(fields.bearingSeries as never);
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
            const candidates = bearingsOfType(type as never);
            if (candidates.length && !candidates.some((b) => b.designation === designation)) {
              setDesignation(candidates[0].designation);
            }
          }}
          designation={designation}
          setDesignation={setDesignation}
          reliability={reliability}
          setReliability={setReliability}
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
