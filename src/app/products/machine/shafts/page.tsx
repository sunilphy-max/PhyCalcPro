"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { applyUnitMap } from "@/lib/units/applyUnitMap";
import { useState } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import ShaftInputs from "@/components/machine/shafts/ShaftInputs";
import ShaftResults from "@/components/machine/shafts/ShaftResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import type { ShaftConfig, ShaftResult, ShaftMaterial, LoadCase } from "@/lib/machine/shafts/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

// Standard materials
const MATERIALS: Record<string, ShaftMaterial> = {
  Steel: {
    name: "Steel",
    E: 210e9,
    G: 80e9,
    density: 7850,
    yieldStress: 250e6,
  },
  Aluminum: {
    name: "Aluminum",
    E: 70e9,
    G: 26e9,
    density: 2700,
    yieldStress: 70e6,
  },
  Titanium: {
    name: "Titanium",
    E: 110e9,
    G: 42e9,
    density: 4510,
    yieldStress: 880e6,
  },
};

type ShaftProjectData = {
  diameter: number;
  length: number;
  material: string;
  elasticModulus: number;
  shearModulus: number;
  loads: LoadCase[];
};

type ShaftProject = LocalProject<ShaftProjectData>;

export default function Page() {
  const { wrapResult } = useStandardCalculation("shafts", (units) =>
    applyUnitMap(units, {
      length: setLengthUnit,
      stress: setModulusUnit,
    })
  );
  // =========================
  // INPUTS
  // =========================
  const [diameter, setDiameter] = useState(0.05);
  const [length, setLength] = useState(1);
  const [material, setMaterial] = useState("Steel");
  const [elasticModulus, setElasticModulus] = useState(210e9);
  const [shearModulus, setShearModulus] = useState(80e9);
  const [loads, setLoads] = useState<LoadCase[]>([
    { position: 0.5, torque: 100, bendingMoment: 200 },
  ]);

  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [modulusUnit, setModulusUnit] = useState("Pa");

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<ShaftResult | null>(null);
  const [meshSegments, setMeshSegments] = useState(100);
  const [projectName, setProjectName] = useState("Shaft Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ShaftProject[]>(() =>
    loadLocalProjects<ShaftProjectData>("shaft")
  );

  const handleMaterialChange = (nextMaterial: string) => {
    setMaterial(nextMaterial);
    const mat = MATERIALS[nextMaterial];
    if (mat) {
      setElasticModulus(mat.E);
      setShearModulus(mat.G);
    }
  };

  // =========================
  // SOLVER
  // =========================
  const calculate = () => {
    const mat = MATERIALS[material] || MATERIALS["Steel"];

    const normalizedInputs: ShaftConfig = {
      geometry: {
        diameter,
        length: toBase(length, "length", lengthUnit),
      },
      material: {
        ...mat,
        E: toBase(elasticModulus, "stress", modulusUnit),
        G: toBase(shearModulus, "stress", modulusUnit),
      },
      loads,
      meshSegments: Math.max(10, Math.round(meshSegments)),
    };

    const raw = solveShaftEngine(normalizedInputs);

    const converted: ShaftResult = {
      ...raw,
      x: raw.x.map((v) => fromBase(v, "length", lengthUnit)),
      deflection: raw.deflection.map((v) =>
        fromBase(v, "length", lengthUnit)
      ),
      criticalSection: fromBase(raw.criticalSection, "length", lengthUnit),
    };

    setResult(wrapResult(converted));
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<ShaftProjectData>("shaft", projectName, {
      diameter,
      length,
      material,
      elasticModulus,
      shearModulus,
      loads,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: ShaftProject) => {
    setProjectName(p.name);
    setDiameter(p.diameter);
    setLength(p.length);
    setMaterial(p.material);
    setElasticModulus(p.elasticModulus);
    setShearModulus(p.shearModulus);
    setLoads(p.loads || []);
  };

  // =========================
  // UI
  // =========================
  return (
          <CalculatorLayout
        moduleId="shafts"
        title="Shaft Stress & Deflection Analysis"
        footer={
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as ShaftProject)}
          />
        }
        center={
          <ShaftInputs
            projectName={projectName}
            setProjectName={setProjectName}
            diameter={diameter}
            setDiameter={setDiameter}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            material={material}
            setMaterial={handleMaterialChange}
            elasticModulus={elasticModulus}
            setElasticModulus={setElasticModulus}
            shearModulus={shearModulus}
            setShearModulus={setShearModulus}
            modulusUnit={modulusUnit}
            setModulusUnit={setModulusUnit}
            loads={loads}
            setLoads={setLoads}
            meshSegments={meshSegments}
            setMeshSegments={setMeshSegments}
            onCalculate={calculate}
            onSave={saveProject}
            saving={saving}
          />
        }
        right={
          <ShaftResults key={result ? JSON.stringify(result) : 'empty'} result={result} projectName={projectName} />
        }
      />
  );
}
