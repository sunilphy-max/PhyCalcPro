"use client";

import { useState, useEffect } from "react";
import { solveBeam } from "@/lib/beam/solver";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import type { Load, BeamConfig } from "@/lib/beam/types";

import BeamInputs from "@/components/beam/BeamInputs";
import BeamResults from "@/components/beam/BeamResults";
import SavedProjects from "@/components/beam/SavedProjects";

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

  // =========================
  // UNITS
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");
  const [udlUnit, setUdlUnit] = useState("N/m");
  const [inertiaUnit, setInertiaUnit] = useState("m4");

  // =========================
  // LOADS (STEP 6)
  // =========================
  const [loads, setLoads] = useState<Load[]>([
    { type: "point", value: 1000, position: 2.5 },
  ]);

  const addPointLoad = () => {
    setLoads([
      ...loads,
      { type: "point", value: 500, position: length / 2 },
    ]);
  };

  const addUDL = () => {
    setLoads([...loads, { type: "udl", value: 200, start: 1, end: 4 }]);
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
  const [result, setResult] = useState<any>(null);
  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =========================
  // LOAD PROJECTS
  // =========================
  const loadProjects = async () => {
    const { data } = await supabase
      .from("beam_projects")
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
    const normalizedInputs: BeamConfig = {
      length: toBase(length, "length", lengthUnit),
      E: 210e9,
      I: toBase(I, "inertia", inertiaUnit),
      c: toBase(c, "length", lengthUnit),
      support,

      loads: loads.map((l) => {
        if (l.type === "point") {
          return {
            ...l,
            value: toBase(l.value, "force", forceUnit),
            position: toBase(l.position, "length", lengthUnit),
          };
        }

        return {
          ...l,
          value: toBase(l.value, "forcePerLength", udlUnit),
          start: toBase(l.start, "length", lengthUnit),
          end: toBase(l.end, "length", lengthUnit),
        };
      }),
    };

    const raw = solveBeam(normalizedInputs);

    const converted = {
      ...raw,
      shear: raw.shear.map((v: number) =>
        fromBase(v, "force", forceUnit)
      ),
      moment: raw.moment.map((v: number) =>
        fromBase(v, "moment", forceUnit)
      ),
      deflection: raw.deflection.map((v: number) =>
        fromBase(v, "length", lengthUnit)
      ),
      stress: raw.stress.map((v: number) =>
        fromBase(v, "stress", forceUnit)
      ),
      maxStress: fromBase(raw.maxStress, "stress", forceUnit),
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
  const loadProjectIntoForm = (p: any) => {
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
          <SavedProjects
            savedProjects={savedProjects}
            loadProjectIntoForm={loadProjectIntoForm}
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
            support={support}
            setSupport={setSupport}
            loads={loads}
            updateLoad={updateLoad}
            removeLoad={removeLoad}
            addPointLoad={addPointLoad}
            addUDL={addUDL}
            calculate={calculate}
            saveProject={saveProject}
            saving={saving}
          />
        }
        right={
          <BeamResults
            result={result}
            length={length}
            support={support}
            loads={loads}
          />
        }
      />
    </DashboardLayout>
  );
}