"use client";

import { useEffect, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import CompressionSpringInputs from "@/components/springs/compression-springs/CompressionSpringInputs";
import CompressionSpringResults from "@/components/springs/compression-springs/CompressionSpringResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { toBase } from "@/lib/units/conversions";
import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import type { CompressionSpringResult } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { designCompressionSpring } from "@/lib/design-workflows/solvers/compressionSpringDesign";
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
      modulus: setStressUnit,
      stress: setStressUnit,
    })
  );
  const { mode, setUserInputs } = useDesignWorkflow();

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
  const [result, setResult] = useState<(CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null>(null);
  const [projectName, setProjectName] = useState("Compression Spring Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<CompressionSpringProject[]>(() =>
    loadLocalProjects<CompressionSpringProjectData>("compression-springs")
  );

  useEffect(() => {
    setUserInputs({
      wireDiameter: toBase(wireDiameter, "length", lengthUnit),
      meanDiameter: toBase(meanDiameter, "length", lengthUnit),
      activeCoils,
      freeLength: toBase(freeLength, "length", lengthUnit),
      deflection: toBase(deflection, "length", lengthUnit),
      modulus: toBase(modulus, "stress", stressUnit),
      ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
      targetRate,
      maxForce,
      maxOD: toBase(maxOD, "length", lengthUnit),
    });
  }, [
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
    setUserInputs,
  ]);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveCompressionSpringEngine({
          wireDiameter: toBase(wireDiameter, "length", lengthUnit),
          meanDiameter: toBase(meanDiameter, "length", lengthUnit),
          activeCoils,
          freeLength: toBase(freeLength, "length", lengthUnit),
          deflection: toBase(deflection, "length", lengthUnit),
          modulus: toBase(modulus, "stress", stressUnit),
          ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
        })
      )
    );
  };

  const calculate = () => {
    if (mode === "design") {
      const design = designCompressionSpring({
        targetRate,
        maxForce,
        maxOD: toBase(maxOD, "length", lengthUnit),
        modulus: toBase(modulus, "stress", stressUnit),
        ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
        freeLength: toBase(freeLength, "length", lengthUnit),
      });
      if (design.best) {
        setWireDiameter(design.best.wireDiameter * 1000);
        setMeanDiameter(design.best.meanDiameter * 1000);
        setActiveCoils(design.best.activeCoils);
        setDeflection(maxForce / Math.max(design.best.springRate, 1e-9) * 1000);
        setResult(
          wrapResult(
            solveCompressionSpringEngine({
              wireDiameter: design.best.wireDiameter,
              meanDiameter: design.best.meanDiameter,
              activeCoils: design.best.activeCoils,
              freeLength: toBase(freeLength, "length", lengthUnit),
              deflection: maxForce / Math.max(design.best.springRate, 1e-9),
              modulus: toBase(modulus, "stress", stressUnit),
              ultimateStrength: toBase(ultimateStrength, "stress", stressUnit),
            })
          )
        );
      } else {
        runCheck();
      }
      return;
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
          ultimateStrength={ultimateStrength}
          setUltimateStrength={setUltimateStrength}
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
          <CompressionSpringResults result={result} lengthUnit={lengthUnit} stressUnit={stressUnit} />
        </>
      }
    />
  );
}
