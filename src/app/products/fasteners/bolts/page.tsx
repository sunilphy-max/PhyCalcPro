"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import ScrewsInputs from "@/components/fasteners/bolts/ScrewsInputs";
import ScrewsResults from "@/components/fasteners/bolts/ScrewsResults";
import { solveScrewEngine } from "@/lib/fasteners/bolts/engine";
import type { ScrewConfig, ScrewResult } from "@/lib/fasteners/bolts/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type ScrewProjectData = {
  config: ScrewConfig;
};

type ScrewProject = LocalProject<ScrewProjectData>;

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
  const [projectName, setProjectName] = useState("Bolt Design Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ScrewProject[]>(() =>
    loadLocalProjects<ScrewProjectData>("screws")
  );

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
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<ScrewProjectData>("screws", projectName, {
      config,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: ScrewProject) => {
    setProjectName(p.name);
    setConfig(p.config);
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Bolt Design Module">
      <CalculatorLayout
        title="Bolt Design Analysis"
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
