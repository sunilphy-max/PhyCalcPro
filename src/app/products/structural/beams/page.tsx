"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import { fromBase } from "@/lib/units/conversions";
import { normalizeInput } from "@/lib/physics";
import type { Load, UDL, BeamConfig, BeamResult } from "@/lib/structural/beams/types";
import { loadLocalProjects, saveLocalProject, type LocalProject } from "@/lib/localProjects";
import { useEquationWorkflow } from "@/hooks/useEquationWorkflow";
import { useCalculationPipeline } from "@/hooks/useCalculationPipeline";

import BeamInputs from "@/components/structural/beams/BeamInputs";
import BeamResults from "@/components/structural/beams/BeamResults";
import SavedProjectsFooter from "@/components/shared/SavedProjectsFooter";
import { materials } from "@/data/materials";

type BeamProjectData = {
  length: number;
  force: number;
  udl: number;
  inertia: number;
  c: number;
  support?: string;
  loads: Load[];
};
type BeamProject = LocalProject<BeamProjectData>;
import { solveBeamEngine } from "@/lib/structural/beams/engine";

const getNewLoadId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [udl, setUdl] = useState(200);
  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  const [support, setSupport] = useState<
    "simply_supported" | "cantilever" | "fixed_fixed"
  >("simply_supported");
  const [material, setMaterial] = useState("Steel");
  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");
  const [udlUnit, setUdlUnit] = useState("N/m");
  const [inertiaUnit, setInertiaUnit] = useState("m4");
  const [momentUnit, setMomentUnit] = useState("N·m");
  const [stressUnit, setStressUnit] = useState("Pa");
  const [meshSegments, setMeshSegments] = useState(40);

  // =========================
  // LOADS (STEP 6)
  // =========================
  const [loads, setLoads] = useState<Load[]>(() => [
    {
      id: "initial-point-load",
      type: "point",
      value: 1000,
      position: 2.5,
    },
  ]);

  const addPointLoad = () => {
  setLoads([
    ...loads,
    {
      id: getNewLoadId(),
      type: "point",
      value: 500,
      position: length / 2,
    },
  ]);
};

 const addUDL = () => {
  setLoads([
    ...loads,
    {
      id: getNewLoadId(),
      type: "udl",
      value: 200,
      start: 1,
      end: 4,
    },
  ]);
};
const handleLoadDrag = (
  id: string,
  updates: Partial<Extract<Load, { type: "point" }>>
) => {
  setLoads((prevLoads) =>
    prevLoads.map((load) => {
      if (load.id !== id) return load;

      if (load.type === "point") {
        return {
          ...load,
          ...updates,
        };
      }

      return load;
    })
  );
};
  const updateLoad = (index: number, newLoad: Load) => {
    const updated = [...loads];
    updated[index] = newLoad;
    setLoads(updated);
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

  const isUDL = (load: Load): load is UDL => load.type === "udl";

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<BeamResult | null>(null);
  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<BeamProject[]>(() =>
    loadLocalProjects<BeamProjectData>("beam")
  );
  const {
    equationExpression,
    setEquationExpression,
    equationValueDisplay,
    equationError,
    runStatusMessage,
    evaluateExpression,
    recordRun,
  } = useEquationWorkflow({
    initialExpression: "(M*c)/I",
    fromBaseOutput: (value) => fromBase(value, "stress", stressUnit),
  });

  // =========================
  // SOLVER
  // =========================
  const selectedMaterial =
  materials.find((m) => m.name === material) || materials[0];
  const beamPipeline = useCalculationPipeline({
    normalize: (input: {
      length: number;
      I: number;
      c: number;
      support: BeamConfig["support"];
      meshSegments: number;
      loads: Load[];
    }): BeamConfig => ({
      length: normalizeInput({
        value: input.length,
        unit: lengthUnit,
        dimension: "length",
      }),
      E: selectedMaterial.E,
      I: normalizeInput({
        value: input.I,
        unit: inertiaUnit,
        dimension: "inertia",
      }),
      c: normalizeInput({
        value: input.c,
        unit: lengthUnit,
        dimension: "length",
      }),
      support: input.support,
      meshSegments: Math.max(10, Math.round(input.meshSegments)),
      loads: input.loads.map((l) => {
        if (l.type === "point") {
          return {
            ...l,
            value: normalizeInput({
              value: l.value,
              unit: forceUnit,
              dimension: "force",
            }),
            position: normalizeInput({
              value: l.position,
              unit: lengthUnit,
              dimension: "length",
            }),
          };
        }
        if (isUDL(l)) {
          return {
            ...l,
            value: normalizeInput({
              value: l.value,
              unit: udlUnit,
              dimension: "forcePerLength",
            }),
            start: normalizeInput({
              value: l.start,
              unit: lengthUnit,
              dimension: "length",
            }),
            end: normalizeInput({
              value: l.end,
              unit: lengthUnit,
              dimension: "length",
            }),
          };
        }
        return {
          ...l,
          value: normalizeInput({
            value: l.value,
            unit: momentUnit,
            dimension: "moment",
          }),
          position: normalizeInput({
            value: l.position,
            unit: lengthUnit,
            dimension: "length",
          }),
        };
      }),
    }),
    solve: (normalized) => solveBeamEngine(normalized),
    convertOutput: (raw) => ({
      ...raw,
      shear: raw.shear.map((v: number) => fromBase(v, "force", forceUnit)),
      moment: raw.moment.map((v: number) => fromBase(v, "moment", momentUnit)),
      deflection: raw.deflection.map((v: number) => fromBase(v, "length", lengthUnit)),
      stress: raw.stress.map((v: number) => fromBase(v, "stress", stressUnit)),
      maxMoment: fromBase(raw.maxMoment, "moment", momentUnit),
      maxStress: fromBase(raw.maxStress, "stress", stressUnit),
      maxDeflection: fromBase(raw.maxDeflection, "length", lengthUnit),
    }),
  });
  const calculate = async () => {
    const { normalized: normalizedInputs, raw, output: converted } = beamPipeline.run({
      length,
      I,
      c,
      support,
      meshSegments,
      loads,
    });

    const { baseValue: equationStressValue, failure: equationFailure } =
      evaluateExpression({
        M: raw.maxMoment,
        c: normalizedInputs.c,
        I: normalizedInputs.I,
      });

    setResult(converted);
    await recordRun({
      projectId: "beam-local",
      modelId: "beam-analysis",
      equationId: "beam-stress-live",
      input: {
        normalizedInputs,
        units: { lengthUnit, forceUnit, udlUnit, inertiaUnit, momentUnit, stressUnit },
      },
      output: {
        maxMomentBase: raw.maxMoment,
        maxStressBase: raw.maxStress,
        evaluatedEquationStressBase: equationStressValue,
        equationError: equationFailure,
      },
    });
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = () => {
    setSaving(true);

    const projects = saveLocalProject<BeamProjectData>("beam", projectName, {
      length,
      force,
      udl,
      inertia: I,
      c,
      support,
      loads,
    });

    setSavedProjects(projects);
    setSaving(false);
  };

  // =========================
  // LOAD
  // =========================
  const loadProjectIntoForm = (p: BeamProject) => {
    setProjectName(p.name);
    setLength(p.length);
    setForce(p.force);
    setUdl(p.udl);
    setI(p.inertia);
    setC(p.c);
    setLoads(p.loads ?? []);
    if (p.support === "simply_supported" || p.support === "cantilever" || p.support === "fixed_fixed") {
      setSupport(p.support);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout title="Beam Analysis Module">
      <CalculatorLayout
        title="Beam Analysis Module"
        left={
          <div className="space-y-5">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Mesh refinement</h3>
              <p className="text-sm text-slate-500">
                Increase the beam mesh resolution for more accurate internal force and deflection curves.
              </p>
              <MeshControls
                elements={meshSegments}
                onChangeElements={setMeshSegments}
                refine
              />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
              <h3 className="font-semibold">Custom equation check</h3>
              <p className="text-sm text-slate-500">
                Evaluate a deterministic user equation with current beam results.
              </p>
              <input
                className="w-full border rounded p-2 font-mono text-sm"
                value={equationExpression}
                onChange={(event) => setEquationExpression(event.target.value)}
                placeholder="(M*c)/I"
              />
              <p className="text-xs text-slate-500">Variables: M, c, I</p>
              {equationValueDisplay !== null ? (
                <p className="text-sm">
                  Equation stress: <span className="font-semibold">{equationValueDisplay.toFixed(3)} {stressUnit}</span>
                </p>
              ) : null}
              {equationError ? (
                <p className="text-xs text-red-600">{equationError}</p>
              ) : null}
              {runStatusMessage ? (
                <p className="text-xs text-slate-500">{runStatusMessage}</p>
              ) : null}
            </div>

          </div>
        }
        footer={
          <SavedProjectsFooter
            projects={savedProjects}
            onLoad={(project) => loadProjectIntoForm(project as BeamProject)}
          />
        }
        center={
          <BeamInputs
            projectName={projectName}
            setProjectName={setProjectName}
            length={length}
            setLength={setLength}
            lengthUnit={lengthUnit}
            setLengthUnit={setLengthUnit}
            force={force}
            setForce={setForce}
            forceUnit={forceUnit}
            setForceUnit={setForceUnit}
            udl={udl}
            setUdl={setUdl}
            udlUnit={udlUnit}
            setUdlUnit={setUdlUnit}
            I={I}
            setI={setI}
            inertiaUnit={inertiaUnit}
            setInertiaUnit={setInertiaUnit}
            momentUnit={momentUnit}
            setMomentUnit={setMomentUnit}
            stressUnit={stressUnit}
            setStressUnit={setStressUnit}
            c={c}
            setC={setC}
            support={support}
            setSupport={setSupport}
            loads={loads}
            material={material}
            setMaterial={setMaterial}
            updateLoad={updateLoad}
            removeLoad={removeLoad}
            addPointLoad={addPointLoad}
            addUDL={addUDL}
            onCalculate={calculate}
            saveProject={saveProject}
            saving={saving}
          />
        }
        right={
          <BeamResults
            key={result ? JSON.stringify(result) : 'empty'}
            result={result}
            length={length}
            support={support}
            loads={loads}
            onLoadDrag={handleLoadDrag}
          />
        }
      />
    </DashboardLayout>
  );
}
