"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import PowerScrewInputs from "@/components/machine/power-screws/PowerScrewInputs";
import PowerScrewResults from "@/components/machine/power-screws/PowerScrewResults";
import { solveScrewEngine } from "@/lib/fasteners/bolts/engine";
import type { ScrewConfig, ScrewResult } from "@/lib/fasteners/bolts/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";

type ScrewProjectData = { config: ScrewConfig };
type ScrewProject = LocalProject<ScrewProjectData>;

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("power-screws");
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
  const [result, setResult] = useState<ScrewResult | null>(null);
  const [projectName, setProjectName] = useState("Power Screw Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ScrewProject[]>(() =>
    loadLocalProjects<ScrewProjectData>("power-screws")
  );

  const runCheck = () => {
    setResult(wrapResult(solveScrewEngine(config)));
  };

  const saveProject = () => {
    setSaving(true);
    setSavedProjects(saveLocalProject<ScrewProjectData>("power-screws", projectName, { config }));
    setSaving(false);
  };

  const loadProjectIntoForm = (p: ScrewProject) => {
    setProjectName(p.name);
    setConfig(p.config);
  };

  const designUserInputs = useMemo((): ModuleUserInputs => ({
    axialLoad: config.axialForce,
    allowableStressPa: 260e6,
  }), [config.axialForce]);

  useSyncDesignInputs("power-screws", designUserInputs);

  const applyDesignFields = useCallback((fields: Record<string, unknown>) => {
    if (fields.majorDiameter != null) {
      setConfig((prev) => ({ ...prev, majorDiameter: fields.majorDiameter as number }));
    }
  }, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("power-screws", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="power-screws"
      title="Power & Ball Screws"
      footer={
        <SavedProjectsFooter
          projects={savedProjects}
          onLoad={(project) => loadProjectIntoForm(project as ScrewProject)}
        />
      }
      inputs={
        <PowerScrewInputs
          projectName={projectName}
          setProjectName={setProjectName}
          config={config}
          setConfig={setConfig}
          onCalculate={calculate}
          onSave={saveProject}
          saving={saving}
        />
      }
      results={
        <PowerScrewResults key={result ? JSON.stringify(result) : "empty"} result={result} projectName={projectName} />
      }
    />
  );
}
