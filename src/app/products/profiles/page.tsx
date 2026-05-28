"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import ProfilesInputs from "@/components/profiles/ProfilesInputs";
import ProfilesResults from "@/components/profiles/ProfilesResults";
import { solveAreaPropertiesEngine } from "@/lib/profiles/engine";
import type { AreaPropertiesConfig, AreaPropertiesResult, ShapeProperties } from "@/lib/profiles/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type ProfilesProjectData = {
  shape: ShapeProperties;
};

type ProfilesProject = LocalProject<ProfilesProjectData>;

export default function Page() {
  const { wrapResult } = useStandardCalculation("profiles");

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
  const [savedProjects, setSavedProjects] = useState<ProfilesProject[]>(() =>
    loadLocalProjects<ProfilesProjectData>("profiles")
  );

  // =========================
  // SOLVER
  // =========================
  const calculate = () => {
    const config: AreaPropertiesConfig = {
      shape,
    };

    const raw = solveAreaPropertiesEngine(config);
    setResult(wrapResult(raw));
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<ProfilesProjectData>("profiles", projectName, {
      shape,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: ProfilesProject) => {
    setProjectName(p.name);
    setShape(p.shape);
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Area Properties Module">
      <CalculatorLayout
        moduleId="profiles"
        title="Cross-Sectional Area Properties"
        footer={
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as ProfilesProject)}
          />
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
