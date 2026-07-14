"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useHousingPresetSync } from "@/hooks/useBearingPresetSync";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback, useDeferredValue } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { usePowerTrainStepCompletion } from "@/contexts/PowerTrainAssemblyContext";
import HousingInputs from "@/components/machine/housing/HousingInputs";
import HousingResults from "@/components/machine/housing/HousingResults";
import HousingCopilotPanel from "@/components/machine/housing/HousingCopilotPanel";
import HousingDesignSummaryPanel from "@/components/machine/housing/HousingDesignSummaryPanel";
import { explainHousingRecommendation } from "@/lib/machine/housing/recommendationAdvisor";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveHousingEngine } from "@/lib/machine/housing/engine";
import { diagnoseHousing, type HousingDiagnosis } from "@/lib/machine/housing/diagnosis";
import { buildHousingReportInputRows } from "@/lib/machine/housing/reportInputs";
import type { HousingConfig, HousingMountStyle, HousingResult } from "@/lib/machine/housing/types";
import type { HousingCopilotApplyPayload } from "@/lib/copilot/housingCopilot";
import type { WithCalculationSpec } from "@/lib/standards/types";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import {
  nearestHousingForBore,
  type HousingCatalogEntry,
  type HousingSealOption,
} from "@/data/catalogs/housing";
import { buildMountedBom } from "@/lib/machine/housing/mountedBom";

type HousingProjectData = {
  boreDiameter: number;
  radialLoad: number;
  axialLoad: number;
  speed: number;
  mountStyle: HousingMountStyle;
  boltCount: number;
  boltCircleDiameter: number;
  yieldStress: number;
  lengthUnit: string;
  forceUnit: string;
  stressUnit: string;
  name?: string;
};

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("housing", (units) =>
    applyUnitMap(units, {
      boreDiameter: setLengthUnit,
      radialLoad: setForceUnit,
      axialLoad: setForceUnit,
      boltCircleDiameter: setLengthUnit,
      yieldStress: setStressUnit,
    })
  );

  const [boreDiameter, setBoreDiameter] = useState(40);
  const [radialLoad, setRadialLoad] = useState(5000);
  const [axialLoad, setAxialLoad] = useState(500);
  const [speed, setSpeed] = useState(1500);
  const [mountStyle, setMountStyle] = useState<HousingMountStyle>("pillow_block");
  const [boltCount, setBoltCount] = useState(4);
  const [boltCircleDiameter, setBoltCircleDiameter] = useState(120);
  const [yieldStress, setYieldStress] = useState(250);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [forceUnit, setForceUnit] = useState("N");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [housingSku, setHousingSku] = useState("");
  const [housingSeal, setHousingSeal] = useState<HousingSealOption>("labyrinth");
  const [stiffnessFactor, setStiffnessFactor] = useState(1);
  const [baseHeightMm, setBaseHeightMm] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<WithCalculationSpec<HousingResult> | null>(null);
  const [diagnosis, setDiagnosis] = useState<HousingDiagnosis | null>(null);
  const [lastConfig, setLastConfig] = useState<HousingConfig | null>(null);
  const completePowerTrainStep = usePowerTrainStepCompletion();
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<HousingProjectData>("housing", "Housing Project");

  useHousingPresetSync();

  const buildConfig = useCallback(
    (): HousingConfig => ({
      boreDiameter: toBase(boreDiameter, "length", lengthUnit),
      radialLoad: toBase(radialLoad, "force", forceUnit),
      axialLoad: toBase(axialLoad, "force", forceUnit),
      speed,
      mountStyle,
      boltCount: Math.max(2, Math.round(boltCount)),
      boltCircleDiameter: toBase(boltCircleDiameter, "length", lengthUnit),
      yieldStress: toBase(yieldStress, "stress", stressUnit),
      housingSku: housingSku || undefined,
      stiffnessFactor,
      baseHeightM:
        baseHeightMm != null ? toBase(baseHeightMm, "length", "mm") : undefined,
    }),
    [
      boreDiameter,
      radialLoad,
      axialLoad,
      speed,
      mountStyle,
      boltCount,
      boltCircleDiameter,
      yieldStress,
      lengthUnit,
      forceUnit,
      stressUnit,
      housingSku,
      stiffnessFactor,
      baseHeightMm,
    ]
  );

  const onSelectHousingSku = useCallback(
    (entry: HousingCatalogEntry) => {
      setHousingSku(entry.sku);
      setMountStyle(entry.mountStyle);
      setBoltCount(entry.boltCount);
      setBoltCircleDiameter(fromBase(entry.boltSpanMm / 1000, "length", lengthUnit));
      setBoreDiameter(fromBase(entry.boreMm / 1000, "length", lengthUnit));
      setStiffnessFactor(entry.stiffnessFactor);
      setBaseHeightMm(entry.baseHeightMm);
      setHousingSeal(entry.defaultSeal);
    },
    [lengthUnit]
  );

  const mountedBom = useMemo(() => {
    const boreMm =
      lengthUnit === "mm" ? boreDiameter : fromBase(toBase(boreDiameter, "length", lengthUnit), "length", "mm");
    return buildMountedBom({
      boreMm,
      housingSku: housingSku || undefined,
      seal: housingSeal,
      bearingDesignation: undefined,
    });
  }, [boreDiameter, lengthUnit, housingSku, housingSeal]);

  const livePreview = useMemo(() => {
    try {
      const config = buildConfig();
      if (!(config.boreDiameter > 0) || !(config.radialLoad >= 0)) return null;
      return solveHousingEngine(config);
    } catch {
      return null;
    }
  }, [buildConfig]);
  const deferredLive = useDeferredValue(livePreview);

  const advisor = useMemo(() => {
    if (!result || !lastConfig) return null;
    return explainHousingRecommendation(result, lastConfig, mountedBom);
  }, [result, lastConfig, mountedBom]);

  const runCheck = useCallback(() => {
    const config = buildConfig();
    const raw = solveHousingEngine(config);
    setLastConfig(config);
    setResult(wrapResult(raw));
    setDiagnosis(workflowMode === "diagnose" ? diagnoseHousing(raw, config) : null);

    publishHandoff("bolts", {
      fromModuleId: "housing",
      fromTitle: "Bearing Housing",
      summary: `Mounting bolts: tension ≈ ${(raw.boltTensionPerBolt / 1000).toFixed(2)} kN, shear ≈ ${(raw.boltShearPerBolt / 1000).toFixed(2)} kN per bolt (${boltCount} bolts, ${raw.recommendedBoltSize}).`,
      params: {
        tension: raw.boltTensionPerBolt,
        shear: raw.boltShearPerBolt,
        boltCount,
        patternDiameter: toBase(boltCircleDiameter, "length", lengthUnit),
      },
    });
    completePowerTrainStep("housing", raw.recommendedBoltSize, {
      tension: raw.boltTensionPerBolt,
      shear: raw.boltShearPerBolt,
      boltCount,
    });
  }, [
    buildConfig,
    boltCount,
    boltCircleDiameter,
    lengthUnit,
    wrapResult,
    completePowerTrainStep,
    workflowMode,
  ]);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      diameter: toBase(boreDiameter, "length", lengthUnit),
      maxForce: toBase(radialLoad, "force", forceUnit),
      axialLoad: toBase(axialLoad, "force", forceUnit),
      rpm: speed,
    }),
    [boreDiameter, lengthUnit, radialLoad, forceUnit, axialLoad, speed]
  );

  useSyncDesignInputs("housing", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    boltCount: (v) => setBoltCount(typeof v === "number" ? v : Number(v)),
    boltCircleDiameter: (v) =>
      setBoltCircleDiameter(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("housing", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  const applyCopilot = (payload: HousingCopilotApplyPayload) => {
    if (payload.boreMm != null) {
      setBoreDiameter(fromBase(payload.boreMm / 1000, "length", lengthUnit));
    }
    if (payload.radialLoad != null) {
      setRadialLoad(fromBase(payload.radialLoad, "force", forceUnit));
    }
    if (payload.axialLoad != null) {
      setAxialLoad(fromBase(payload.axialLoad, "force", forceUnit));
    }
    if (payload.speed != null) setSpeed(payload.speed);
    if (payload.mountStyle != null) setMountStyle(payload.mountStyle);
    if (payload.boltCount != null) setBoltCount(payload.boltCount);
    if (payload.boltCircleDiameterMm != null) {
      setBoltCircleDiameter(
        fromBase(payload.boltCircleDiameterMm / 1000, "length", lengthUnit)
      );
    }
    if (payload.yieldStressMPa != null) {
      setYieldStress(fromBase(payload.yieldStressMPa * 1e6, "stress", stressUnit));
    }
    queueMicrotask(() => calculate());
  };

  const inputRows = useMemo(
    () =>
      buildHousingReportInputRows({
        boreDiameter,
        radialLoad,
        axialLoad,
        speed,
        mountStyle,
        boltCount,
        boltCircleDiameter,
        yieldStress,
        lengthUnit,
        forceUnit,
        stressUnit,
      }),
    [
      boreDiameter,
      radialLoad,
      axialLoad,
      speed,
      mountStyle,
      boltCount,
      boltCircleDiameter,
      yieldStress,
      lengthUnit,
      forceUnit,
      stressUnit,
    ]
  );

  const loadProject = (project: HousingProjectData & { name?: string }) => {
    if (project.name) setProjectName(project.name);
    setBoreDiameter(project.boreDiameter);
    setRadialLoad(project.radialLoad);
    setAxialLoad(project.axialLoad);
    setSpeed(project.speed);
    setMountStyle(project.mountStyle);
    setBoltCount(project.boltCount);
    setBoltCircleDiameter(project.boltCircleDiameter);
    setYieldStress(project.yieldStress);
    setLengthUnit(project.lengthUnit);
    setForceUnit(project.forceUnit);
    setStressUnit(project.stressUnit);
  };

  return (
    <CalculatorLayout
      moduleId="housing"
      title="Bearing Housing"
      summary={
        <HousingDesignSummaryPanel preview={deferredLive} committed={result != null} />
      }
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProject(project as unknown as HousingProjectData & { name: string })}
        />
      }
      inputs={
        <div className="space-y-4">
          <HousingCopilotPanel onApply={applyCopilot} />
          <CrossCalcHandoffBanner
            moduleId="housing"
            onApply={(params) => {
              if (params.boreMm != null) {
                setBoreDiameter(fromBase(params.boreMm, "length", lengthUnit));
                const boreMm = params.boreMm * 1000;
                const nearest = nearestHousingForBore(boreMm);
                if (nearest) onSelectHousingSku(nearest);
              }
              if (params.shaftDiameter != null) {
                setBoreDiameter(fromBase(params.shaftDiameter, "length", lengthUnit));
                const nearest = nearestHousingForBore(params.shaftDiameter * 1000);
                if (nearest) onSelectHousingSku(nearest);
              }
              if (params.radialLoad != null) {
                setRadialLoad(fromBase(params.radialLoad, "force", forceUnit));
              }
              if (params.axialLoad != null) {
                setAxialLoad(fromBase(params.axialLoad, "force", forceUnit));
              }
              if (params.speed != null) setSpeed(params.speed);
            }}
          />
          <HousingInputs
            boreDiameter={boreDiameter}
            setBoreDiameter={setBoreDiameter}
            radialLoad={radialLoad}
            setRadialLoad={setRadialLoad}
            axialLoad={axialLoad}
            setAxialLoad={setAxialLoad}
            speed={speed}
            setSpeed={setSpeed}
            mountStyle={mountStyle}
            setMountStyle={setMountStyle}
            boltCount={boltCount}
            setBoltCount={setBoltCount}
            boltCircleDiameter={boltCircleDiameter}
            setBoltCircleDiameter={setBoltCircleDiameter}
            yieldStress={yieldStress}
            setYieldStress={setYieldStress}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            forceUnit={forceUnit}
            setForceUnit={setForceUnit}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            housingSku={housingSku}
            onSelectHousingSku={onSelectHousingSku}
            mountedBom={mountedBom}
            housingSeal={housingSeal}
            setHousingSeal={setHousingSeal}
            onCalculate={calculate}
            onSave={() =>
              saveProject({
                boreDiameter,
                radialLoad,
                axialLoad,
                speed,
                mountStyle,
                boltCount,
                boltCircleDiameter,
                yieldStress,
                lengthUnit,
                forceUnit,
                stressUnit,
              })
            }
            saving={saving}
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </div>
      }
      results={
        <HousingResults
          result={result}
          config={lastConfig}
          diagnosis={diagnosis}
          workflowMode={workflowMode}
          inputRows={inputRows}
          advisor={advisor}
          mountedBom={mountedBom}
          onApplyAdjustment={(fields) => {
            if (fields.boltCount != null) setBoltCount(fields.boltCount);
            if (fields.boltCircleDiameterMm != null) {
              setBoltCircleDiameter(
                fromBase(fields.boltCircleDiameterMm / 1000, "length", lengthUnit)
              );
            }
            if (fields.yieldStressMPa != null) {
              setYieldStress(fromBase(fields.yieldStressMPa * 1e6, "stress", stressUnit));
            }
            if (fields.mountStyle != null) setMountStyle(fields.mountStyle);
            queueMicrotask(() => calculate());
          }}
        />
      }
    />
  );
}
