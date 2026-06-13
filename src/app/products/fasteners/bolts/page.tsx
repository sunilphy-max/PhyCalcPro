"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import ScrewsInputs from "@/components/fasteners/bolts/ScrewsInputs";
import ScrewsResults from "@/components/fasteners/bolts/ScrewsResults";
import BoltPatternInputs from "@/components/fasteners/bolts/BoltPatternInputs";
import BoltPatternResults from "@/components/fasteners/bolts/BoltPatternResults";
import Vdi2230Inputs from "@/components/fasteners/bolts/Vdi2230Inputs";
import Vdi2230Results from "@/components/fasteners/bolts/Vdi2230Results";
import { solveScrewEngine } from "@/lib/fasteners/bolts/engine";
import { solveBoltPattern } from "@/lib/fasteners/bolts/boltPattern";
import {
  solveVdi2230,
  type BoltPropertyClass,
  type TighteningMethod,
  type Vdi2230Result,
} from "@/lib/fasteners/bolts/vdi2230";
import type { ScrewConfig, ScrewResult } from "@/lib/fasteners/bolts/types";
import type { BoltPatternResult } from "@/lib/fasteners/bolts/boltPatternTypes";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { toBase } from "@/lib/units/conversions";

type AnalysisMode = "power_screw" | "bolt_pattern" | "vdi2230";

type ScrewProjectData = {
  config: ScrewConfig;
};

type ScrewProject = LocalProject<ScrewProjectData>;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("bolts");
  const [mode, setMode] = useState<AnalysisMode>("power_screw");
  const [config, setConfig] = useState<ScrewConfig>({
    screwType: "power_screw",
    threadType: "square",
    majorDiameter: 0.05,
    pitch: 0.01,
    lead: 0.01,
    length: 0.5,
    axialForce: 10000,
    frictionCoefficient: 0.15,
    starts: 1,
  });

  const [boltCount, setBoltCount] = useState(6);
  const [patternRadius, setPatternRadius] = useState(0.1);
  const [shearForce, setShearForce] = useState(25000);
  const [axialForce, setAxialForce] = useState(10000);
  const [eccentricityX, setEccentricityX] = useState(0.02);
  const [eccentricityY, setEccentricityY] = useState(0);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");

  const [jointSize, setJointSize] = useState("M12");
  const [propertyClass, setPropertyClass] = useState<BoltPropertyClass>("8.8");
  const [tighteningMethod, setTighteningMethod] = useState<TighteningMethod>("torque_wrench");
  const [clampLength, setClampLength] = useState(0.04);
  const [jointAxialLoad, setJointAxialLoad] = useState(15000);
  const [jointTransverseLoad, setJointTransverseLoad] = useState(5000);
  const [threadFriction, setThreadFriction] = useState(0.12);
  const [interfaceFriction, setInterfaceFriction] = useState(0.12);

  const [result, setResult] = useState<ScrewResult | null>(null);
  const [patternResult, setPatternResult] = useState<BoltPatternResult | null>(null);
  const [vdiResult, setVdiResult] = useState<Vdi2230Result | null>(null);
  const [projectName, setProjectName] = useState("Bolt Design Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ScrewProject[]>(() =>
    loadLocalProjects<ScrewProjectData>("screws")
  );

  const runCheck = () => {
    if (mode === "bolt_pattern") {
      setPatternResult(
        solveBoltPattern({
          boltCount: Math.max(2, Math.round(boltCount)),
          patternRadius: toBase(patternRadius, "length", lengthUnit),
          shearForce: toBase(shearForce, "force", forceUnit),
          axialForce: toBase(axialForce, "force", forceUnit),
          eccentricityX: toBase(eccentricityX, "length", lengthUnit),
          eccentricityY: toBase(eccentricityY, "length", lengthUnit),
        })
      );
      setResult(null);
      setVdiResult(null);
      return;
    }
    if (mode === "vdi2230") {
      setVdiResult(
        solveVdi2230({
          size: jointSize,
          propertyClass,
          tighteningMethod,
          clampLength: toBase(clampLength, "length", lengthUnit),
          jointModulus: 205e9,
          axialLoad: toBase(jointAxialLoad, "force", forceUnit),
          transverseLoad: toBase(jointTransverseLoad, "force", forceUnit),
          threadFriction,
          headFriction: threadFriction,
          interfaceFriction,
        })
      );
      setResult(null);
      setPatternResult(null);
      return;
    }
    setPatternResult(null);
    setVdiResult(null);
    setResult(wrapResult(solveScrewEngine(config)));
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<ScrewProjectData>("screws", projectName, { config });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (p: ScrewProject) => {
    setProjectName(p.name);
    setConfig(p.config);
    setMode("power_screw");
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      maxForce: toBase(shearForce, "force", forceUnit),
      axialLoad: toBase(axialForce, "force", forceUnit),
      allowableStressPa: 260e6,
    }), [shearForce, forceUnit, axialForce]);

  useSyncDesignInputs("bolts", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.majorDiameter != null) setConfig(fields.majorDiameter as never);
    if (fields.boltSize != null) setConfig(fields.boltSize as never);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("bolts", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="bolts"
      title="Bolt Design Analysis"
      footer={
        mode === "power_screw" ? (
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as ScrewProject)}
          />
        ) : undefined
      }
      inputs={
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Analysis mode</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("power_screw")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "power_screw" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Power / ball screw
              </button>
              <button
                type="button"
                onClick={() => setMode("bolt_pattern")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "bolt_pattern" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Bolt pattern
              </button>
              <button
                type="button"
                onClick={() => setMode("vdi2230")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "vdi2230" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                VDI 2230 joint
              </button>
            </div>
          </div>
          {mode === "power_screw" ? (
            <ScrewsInputs
              projectName={projectName}
              setProjectName={setProjectName}
              config={config}
              setConfig={setConfig}
              onCalculate={calculate}
              onSave={saveProject}
              saving={saving}
            />
          ) : mode === "vdi2230" ? (
            <Vdi2230Inputs
              size={jointSize}
              setSize={setJointSize}
              propertyClass={propertyClass}
              setPropertyClass={setPropertyClass}
              tighteningMethod={tighteningMethod}
              setTighteningMethod={setTighteningMethod}
              clampLength={clampLength}
              setClampLength={setClampLength}
              axialLoad={jointAxialLoad}
              setAxialLoad={setJointAxialLoad}
              transverseLoad={jointTransverseLoad}
              setTransverseLoad={setJointTransverseLoad}
              threadFriction={threadFriction}
              setThreadFriction={setThreadFriction}
              interfaceFriction={interfaceFriction}
              setInterfaceFriction={setInterfaceFriction}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              forceUnit={forceUnit}
              setForceUnit={setForceUnit}
              onCalculate={calculate}
            />
          ) : (
            <BoltPatternInputs
              boltCount={boltCount}
              setBoltCount={setBoltCount}
              patternRadius={patternRadius}
              setPatternRadius={setPatternRadius}
              shearForce={shearForce}
              setShearForce={setShearForce}
              axialForce={axialForce}
              setAxialForce={setAxialForce}
              eccentricityX={eccentricityX}
              setEccentricityX={setEccentricityX}
              eccentricityY={eccentricityY}
              setEccentricityY={setEccentricityY}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              forceUnit={forceUnit}
              setForceUnit={setForceUnit}
              onCalculate={calculate}
            />
          )}
        </div>
      }
      results={
        mode === "power_screw" ? (
          <ScrewsResults key={result ? JSON.stringify(result) : "empty"} result={result} projectName={projectName} />
        ) : mode === "vdi2230" ? (
          <Vdi2230Results result={vdiResult} />
        ) : (
          <BoltPatternResults result={patternResult} forceUnit={forceUnit} />
        )
      }
    />
  );
}
