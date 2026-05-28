"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import BucklingInputs from "@/components/structural/columns/BucklingInputs";
import BucklingResults from "@/components/structural/columns/BucklingResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import type { BucklingConfig, BucklingResult, EndCondition } from "@/lib/structural/columns/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type BucklingProjectData = {
  length: number;
  load: number;
  inertia: number;
  area: number;
  elasticModulus: number;
  endCondition: EndCondition;
};

type BucklingProject = LocalProject<BucklingProjectData>;

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [length, setLength] = useState(3);
  const [load, setLoad] = useState(50000);
  const [inertia, setInertia] = useState(1e-7);
  const [area, setArea] = useState(0.001);
  const [elasticModulus, setElasticModulus] = useState(210e9);
  const [endCondition, setEndCondition] = useState<EndCondition>("pinned");

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
  const calculate = () => {
    const normalizedInputs: BucklingConfig = {
      length: toBase(length, "length", lengthUnit),
      P: toBase(load, "force", loadUnit),
      I: toBase(inertia, "inertia", inertiaUnit),
      A: area, // Area is already in m^2, no conversion needed
      E: toBase(elasticModulus, "stress", elasticModulusUnit),
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

    setResult(converted);
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
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Column Buckling Analysis">
      <CalculatorLayout
        title="Column Buckling Analysis"
        footer={
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as BucklingProject)}
          />
        }
        center={
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
            endCondition={endCondition}
            setEndCondition={setEndCondition}
            onCalculate={calculate}
            onSave={saveProject}
            saving={saving}
          />
        }
        right={
          <BucklingResults
            result={result}
            projectName={projectName}
          />
        }
      />
    </DashboardLayout>
  );
}
