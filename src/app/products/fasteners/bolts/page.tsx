"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import { useState } from "react";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import CalculatorLayout from "@/components/CalculatorLayout";
import ScrewsInputs from "@/components/fasteners/bolts/ScrewsInputs";
import ScrewsResults from "@/components/fasteners/bolts/ScrewsResults";
import BoltPatternInputs from "@/components/fasteners/bolts/BoltPatternInputs";
import BoltPatternResults from "@/components/fasteners/bolts/BoltPatternResults";
import { solveScrewEngine } from "@/lib/fasteners/bolts/engine";
import { solveBoltPattern } from "@/lib/fasteners/bolts/boltPattern";
import type { ScrewConfig, ScrewResult } from "@/lib/fasteners/bolts/types";
import type { BoltPatternResult } from "@/lib/fasteners/bolts/boltPatternTypes";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { toBase } from "@/lib/units/conversions";

type AnalysisMode = "power_screw" | "bolt_pattern";

type ScrewProjectData = {
  config: ScrewConfig;
};

type ScrewProject = LocalProject<ScrewProjectData>;

export default function Page() {
  const { wrapResult } = useStandardCalculation("bolts");
  const [mode, setMode] = useState<AnalysisMode>("power_screw");
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

  const [boltCount, setBoltCount] = useState(6);
  const [patternRadius, setPatternRadius] = useState(0.1);
  const [shearForce, setShearForce] = useState(25000);
  const [axialForce, setAxialForce] = useState(10000);
  const [eccentricityX, setEccentricityX] = useState(0.02);
  const [eccentricityY, setEccentricityY] = useState(0);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");

  const [result, setResult] = useState<ScrewResult | null>(null);
  const [patternResult, setPatternResult] = useState<BoltPatternResult | null>(null);
  const [projectName, setProjectName] = useState("Bolt Design Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ScrewProject[]>(() =>
    loadLocalProjects<ScrewProjectData>("screws")
  );

  const calculate = () => {
    if (mode === "bolt_pattern") {
      setPatternResult(
        solveBoltPattern({
          boltCount: Math.max(2, Math.round(boltCount)),
          patternRadius: toBase(patternRadius, "length", lengthUnit),
          shearForce: toBase(shearForce, "force", forceUnit),
          axialForce: toBase(axialForce, "force", forceUnit),
          eccentricityX: toBase(eccentricityX, "length", lengthUnit),
          eccentricityY: toBase(eccentricityY, "length", lengthUnit),
        })
      );
      setResult(null);
      return;
    }
    setPatternResult(null);
    setResult(wrapResult(solveScrewEngine(config)));
  };

  const saveProject = () => {
    setSaving(true);
    const projects = saveLocalProject<ScrewProjectData>("screws", projectName, { config });
    setSavedProjects(projects);
    setSaving(false);
  };

  const loadProjectIntoForm = (p: ScrewProject) => {
    setProjectName(p.name);
    setConfig(p.config);
    setMode("power_screw");
  };

  return (
    <CalculatorLayout
      moduleId="bolts"
      title="Bolt Design Analysis"
      footer={
        mode === "power_screw" ? (
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as ScrewProject)}
          />
        ) : undefined
      }
      left={
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Analysis mode</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("power_screw")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "power_screw" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Power / ball screw
              </button>
              <button
                type="button"
                onClick={() => setMode("bolt_pattern")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === "bolt_pattern" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                Bolt pattern
              </button>
            </div>
          </div>
          {mode === "power_screw" ? (
            <ScrewsInputs
              projectName={projectName}
              setProjectName={setProjectName}
              config={config}
              setConfig={setConfig}
              onCalculate={calculate}
              onSave={saveProject}
              saving={saving}
            />
          ) : (
            <BoltPatternInputs
              boltCount={boltCount}
              setBoltCount={setBoltCount}
              patternRadius={patternRadius}
              setPatternRadius={setPatternRadius}
              shearForce={shearForce}
              setShearForce={setShearForce}
              axialForce={axialForce}
              setAxialForce={setAxialForce}
              eccentricityX={eccentricityX}
              setEccentricityX={setEccentricityX}
              eccentricityY={eccentricityY}
              setEccentricityY={setEccentricityY}
              lengthUnit={lengthUnit}
              setLengthUnit={setLengthUnit}
              forceUnit={forceUnit}
              setForceUnit={setForceUnit}
              onCalculate={calculate}
            />
          )}
        </div>
      }
      center={
        <CalculatorGuidancePanel title="Bolt design">
          <p>
            Power and ball screw mechanics, or elastic bolt-pattern load sharing for eccentric shear on a bolt
            circle (VDI 2230–style screening).
          </p>
        </CalculatorGuidancePanel>
      }
      right={
        mode === "power_screw" ? (
          <ScrewsResults key={result ? JSON.stringify(result) : "empty"} result={result} projectName={projectName} />
        ) : (
          <BoltPatternResults result={patternResult} forceUnit={forceUnit} />
        )
      }
    />
  );
}
