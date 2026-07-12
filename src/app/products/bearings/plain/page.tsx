"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { usePlainBearingPresetSync } from "@/hooks/useBearingPresetSync";
import { useSavedProjects } from "@/hooks/useSavedProjects";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import PlainBearingsInputs from "@/components/machine/plain-bearings/PlainBearingsInputs";
import PlainBearingsResults from "@/components/machine/plain-bearings/PlainBearingsResults";
import PlainBearingCopilotPanel from "@/components/machine/plain-bearings/PlainBearingCopilotPanel";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solvePlainBearingEngine } from "@/lib/machine/plain-bearings/engine";
import { diagnosePlainBearing, type PlainBearingDiagnosis } from "@/lib/machine/plain-bearings/diagnosis";
import { buildPlainBearingReportInputRows } from "@/lib/machine/plain-bearings/reportInputs";
import type { PlainBearingConfig, PlainBearingResult } from "@/lib/machine/plain-bearings/types";
import type { PlainBearingCopilotApplyPayload } from "@/lib/copilot/plainBearingCopilot";
import type { CalculationSpec } from "@/lib/standards/types";

type PlainProjectData = {
  bearingType: PlainBearingConfig["bearingType"];
  load: number;
  loadUnit: string;
  speed: number;
  diameter: number;
  length: number;
  clearance: number;
  viscosity: number;
  padDiameterRatio: number;
  padCount: number;
  lengthUnit: string;
  name?: string;
};

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("plain-bearings", (units) =>
    applyUnitMap(units, {
      load: setLoadUnit,
      diameter: setLengthUnit,
      length: setLengthUnit,
      clearance: setLengthUnit,
    })
  );

  const [load, setLoad] = useState(5000);
  const [loadUnit, setLoadUnit] = useState("N");
  const [speed, setSpeed] = useState(1200);
  const [diameter, setDiameter] = useState(50);
  const [length, setLength] = useState(40);
  const [clearance, setClearance] = useState(0.05);
  const [viscosity, setViscosity] = useState(0.03);
  const [bearingType, setBearingType] = useState<"journal" | "thrust_pad" | "tilting_pad">("journal");
  const [padDiameterRatio, setPadDiameterRatio] = useState(2);
  const [padCount, setPadCount] = useState(6);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [result, setResult] = useState<(PlainBearingResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlainBearingDiagnosis | null>(null);
  const [lastConfig, setLastConfig] = useState<PlainBearingConfig | null>(null);
  const { projectName, setProjectName, saving, savedProjects, saveProject } =
    useSavedProjects<PlainProjectData>("plain-bearings", "Plain Bearing Project");

  usePlainBearingPresetSync();

  const buildConfig = useCallback((): PlainBearingConfig => {
    return {
      bearingType,
      load: toBase(load, "force", loadUnit),
      speed,
      diameter: toBase(diameter, "length", lengthUnit),
      length: toBase(length, "length", lengthUnit),
      clearance: toBase(clearance, "length", lengthUnit),
      viscosity,
      padDiameterRatio,
      padCount,
    };
  }, [
    bearingType,
    load,
    loadUnit,
    speed,
    diameter,
    length,
    clearance,
    lengthUnit,
    viscosity,
    padDiameterRatio,
    padCount,
  ]);

  const runCheck = useCallback(() => {
    const config = buildConfig();
    const raw = solvePlainBearingEngine(config);
    setLastConfig(config);
    setResult(wrapResult(raw));
    setDiagnosis(diagnosePlainBearing(raw, config));

    publishHandoff("housing", {
      fromModuleId: "plain-bearings",
      fromTitle: "Plain Bearings",
      summary: `Journal/pad Ø ${(config.diameter * 1000).toFixed(0)} mm, load ${(config.load / 1000).toFixed(2)} kN @ ${speed} rpm.`,
      params: {
        boreMm: config.diameter,
        shaftDiameter: config.diameter,
        radialLoad: bearingType === "journal" ? config.load : 0,
        axialLoad: bearingType !== "journal" ? config.load : 0,
        speed,
      },
    });
  }, [buildConfig, wrapResult, bearingType, speed]);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      maxForce: toBase(load, "force", loadUnit),
      speedDriver: speed,
      length: toBase(diameter, "length", lengthUnit),
      diameter: toBase(diameter, "length", lengthUnit),
    }),
    [load, loadUnit, speed, diameter, lengthUnit]
  );

  useSyncDesignInputs("plain-bearings", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    journalDiameter: (v) => setDiameter(typeof v === "number" ? v : Number(v)),
    diameter: (v) => setDiameter(typeof v === "number" ? v : Number(v)),
    length: (v) => setLength(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("plain-bearings", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  const applyCopilot = (payload: PlainBearingCopilotApplyPayload) => {
    if (payload.load != null) setLoad(fromBase(payload.load, "force", loadUnit));
    if (payload.speed != null) setSpeed(payload.speed);
    if (payload.diameterMm != null) {
      setDiameter(fromBase(payload.diameterMm / 1000, "length", lengthUnit));
    }
    if (payload.lengthMm != null) {
      setLength(fromBase(payload.lengthMm / 1000, "length", lengthUnit));
    }
    if (payload.clearanceUm != null) {
      setClearance(fromBase(payload.clearanceUm * 1e-6, "length", lengthUnit));
    }
    if (payload.viscosity != null) setViscosity(payload.viscosity);
    if (payload.bearingType != null) setBearingType(payload.bearingType);
    if (payload.padCount != null) setPadCount(payload.padCount);
    // Defer calculate to next tick so state updates apply
    queueMicrotask(() => {
      const config: PlainBearingConfig = {
        bearingType: payload.bearingType ?? bearingType,
        load: payload.load ?? toBase(load, "force", loadUnit),
        speed: payload.speed ?? speed,
        diameter:
          payload.diameterMm != null
            ? payload.diameterMm / 1000
            : toBase(diameter, "length", lengthUnit),
        length:
          payload.lengthMm != null
            ? payload.lengthMm / 1000
            : toBase(length, "length", lengthUnit),
        clearance:
          payload.clearanceUm != null
            ? payload.clearanceUm * 1e-6
            : toBase(clearance, "length", lengthUnit),
        viscosity: payload.viscosity ?? viscosity,
        padDiameterRatio,
        padCount: payload.padCount ?? padCount,
      };
      const raw = solvePlainBearingEngine(config);
      setLastConfig(config);
      setResult(wrapResult(raw));
      setDiagnosis(diagnosePlainBearing(raw, config));
    });
  };

  const inputRows = useMemo(
    () =>
      buildPlainBearingReportInputRows({
        bearingType,
        load,
        loadUnit,
        speed,
        diameter,
        length,
        clearance,
        lengthUnit,
        viscosity,
        padDiameterRatio,
        padCount,
      }),
    [
      bearingType,
      load,
      loadUnit,
      speed,
      diameter,
      length,
      clearance,
      lengthUnit,
      viscosity,
      padDiameterRatio,
      padCount,
    ]
  );

  const loadProject = (project: PlainProjectData & { name?: string }) => {
    if (project.name) setProjectName(project.name);
    setBearingType(project.bearingType);
    setLoad(project.load);
    setLoadUnit(project.loadUnit);
    setSpeed(project.speed);
    setDiameter(project.diameter);
    setLength(project.length);
    setClearance(project.clearance);
    setViscosity(project.viscosity);
    setPadDiameterRatio(project.padDiameterRatio);
    setPadCount(project.padCount);
    setLengthUnit(project.lengthUnit);
  };

  return (
    <CalculatorLayout
      moduleId="plain-bearings"
      title="Plain Bearings"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProject(project as unknown as PlainProjectData & { name: string })}
        />
      }
      inputs={
        <div className="space-y-4">
          <PlainBearingCopilotPanel onApply={applyCopilot} />
          <CrossCalcHandoffBanner
            moduleId="plain-bearings"
            onApply={(params) => {
              const diam = params.boreMm ?? params.shaftDiameter;
              if (diam != null) setDiameter(fromBase(diam, "length", lengthUnit));
              if (params.radialLoad != null) {
                setLoad(fromBase(params.radialLoad, "force", loadUnit));
                setBearingType("journal");
              } else if (params.axialLoad != null) {
                setLoad(fromBase(params.axialLoad, "force", loadUnit));
              }
              if (params.speed != null) setSpeed(params.speed);
            }}
          />
          <PlainBearingsInputs
            bearingType={bearingType}
            setBearingType={setBearingType}
            load={load}
            setLoad={setLoad}
            loadUnit={loadUnit}
            setLoadUnit={setLoadUnit}
            speed={speed}
            setSpeed={setSpeed}
            diameter={diameter}
            setDiameter={setDiameter}
            length={length}
            setLength={setLength}
            clearance={clearance}
            setClearance={setClearance}
            viscosity={viscosity}
            setViscosity={setViscosity}
            padDiameterRatio={padDiameterRatio}
            setPadDiameterRatio={setPadDiameterRatio}
            padCount={padCount}
            setPadCount={setPadCount}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            onCalculate={calculate}
            onSave={() =>
              saveProject({
                bearingType,
                load,
                loadUnit,
                speed,
                diameter,
                length,
                clearance,
                viscosity,
                padDiameterRatio,
                padCount,
                lengthUnit,
              })
            }
            saving={saving}
            projectName={projectName}
            setProjectName={setProjectName}
          />
        </div>
      }
      results={
        <PlainBearingsResults
          result={result}
          lengthUnit={lengthUnit}
          config={lastConfig}
          diagnosis={diagnosis}
          workflowMode={workflowMode}
          inputRows={inputRows}
          onApplyAdjustment={(fields) => {
            if (fields.clearanceUm != null) {
              setClearance(fromBase(fields.clearanceUm * 1e-6, "length", lengthUnit));
            }
            if (fields.lengthMm != null) {
              setLength(fromBase(fields.lengthMm / 1000, "length", lengthUnit));
            }
            if (fields.viscosity != null) setViscosity(fields.viscosity);
            if (fields.diameterMm != null) {
              setDiameter(fromBase(fields.diameterMm / 1000, "length", lengthUnit));
            }
            if (fields.padCount != null) setPadCount(fields.padCount);
            queueMicrotask(() => calculate());
          }}
        />
      }
    />
  );
}
