"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ProfilesInputs from "@/components/profiles/ProfilesInputs";
import ProfilesResults from "@/components/profiles/ProfilesResults";
import { supabase } from "@/lib/supabase";
import { solveAreaPropertiesEngine } from "@/lib/profiles/engine";
import type { AreaPropertiesConfig, AreaPropertiesResult, ShapeProperties } from "@/lib/profiles/types";

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [shape, setShape] = useState<ShapeProperties>({
    shape: "rectangle",
    rectangle: { width: 0.1, height: 0.2 },
  });

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<AreaPropertiesResult | null>(null);
  const [projectName, setProjectName] = useState("Area Properties Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("profiles_projects")
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
    const config: AreaPropertiesConfig = {
      shape,
    };

    const raw = solveAreaPropertiesEngine(config);
    setResult(raw);
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = async () => {
    setSaving(true);

    await supabase.from("profiles_projects").insert([
      {
        name: projectName,
        shape,
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
    setShape(p.shape);
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Area Properties Module">
      <CalculatorLayout
        title="Cross-Sectional Area Properties"
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
          <ProfilesInputs
            projectName={projectName}
            setProjectName={setProjectName}
            shape={shape}
            setShape={setShape}
            onCalculate={calculate}
            onSave={saveProject}
            saving={saving}
          />
        }
        right={
          <ProfilesResults key={result ? JSON.stringify(result) : 'empty'} result={result} projectName={projectName} />
        }
      />
    </DashboardLayout>
  );
}