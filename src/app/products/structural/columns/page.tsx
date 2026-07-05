"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useApplicationPreset } from "@/hooks/useApplicationPreset";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import BucklingInputs from "@/components/structural/columns/BucklingInputs";
import BucklingResults from "@/components/structural/columns/BucklingResults";
import CrossCalcHandoffBanner from "@/components/design-workflows/CrossCalcHandoffBanner";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import type { BucklingConfig, BucklingResult, EndCondition } from "@/lib/structural/columns/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { searchColumnSections } from "@/lib/design-workflows/solvers/columnDesign";

type BucklingProjectData = {
  length: number;
  load: number;
  inertia: number;
  area: number;
  elasticModulus: number;
  endCondition: EndCondition;
  sectionDesignation?: string;
  targetSafetyFactor?: number;
};

type BucklingProject = LocalProject<BucklingProjectData>;

export default function Page() {
  const { wrapResult } = useStandardCalculation("columns", (units) =>
    applyUnitMap(units, {
      length: setLengthUnit,
      load: setLoadUnit,
      inertia: setInertiaUnit,
      stress: setElasticModulusUnit,
    })
  );
  // =========================
  // INPUTS
  // =========================
  const [length, setLength] = useState(3);
  const [load, setLoad] = useState(50000);
  const [inertia, setInertia] = useState(1e-7);
  const [area, setArea] = useState(0.001);
  const [elasticModulus, setElasticModulus] = useState(210e9);
  const [yieldStrength, setYieldStrength] = useState(250e6);
  const [endCondition, setEndCondition] = useState<EndCondition>("pinned");
  const [sectionDesignation, setSectionDesignation] = useState("");
  const { preset } = useApplicationPreset("columns");
  const [targetSafetyFactor, setTargetSafetyFactor] = useState(
    () => preset?.knobs.targetSafetyFactor ?? 2
  );
  const { mode } = useDesignWorkflow();

  useEffect(() => {
    if (preset?.knobs.targetSafetyFactor != null) {
      setTargetSafetyFactor(preset.knobs.targetSafetyFactor);
    }
  }, [preset?.id, preset?.knobs.targetSafetyFactor]);

  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [loadUnit, setLoadUnit] = useState("N");
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [elasticModulusUnit, setElasticModulusUnit] = useState("Pa");

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<BucklingResult | null>(null);
  const [projectName, setProjectName] = useState("Column Buckling Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<BucklingProject[]>(() =>
    loadLocalProjects<BucklingProjectData>("buckling")
  );

  // =========================
  // SOLVER
  // =========================
  const applySectionProperties = useCallback(
    (_designation: string, section: { ix: number; area: number }) => {
      setInertia(section.ix);
      setArea(section.area);
    },
    []
  );

  useSyncDesignInputs(
    "columns",
    useMemo(
      (): ModuleUserInputs => ({
        columnLength: toBase(length, "length", lengthUnit),
        axialLoad: toBase(load, "force", loadUnit),
        inertia: toBase(inertia, "inertia", inertiaUnit),
        area,
        elasticModulus: toBase(elasticModulus, "stress", elasticModulusUnit),
        endCondition,
        targetSafetyFactor,
        sectionDesignation,
      }),
      [
        length,
        lengthUnit,
        load,
        loadUnit,
        inertia,
        inertiaUnit,
        area,
        elasticModulus,
        elasticModulusUnit,
        endCondition,
        targetSafetyFactor,
        sectionDesignation,
      ]
    )
  );

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.sectionDesignation != null) setSectionDesignation(String(fields.sectionDesignation));
    if (fields.I != null) setInertia(fields.I as number);
    if (fields.area != null) setArea(fields.area as number);
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const runCheck = (sectionI = inertia, sectionA = area) => {
    const normalizedInputs: BucklingConfig = {
      length: toBase(length, "length", lengthUnit),
      P: toBase(load, "force", loadUnit),
      I: toBase(sectionI, "inertia", inertiaUnit),
      A: sectionA,
      E: toBase(elasticModulus, "stress", elasticModulusUnit),
      fy: toBase(yieldStrength, "stress", elasticModulusUnit),
      endCondition,
    };

    const raw = solveBucklingEngine(normalizedInputs);

    const converted = {
      ...raw,
      Pcr: fromBase(raw.Pcr, "force", loadUnit),
      criticalLoad: fromBase(raw.criticalLoad, "force", loadUnit),
      Le: fromBase(raw.Le, "length", lengthUnit),
      stress: fromBase(raw.stress, "stress", elasticModulusUnit),
      criticalStress: fromBase(raw.criticalStress, "stress", elasticModulusUnit),
      deflection: raw.deflection.map((v) => fromBase(v, "length", lengthUnit)),
      mode1: raw.mode1.map((v) => fromBase(v, "length", lengthUnit)),
      mode2: raw.mode2.map((v) => fromBase(v, "length", lengthUnit)),
      mode3: raw.mode3.map((v) => fromBase(v, "length", lengthUnit)),
      x: raw.x.map((v) => fromBase(v, "length", lengthUnit)),
    };

    setResult(wrapResult(converted));
  };

  const calculate = () => {
    if (mode === "design") {
      const search = searchColumnSections(
        {
          length: toBase(length, "length", lengthUnit),
          P: toBase(load, "force", loadUnit),
          E: toBase(elasticModulus, "stress", elasticModulusUnit),
          endCondition,
        },
        targetSafetyFactor
      );
      if (search.best) {
        setSectionDesignation(search.best.designation);
        setInertia(search.best.I);
        setArea(search.best.area);
        runCheck(search.best.I, search.best.area);
      } else {
        runCheck();
      }
      return;
    }

    runCheck();
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<BucklingProjectData>("buckling", projectName, {
      length,
      load,
      inertia,
      area,
      elasticModulus,
      endCondition,
      sectionDesignation,
      targetSafetyFactor,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: BucklingProject) => {
    setProjectName(p.name);
    setLength(p.length);
    setLoad(p.load);
    setInertia(p.inertia);
    setArea(p.area);
    setElasticModulus(p.elasticModulus);
    setEndCondition(p.endCondition);
    setSectionDesignation(p.sectionDesignation ?? "");
    setTargetSafetyFactor(p.targetSafetyFactor ?? 2);
  };

  // =========================
  // UI
  // =========================
  return (
    <CalculatorLayout
      moduleId="columns"
      title="Column Buckling Analysis"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as BucklingProject)}
        />
      }
      inputs={
        <>
          <CrossCalcHandoffBanner
            moduleId="columns"
            onApply={(params) => {
              if (params.inertia != null) {
                setInertia(fromBase(params.inertia, "inertia", inertiaUnit));
              }
              if (params.area != null) {
                setArea(fromBase(params.area, "area", lengthUnit));
              }
              if (params.axialLoad != null) {
                setLoad(fromBase(params.axialLoad, "force", loadUnit));
              }
            }}
          />
          <BucklingInputs
          projectName={projectName}
          setProjectName={setProjectName}
          length={length}
          setLength={setLength}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          load={load}
          setLoad={setLoad}
          loadUnit={loadUnit}
          setLoadUnit={setLoadUnit}
          inertia={inertia}
          setInertia={setInertia}
          area={area}
          setArea={setArea}
          inertiaUnit={inertiaUnit}
          setInertiaUnit={setInertiaUnit}
          elasticModulus={elasticModulus}
          setElasticModulus={setElasticModulus}
          elasticModulusUnit={elasticModulusUnit}
          setElasticModulusUnit={setElasticModulusUnit}
          yieldStrength={yieldStrength}
          setYieldStrength={setYieldStrength}
          endCondition={endCondition}
          setEndCondition={setEndCondition}
          onCalculate={calculate}
          onSave={saveProject}
          saving={saving}
          workflowMode={mode}
          sectionDesignation={sectionDesignation}
          setSectionDesignation={setSectionDesignation}
          onSectionApplied={applySectionProperties}
          targetSafetyFactor={targetSafetyFactor}
          setTargetSafetyFactor={setTargetSafetyFactor}
        />
        </>
      }
      results={<BucklingResults result={result} projectName={projectName} />}
    />
  );
}
