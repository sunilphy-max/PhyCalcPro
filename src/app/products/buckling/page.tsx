"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import BucklingInputs from "@/components/buckling/BucklingInputs";
import BucklingResults from "@/components/buckling/BucklingResults";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveBucklingEngine } from "@/lib/buckling/engine";
import type { BucklingConfig, BucklingResult, EndCondition } from "@/lib/buckling/types";

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
  const [projectName, setProjectName] = useState("Buckling Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("buckling_projects")
      .select("*")
      .order("created_at", { ascending: false });

    setSavedProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // =========================
  // SOLVER
  // =========================
  const calculate = () => {
    const normalizedInputs: BucklingConfig = {
      length: toBase(length, "length", lengthUnit),
      E: toBase(elasticModulus, "stress", elasticModulusUnit),
      I: toBase(inertia, "inertia", inertiaUnit),
      A: area,
      P: toBase(load, "force", loadUnit),
      endCondition,
    };

    const raw = solveBucklingEngine(normalizedInputs);

    const converted: BucklingResult = {
      ...raw,
      Pcr: fromBase(raw.Pcr, "force", loadUnit),
      Le: fromBase(raw.Le, "length", lengthUnit),
      stress: fromBase(raw.stress, "stress", elasticModulusUnit),
      criticalStress: fromBase(
        raw.criticalStress,
        "stress",
        elasticModulusUnit
      ),
      deflection: raw.deflection.map((v) =>
        fromBase(v, "length", lengthUnit)
      ),
      x: raw.x.map((v) => fromBase(v, "length", lengthUnit)),
    };

    setResult(converted);
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = async () => {
    setSaving(true);

    await supabase.from("buckling_projects").insert([
      {
        name: projectName,
        length,
        load,
        inertia,
        area,
        elasticModulus,
        endCondition,
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
    <DashboardLayout title="Column Buckling Module">
      <CalculatorLayout
        title="Column Buckling Analysis"
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
          <BucklingResults result={result} projectName={projectName} />
        }
      />
    </DashboardLayout>
  );
}