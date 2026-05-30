"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { useState } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
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
  const { wrapResult } = useStandardCalculation("bolts");
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
    setResult(wrapResult(raw));
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
          <CalculatorLayout
        moduleId="bolts"
        title="Bolt Design Analysis"
        footer={
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as ScrewProject)}
          />
        }
        left={
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
        center={
          <CalculatorGuidancePanel title="Bolt design">
            <p>VDI-style bolt checks for tensile, shear, and bearing utilization. Save projects for design iterations.</p>
          </CalculatorGuidancePanel>
        }
        right={
          <ScrewsResults key={result ? JSON.stringify(result) : 'empty'} result={result} projectName={projectName} />
        }
      />
  );
}
