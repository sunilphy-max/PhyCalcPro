"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import MeshControls from "@/components/shared/MeshControls";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import type { Load, BeamConfig, BeamResult } from "@/lib/structural/beams/types";

import BeamInputs from "@/components/structural/beams/BeamInputs";
import BeamResults from "@/components/structural/beams/BeamResults";
import SavedProjects from "@/components/structural/beams/SavedProjects";
import { materials } from "@/data/materials";

type BeamProject = {
  id: string;
  name: string;
  length: number;
  force: number;
  udl: number;
  inertia: number;
  c: number;
};
import { solveBeamEngine } from "@/lib/structural/beams/engine";

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
  const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const [loads, setLoads] = useState<Load[]>(() => [
    {
      id: createId(),
      type: "point",
      value: 1000,
      position: 2.5,
    },
  ]);

  const addPointLoad = () => {
  setLoads([
    ...loads,
    {
      id: createId(),
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
      id: createId(),
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

  // =========================
  // UI STATE
  // =========================
  const [result, setResult] = useState<BeamResult | null>(null);
  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<BeamProject[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("beam_projects")
      .select("*")
      .order("created_at", { ascending: false });

    setSavedProjects((data as BeamProject[]) || []);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      await loadProjects();
    };

    fetchProjects();
  }, []);

  // =========================
  // SOLVER
  // =========================
  const selectedMaterial =
  materials.find((m) => m.name === material) || materials[0];
  const calculate = () => {
    const normalizedInputs: BeamConfig = {
      length: toBase(length, "length", lengthUnit),
      E: selectedMaterial.E,
      I: toBase(I, "inertia", inertiaUnit),
      c: toBase(c, "length", lengthUnit),
      support,
      meshSegments: Math.max(10, Math.round(meshSegments)),
      loads: loads.map((l) => {
        if (l.type === "point") {
          return {
            ...l,
            value: toBase(l.value, "force", forceUnit),
            position: toBase(l.position, "length", lengthUnit),
          };
        }

        if (l.type === "udl") {
          return {
            ...l,
            value: toBase(l.value, "forcePerLength", udlUnit),
            start: toBase(l.start, "length", lengthUnit),
            end: toBase(l.end, "length", lengthUnit),
          };
        }

        return {
          ...l,
          value: toBase(l.value, "moment", momentUnit),
          position: toBase(l.position, "length", lengthUnit),
        };
      }),
    };

    const raw = solveBeamEngine(normalizedInputs);

    const converted = {
      ...raw,
      shear: raw.shear.map((v: number) =>
        fromBase(v, "force", forceUnit)
      ),
      moment: raw.moment.map((v: number) =>
        fromBase(v, "moment", momentUnit)
      ),
      deflection: raw.deflection.map((v: number) =>
        fromBase(v, "length", lengthUnit)
      ),
      stress: raw.stress.map((v: number) =>
        fromBase(v, "stress", stressUnit)
      ),
      maxMoment: fromBase(raw.maxMoment, "moment", momentUnit),
      maxStress: fromBase(raw.maxStress, "stress", stressUnit),
      maxDeflection: fromBase(raw.maxDeflection, "length", lengthUnit),
    };

    setResult(converted);
  };

  // =========================
  // SAVE
  // =========================
  const saveProject = async () => {
    setSaving(true);

    await supabase.from("beam_projects").insert([
      {
        name: projectName,
        length,
        force,
        udl,
        inertia: I,
        c,
      },
    ]);

    setSaving(false);
    loadProjects();
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

            <SavedProjects
              savedProjects={savedProjects}
              loadProjectIntoForm={loadProjectIntoForm}
            />
          </div>
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