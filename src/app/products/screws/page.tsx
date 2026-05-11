"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ScrewsInputs from "@/components/screws/ScrewsInputs";
import ScrewsResults from "@/components/screws/ScrewsResults";
import { supabase } from "@/lib/supabase";
import { solveScrewEngine } from "@/lib/screws/engine";
import type { ScrewConfig, ScrewResult } from "@/lib/screws/types";

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [config, setConfig] = useState<ScrewConfig>({
    screwType: "power_screw",
    threadType: "square",
    majorDiameter: 0.05,
    pitch: 0.01,
    lead: 0.01,
    length: 0.5,
    axialForce: 10000,
    frictionCoefficient: 0.15,
    starts: 1,
  });

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<ScrewResult | null>(null);
  const [projectName, setProjectName] = useState("Screw Design Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("screws_projects")
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
    const raw = solveScrewEngine(config);
    setResult(raw);
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = async () => {
    setSaving(true);

    await supabase.from("screws_projects").insert([
      {
        name: projectName,
        config,
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
    setConfig(p.config);
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Screws Module">
      <CalculatorLayout
        title="Screw Design Analysis"
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
          <ScrewsInputs
            projectName={projectName}
            setProjectName={setProjectName}
            config={config}
            setConfig={setConfig}
            onCalculate={calculate}
            onSave={saveProject}
            saving={saving}
          />
        }
        right={
          <ScrewsResults key={result ? JSON.stringify(result) : 'empty'} result={result} projectName={projectName} />
        }
      />
    </DashboardLayout>
  );
}