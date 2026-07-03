"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import TorsionSpringInputs from "@/components/springs/torsion-springs/TorsionSpringInputs";
import TorsionSpringResults from "@/components/springs/torsion-springs/TorsionSpringResults";
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
import { solveTorsionSpringEngine } from "@/lib/springs/torsion-springs/engine";
import type { TorsionSpringResult } from "@/lib/springs/torsion-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import type { SpringWireType } from "@/lib/springs/shared/wireStrength";
import type { En13906LifeClass, En13906WireQuality } from "@/lib/springs/shared/en13906Fatigue";
import { fromBase } from "@/lib/units/conversions";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type TorsionSpringProjectData = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  legLength: number;
  deflectionAngleDeg: number;
  modulus: number;
  ultimateStrength: number;
  targetRate?: number;
};

type TorsionSpringProject = LocalProject<TorsionSpringProjectData>;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("torsion-springs", (units) =>
    applyUnitMap(units, {
      wireDiameter: setLengthUnit,
      meanDiameter: setLengthUnit,
      legLength: setLengthUnit,
      modulus: setModulusUnit,
      stress: setStressUnit,
    })
  );

  const [wireDiameter, setWireDiameter] = useState(2);
  const [meanDiameter, setMeanDiameter] = useState(20);
  const [activeCoils, setActiveCoils] = useState(8);
  const [legLength, setLegLength] = useState(30);
  const [deflectionAngleDeg, setDeflectionAngleDeg] = useState(90);
  const [modulus, setModulus] = useState(210);
  const [ultimateStrength, setUltimateStrength] = useState(1400);
  const [wireType, setWireType] = useState<SpringWireType>("music");
  const [targetRate, setTargetRate] = useState(0.5);
  const [enableFatigueCheck, setEnableFatigueCheck] = useState(false);
  const [lifeClass, setLifeClass] = useState<En13906LifeClass>("VL");
  const [wireQuality, setWireQuality] = useState<En13906WireQuality>(1);
  const [minDeflectionAngleDeg, setMinDeflectionAngleDeg] = useState(0);
  const [catalogDesignation, setCatalogDesignation] = useState("");
  const [lengthUnit, setLengthUnit] = useState("mm");
  const [stressUnit, setStressUnit] = useState("MPa");
  const [modulusUnit, setModulusUnit] = useState("GPa");
  const [result, setResult] = useState<(TorsionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Torsion Spring Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<TorsionSpringProject[]>(() =>
    loadLocalProjects<TorsionSpringProjectData>("torsion-springs")
  );

  const designUserInputs = useMemo(
    (): ModuleUserInputs => ({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      legLength: toBase(legLength, "length", lengthUnit),
      deflectionAngleDeg,
      modulus: toBase(modulus, "stress", modulusUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
      targetRate,
    }),
    [
      wireDiameter,
      meanDiameter,
      activeCoils,
      legLength,
      deflectionAngleDeg,
      modulus,
      ultimateStrength,
      targetRate,
      lengthUnit,
      stressUnit,
      modulusUnit,
    ]
  );

  useSyncDesignInputs("torsion-springs", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    wireDiameter: (v) => setWireDiameter(typeof v === "number" ? v : Number(v)),
    meanDiameter: (v) => setMeanDiameter(typeof v === "number" ? v : Number(v)),
    activeCoils: (v) => setActiveCoils(typeof v === "number" ? v : Number(v)),
    legLength: (v) => setLegLength(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const runCheck = () => {
    const raw = solveTorsionSpringEngine({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      legLength: toBase(legLength, "length", lengthUnit),
      deflectionAngleDeg,
      modulus: toBase(modulus, "stress", modulusUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
      wireType,
      enableFatigueCheck,
      lifeClass,
      wireQuality,
      minDeflectionAngleDeg: enableFatigueCheck ? minDeflectionAngleDeg : undefined,
    });
    setResult(wrapResult(raw));
    publishHandoff("fatigue", {
      fromModuleId: "torsion-springs",
      fromTitle: "Torsion Spring",
      summary: `Carry coil bending stress ${raw.bendingStress.toExponential(2)} Pa as alternating stress input`,
      params: {
        alternatingStress: raw.bendingStress,
        meanStress: 0,
      },
    });
  };

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("torsion-springs", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<TorsionSpringProjectData>("torsion-springs", projectName, {
      wireDiameter,
      meanDiameter,
      activeCoils,
      legLength,
      deflectionAngleDeg,
      modulus,
      ultimateStrength,
      targetRate,
    });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (project: TorsionSpringProject) => {
    setProjectName(project.name);
    setWireDiameter(project.wireDiameter);
    setMeanDiameter(project.meanDiameter);
    setActiveCoils(project.activeCoils);
    setLegLength(project.legLength);
    setDeflectionAngleDeg(project.deflectionAngleDeg);
    setModulus(project.modulus);
    setUltimateStrength(project.ultimateStrength);
    setTargetRate(project.targetRate ?? 0.5);
  };

  return (
    <CalculatorLayout
      moduleId="torsion-springs"
      title="Torsion Spring"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as TorsionSpringProject)}
        />
      }
      inputs={
        <TorsionSpringInputs
          wireDiameter={wireDiameter}
          setWireDiameter={setWireDiameter}
          meanDiameter={meanDiameter}
          setMeanDiameter={setMeanDiameter}
          activeCoils={activeCoils}
          setActiveCoils={setActiveCoils}
          legLength={legLength}
          setLegLength={setLegLength}
          deflectionAngleDeg={deflectionAngleDeg}
          setDeflectionAngleDeg={setDeflectionAngleDeg}
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
          workflowMode={workflowMode}
          targetRate={targetRate}
          setTargetRate={setTargetRate}
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
          minDeflectionAngleDeg={minDeflectionAngleDeg}
          setMinDeflectionAngleDeg={setMinDeflectionAngleDeg}
          catalogDesignation={catalogDesignation}
          setCatalogDesignation={setCatalogDesignation}
          onCatalogPick={(entry) => {
            setWireDiameter(fromBase(entry.diameterMm / 1000, "length", lengthUnit));
            setModulus(fromBase(entry.elasticModulusPa, "stress", modulusUnit));
          }}
        />
      }
      results={
        <>
          <CalculatorGuidancePanel title="Torsion springs">
            <p>
              Rate k = Ed⁴/(64·D·n) with curvature factor Kb on coil bending stress. Leg stress is a simplified
              cantilever estimate — verify junction details for critical applications.
            </p>
          </CalculatorGuidancePanel>
          <TorsionSpringResults result={result} stressUnit={stressUnit} projectName={projectName} />
        </>
      }
    />
  );
}
