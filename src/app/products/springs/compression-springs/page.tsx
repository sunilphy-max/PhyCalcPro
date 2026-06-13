"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CompressionSpringInputs from "@/components/springs/compression-springs/CompressionSpringInputs";
import CompressionSpringResults from "@/components/springs/compression-springs/CompressionSpringResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import type { CompressionSpringResult, SpringWireType } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type CompressionSpringProjectData = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  deflection: number;
  modulus: number;
  ultimateStrength: number;
  targetRate?: number;
  maxForce?: number;
  maxOD?: number;
};

type CompressionSpringProject = LocalProject<CompressionSpringProjectData>;

export default function Page() {
  const { wrapResult } = useStandardCalculation("compression-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      freeLength: setLengthUnit,
      deflection: setLengthUnit,
      modulus: setModulusUnit,
      stress: setStressUnit,
    })
  );
  const { mode } = useDesignWorkflow();

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(8);
  const [freeLength, setFreeLength] = useState(50);
  const [deflection, setDeflection] = useState(10);
  const [modulus, setModulus] = useState(81);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [targetRate, setTargetRate] = useState(50);
  const [maxForce, setMaxForce] = useState(450);
  const [maxOD, setMaxOD] = useState(40);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [modulusUnit, setModulusUnit] = useState("GPa");
  const [wireType, setWireType] = useState<SpringWireType>("music");
  const [result, setResult] = useState<(CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Compression Spring Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<CompressionSpringProject[]>(() =>
    loadLocalProjects<CompressionSpringProjectData>("compression-springs")
  );

  const applyDesignFields = useApplyDesignFields({
    wireDiameter: (v) => setWireDiameter(typeof v === "number" ? v : Number(v)),
    meanDiameter: (v) => setMeanDiameter(typeof v === "number" ? v : Number(v)),
    activeCoils: (v) => setActiveCoils(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      freeLength: toBase(freeLength, "length", lengthUnit),
      deflection: toBase(deflection, "length", lengthUnit),
      modulus: toBase(modulus, "stress", modulusUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
      targetRate,
      maxForce,
      maxOD: toBase(maxOD, "length", lengthUnit),
    }),
    [
      wireDiameter,
      meanDiameter,
      activeCoils,
      freeLength,
      deflection,
      modulus,
      ultimateStrength,
      targetRate,
      maxForce,
      maxOD,
      lengthUnit,
      stressUnit,
    ]
  );

  useSyncDesignInputs("compression-springs", designUserInputs);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveCompressionSpringEngine({
          wireDiameter: toBase(wireDiameter, "length", lengthUnit),
          meanDiameter: toBase(meanDiameter, "length", lengthUnit),
          activeCoils,
          freeLength: toBase(freeLength, "length", lengthUnit),
          deflection: toBase(deflection, "length", lengthUnit),
          modulus: toBase(modulus, "stress", modulusUnit),
          ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
          wireType,
        })
      )
    );
  };

  const calculate = () => {
    if (mode === "design") {
      const design = runModuleDesignMode("compression-springs", designUserInputs);
      if (design?.best?.fields) {
        applyDesignFields(design.best.fields);
      }
    }
    runCheck();
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<CompressionSpringProjectData>("compression-springs", projectName, {
      wireDiameter,
      meanDiameter,
      activeCoils,
      freeLength,
      deflection,
      modulus,
      ultimateStrength,
      targetRate,
      maxForce,
      maxOD,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: CompressionSpringProject) => {
    setProjectName(project.name);
    setWireDiameter(project.wireDiameter);
    setMeanDiameter(project.meanDiameter);
    setActiveCoils(project.activeCoils);
    setFreeLength(project.freeLength);
    setDeflection(project.deflection);
    setModulus(project.modulus);
    setUltimateStrength(project.ultimateStrength);
    setTargetRate(project.targetRate ?? 50);
    setMaxForce(project.maxForce ?? 450);
    setMaxOD(project.maxOD ?? 40);
  };

  return (
    <CalculatorLayout
      moduleId="compression-springs"
      title="Compression Spring"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as CompressionSpringProject)}
        />
      }
      inputs={
        <CompressionSpringInputs
          wireDiameter={wireDiameter}
          setWireDiameter={setWireDiameter}
          meanDiameter={meanDiameter}
          setMeanDiameter={setMeanDiameter}
          activeCoils={activeCoils}
          setActiveCoils={setActiveCoils}
          freeLength={freeLength}
          setFreeLength={setFreeLength}
          deflection={deflection}
          setDeflection={setDeflection}
          modulus={modulus}
          setModulus={setModulus}
          modulusUnit={modulusUnit}
          setModulusUnit={setModulusUnit}
          ultimateStrength={ultimateStrength}
          setUltimateStrength={setUltimateStrength}
          wireType={wireType}
          setWireType={setWireType}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
          workflowMode={mode}
          targetRate={targetRate}
          setTargetRate={setTargetRate}
          maxForce={maxForce}
          setMaxForce={setMaxForce}
          maxOD={maxOD}
          setMaxOD={setMaxOD}
          onSave={saveProject}
          saving={saving}
          projectName={projectName}
          setProjectName={setProjectName}
        />
      }
      results={
        <>
          <CalculatorGuidancePanel title="Compression springs">
            <p>
              Uses Wahl correction for shear stress. Verify solid height clearance and buckling for slender
              springs (L0/D &gt; 4). Rate k = Gd⁴/(8D³n).
            </p>
          </CalculatorGuidancePanel>
          <CompressionSpringResults
            result={result}
            lengthUnit={lengthUnit}
            stressUnit={stressUnit}
            projectName={projectName}
            geometry={{ wireDiameter, meanDiameter, activeCoils, freeLength }}
          />
        </>
      }
    />
  );
}
