"use client";

import { useMemo, useState, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import ExtensionSpringInputs from "@/components/springs/extension-springs/ExtensionSpringInputs";
import ExtensionSpringResults from "@/components/springs/extension-springs/ExtensionSpringResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { publishHandoff } from "@/lib/design-workflows/crossCalcHandoff";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveExtensionSpringEngine } from "@/lib/springs/extension-springs/engine";
import type { ExtensionSpringResult } from "@/lib/springs/extension-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import type { SpringWireType, HookType } from "@/lib/springs/shared/wireStrength";
import type { En13906LifeClass, En13906WireQuality } from "@/lib/springs/shared/en13906Fatigue";
import { fromBase } from "@/lib/units/conversions";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { getWireGradeModuli } from "@/lib/materials/springWireGrades";

type ExtensionSpringProjectData = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  deflection: number;
  modulus: number;
  ultimateStrength: number;
  initialTension: number;
  hookType: HookType;
  targetRate?: number;
  maxForce?: number;
};

type ExtensionSpringProject = LocalProject<ExtensionSpringProjectData>;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("extension-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      freeLength: setLengthUnit,
      deflection: setLengthUnit,
      modulus: setModulusUnit,
      stress: setStressUnit,
    })
  );

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(10);
  const [freeLength, setFreeLength] = useState(60);
  const [deflection, setDeflection] = useState(15);
  const [modulus, setModulus] = useState(() => (getWireGradeModuli("music")?.G ?? 81e9) / 1e9);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [initialTension, setInitialTension] = useState(5);
  const [hookType, setHookType] = useState<HookType>("machine");
  const [wireType, setWireType] = useState<SpringWireType>("music");
  const [operatingFrequencyHz, setOperatingFrequencyHz] = useState(0);
  const [enableFatigueCheck, setEnableFatigueCheck] = useState(false);
  const [lifeClass, setLifeClass] = useState<En13906LifeClass>("VL");
  const [wireQuality, setWireQuality] = useState<En13906WireQuality>(1);
  const [minDeflection, setMinDeflection] = useState(0);
  const [catalogDesignation, setCatalogDesignation] = useState("");
  const [targetRate, setTargetRate] = useState(40);
  const [maxForce, setMaxForce] = useState(200);
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [modulusUnit, setModulusUnit] = useState("GPa");
  const [result, setResult] = useState<(ExtensionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Extension Spring Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ExtensionSpringProject[]>(() =>
    loadLocalProjects<ExtensionSpringProjectData>("extension-springs")
  );

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
      initialTension,
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
      initialTension,
      lengthUnit,
      stressUnit,
      modulusUnit,
    ]
  );

  useSyncDesignInputs("extension-springs", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    wireDiameter: (v) => setWireDiameter(typeof v === "number" ? v : Number(v)),
    meanDiameter: (v) => setMeanDiameter(typeof v === "number" ? v : Number(v)),
    activeCoils: (v) => setActiveCoils(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const handleWireTypeChange = useCallback(
    (type: SpringWireType) => {
      setWireType(type);
      const moduli = getWireGradeModuli(type);
      if (moduli) {
        setModulus(fromBase(moduli.G, "stress", modulusUnit));
      }
    },
    [modulusUnit]
  );

  const runCheck = () => {
    const raw = solveExtensionSpringEngine({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      freeLength: toBase(freeLength, "length", lengthUnit),
      deflection: toBase(deflection, "length", lengthUnit),
      modulus: toBase(modulus, "stress", modulusUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
      wireType,
      initialTension,
      hookType,
      operatingFrequencyHz: operatingFrequencyHz > 0 ? operatingFrequencyHz : undefined,
      enableFatigueCheck,
      lifeClass,
      wireQuality,
      minDeflection: enableFatigueCheck ? toBase(minDeflection, "length", lengthUnit) : undefined,
    });
    setResult(wrapResult(raw));
    publishHandoff("fatigue", {
      fromModuleId: "extension-springs",
      fromTitle: "Extension Spring",
      summary: `Carry body shear stress ${raw.bodyShearStress.toExponential(2)} Pa as alternating stress input`,
      params: {
        alternatingStress: raw.bodyShearStress,
        meanStress: raw.initialTension / (Math.PI * (toBase(wireDiameter, "length", lengthUnit) / 2) ** 2),
      },
    });
  };

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("extension-springs", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<ExtensionSpringProjectData>("extension-springs", projectName, {
      wireDiameter,
      meanDiameter,
      activeCoils,
      freeLength,
      deflection,
      modulus,
      ultimateStrength,
      initialTension,
      hookType,
      targetRate,
      maxForce,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: ExtensionSpringProject) => {
    setProjectName(project.name);
    setWireDiameter(project.wireDiameter);
    setMeanDiameter(project.meanDiameter);
    setActiveCoils(project.activeCoils);
    setFreeLength(project.freeLength);
    setDeflection(project.deflection);
    setModulus(project.modulus);
    setUltimateStrength(project.ultimateStrength);
    setInitialTension(project.initialTension);
    setHookType(project.hookType);
    setTargetRate(project.targetRate ?? 40);
    setMaxForce(project.maxForce ?? 200);
  };

  return (
    <CalculatorLayout
      moduleId="extension-springs"
      title="Extension Spring"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as ExtensionSpringProject)}
        />
      }
      inputs={
        <ExtensionSpringInputs
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
          setWireType={handleWireTypeChange}
          initialTension={initialTension}
          setInitialTension={setInitialTension}
          hookType={hookType}
          setHookType={setHookType}
          operatingFrequencyHz={operatingFrequencyHz}
          setOperatingFrequencyHz={setOperatingFrequencyHz}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          stressUnit={stressUnit}
          setStressUnit={setStressUnit}
          onCalculate={calculate}
          workflowMode={workflowMode}
          targetRate={targetRate}
          setTargetRate={setTargetRate}
          maxForce={maxForce}
          setMaxForce={setMaxForce}
          onSave={saveProject}
          saving={saving}
          projectName={projectName}
          setProjectName={setProjectName}
          enableFatigueCheck={enableFatigueCheck}
          setEnableFatigueCheck={setEnableFatigueCheck}
          lifeClass={lifeClass}
          setLifeClass={setLifeClass}
          wireQuality={wireQuality}
          setWireQuality={setWireQuality}
          minDeflection={minDeflection}
          setMinDeflection={setMinDeflection}
          catalogDesignation={catalogDesignation}
          setCatalogDesignation={setCatalogDesignation}
          onCatalogPick={(entry) => {
            setWireDiameter(fromBase(entry.diameterMm / 1000, "length", lengthUnit));
            setModulus(fromBase(entry.shearModulusPa, "stress", modulusUnit));
          }}
        />
      }
      results={
        <>
          <CalculatorGuidancePanel title="Extension springs">
            <p>
              Total force F = Fi + k·x. Hook stress often governs — verify hook type and initial tension against
              manufacturable limit. Rate k = Gd⁴/(8D³n).
            </p>
          </CalculatorGuidancePanel>
          <ExtensionSpringResults
            result={result}
            lengthUnit={lengthUnit}
            stressUnit={stressUnit}
            projectName={projectName}
          />
        </>
      }
    />
  );
}
