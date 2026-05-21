"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ShaftInputs from "@/components/machine/shafts/ShaftInputs";
import ShaftResults from "@/components/machine/shafts/ShaftResults";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import type { ShaftConfig, ShaftResult, ShaftMaterial, LoadCase } from "@/lib/machine/shafts/types";

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

export default function Page() {
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
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("shaft_projects")
      .select("*")
      .order("created_at", { ascending: false });

    setSavedProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Update modulus when material changes
  useEffect(() => {
    const mat = MATERIALS[material];
    if (mat) {
      setElasticModulus(mat.E);
      setShearModulus(mat.G);
    }
  }, [material]);

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

    setResult(converted);
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = async () => {
    setSaving(true);

    await supabase.from("shaft_projects").insert([
      {
        name: projectName,
        diameter,
        length,
        material,
        elasticModulus,
        shearModulus,
        loads,
      },
    ]);

    setSaving(false);
    loadProjects();
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: any) => {
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
    <DashboardLayout title="Shaft Design Module">
      <CalculatorLayout
        title="Shaft Stress & Deflection Analysis"
        left={
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Saved Projects
              </h3>
              {savedProjects.length === 0 ? (
                <p className="text-sm text-slate-500">No saved projects</p>
              ) : (
                <div className="space-y-2">
                  {savedProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadProjectIntoForm(p)}
                      className="w-full text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
            setMaterial={setMaterial}
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
    </DashboardLayout>
  );
}