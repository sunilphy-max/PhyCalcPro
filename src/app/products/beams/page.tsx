"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beam/solver";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import type { Load, BeamConfig } from "@/lib/beam/types";
import BeamDiagram from "@/components/BeamDiagram";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Page() {
  // =========================
  // INPUTS
  // =========================
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [udl, setUdl] = useState(200);
  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  // =========================
  // UNIT PER FIELD (PRO LEVEL)
  // =========================
  const [lengthUnit, setLengthUnit] = useState("m");
  const [forceUnit, setForceUnit] = useState("N");
  const [udlUnit, setUdlUnit] = useState("N/m");
  const [inertiaUnit, setInertiaUnit] = useState("m4");

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
  // CORE SOLVER
  // =========================
  const calculate = () => {
    const toSI = {
  length: convertLength(length, lengthUnit),
  force: convertForce(force, forceUnit),
  udl: convertUDL(udl, udlUnit),
  inertia: convertInertia(I, inertiaUnit),
};
    const normalizedInputs: BeamConfig = {
      length: toBase(length, "length", lengthUnit),
      E: 210e9,
      I: toBase(I, "inertia", inertiaUnit),
      c: toBase(c, "length", lengthUnit),

      support: "simply_supported",

      loads: [
        {
          type: "point",
          value: toBase(force, "force", forceUnit),
          position: toBase(length / 2, "length", lengthUnit),
        },
        {
          type: "udl",
          value: toBase(udl, "forcePerLength", udlUnit),
          start: toBase(1, "length", lengthUnit),
          end: toBase(4, "length", lengthUnit),
        },
      ] as Load[],
    };

    const raw = solveBeam(normalizedInputs);

    const converted = {
      ...raw,

      shear: raw.shear.map((v: number) => fromBase(v, "force", forceUnit)),
      moment: raw.moment.map((v: number) => fromBase(v, "moment", forceUnit)),
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
  // LOAD INTO FORM
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

        // ================= LEFT =================
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Saved Projects</h3>

            {savedProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => loadProjectIntoForm(p)}
                className="w-full text-left px-3 py-2 mb-2 bg-gray-100 rounded"
              >
                {p.name}
              </button>
            ))}
          </div>
        }

        // ================= CENTER =================
        center={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <input
              className="w-full p-2 border rounded"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            {/* LENGTH */}
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                value={length}
                onChange={(e) => setLength(+e.target.value)}
              />
              <select value={lengthUnit} onChange={(e) => setLengthUnit(e.target.value)}>
                <option value="m">m</option>
                <option value="mm">mm</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>

            {/* FORCE */}
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                value={force}
                onChange={(e) => setForce(+e.target.value)}
              />
              <select value={forceUnit} onChange={(e) => setForceUnit(e.target.value)}>
                <option value="N">N</option>
                <option value="kN">kN</option>
                <option value="lbf">lbf</option>
              </select>
            </div>

            {/* UDL */}
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                value={udl}
                onChange={(e) => setUdl(+e.target.value)}
              />
              <select value={udlUnit} onChange={(e) => setUdlUnit(e.target.value)}>
                <option value="N/m">N/m</option>
                <option value="kN/m">kN/m</option>
                <option value="lbf/ft">lbf/ft</option>
              </select>
            </div>

            {/* INERTIA */}
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                value={I}
                onChange={(e) => setI(+e.target.value)}
              />
              <select value={inertiaUnit} onChange={(e) => setInertiaUnit(e.target.value)}>
                <option value="m4">m⁴</option>
                <option value="mm4">mm⁴</option>
                <option value="in4">in⁴</option>
              </select>
            </div>

            <button
              onClick={calculate}
              className="w-full bg-black text-white py-2 rounded"
            >
              Solve
            </button>

            <button
              onClick={saveProject}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }

        // ================= RIGHT =================
       right={
  <div className="bg-white rounded-xl p-4 shadow-sm">

    {result ? (
      <>
        
        {/* ✅ ADD IT HERE (TOP OF RESULTS) */}
        <BeamDiagram
          length={length}
          loads={normalizedInputs.loads}
        />

        {/* GRAPHS */}
        <Plot
          data={[{ x: result.x, y: result.shear, type: "scatter", mode: "lines" }]}
          layout={{
            title: `Shear Force`,
            xaxis: { title: "Length" },
            yaxis: { title: "Force" },
          }}
        />

        <Plot
          data={[{ x: result.x, y: result.moment, type: "scatter", mode: "lines" }]}
          layout={{
            title: `Bending Moment`,
            xaxis: { title: "Length" },
            yaxis: { title: "Moment" },
          }}
        />

        <Plot
          data={[{ x: result.x, y: result.deflection, type: "scatter", mode: "lines" }]}
          layout={{
            title: `Deflection`,
            xaxis: { title: "Length" },
            yaxis: { title: "Deflection" },
          }}
        />

        <Plot
          data={[{ x: result.x, y: result.stress, type: "scatter", mode: "lines" }]}
          layout={{
            title: `Stress`,
            xaxis: { title: "Length" },
            yaxis: { title: "Stress" },
          }}
        />

      </>
    ) : (
      <p className="text-gray-400">Run analysis to see results</p>
    )}

  </div>
}
        
      />
    </DashboardLayout>
  );
}