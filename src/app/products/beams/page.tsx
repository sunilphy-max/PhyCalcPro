"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beam/solver";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { supabase } from "@/lib/supabase";
import { toBase, fromBase } from "@/lib/units/conversions";
import { UnitSystems, UnitSystem } from "@/lib/units/systems";
import type { Load, BeamConfig } from "@/lib/beam/types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Page() {
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [udl, setUdl] = useState(200);

  const [unitSystem, setUnitSystem] = useState<UnitSystem>("SI");

  const [support, setSupport] = useState<
    "simply_supported" | "cantilever" | "fixed_fixed"
  >("simply_supported");

  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  const [result, setResult] = useState<any>(null);

  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  const units = UnitSystems[unitSystem];

  const calculate = () => {
    const normalizedInputs: BeamConfig = {
      length: toBase(length, "length", units.length),
      E: 210e9,
      I: toBase(I, "inertia", units.inertia),
      c: toBase(c, "length", units.length),
      support,
      loads: [
  {
    type: "point",
    value: toBase(force, "force", units.force),
    position: toBase(length / 2, "length", units.length),
  },
  {
    type: "udl",
    value: toBase(udl, "forcePerLength", units.forcePerLength),
    start: toBase(1, "length", units.length),
    end: toBase(4, "length", units.length),
  },
] as Load[],
    };

    const rawResult = solveBeam(normalizedInputs);

    const convertedResult = {
      ...rawResult,
      shear: rawResult.shear.map((v: number) =>
        fromBase(v, "force", units.force)
      ),
      moment: rawResult.moment.map((v: number) =>
        fromBase(v, "moment", units.moment)
      ),
      deflection: rawResult.deflection.map((v: number) =>
        fromBase(v, "length", units.length)
      ),
      stress: rawResult.stress.map((v: number) =>
        fromBase(v, "stress", units.stress)
      ),
      maxStress: fromBase(rawResult.maxStress, "stress", units.stress),
      maxDeflection: fromBase(rawResult.maxDeflection, "length", units.length),
    };

    setResult(convertedResult);
  };

  const saveProject = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.from("beam_projects").insert([
        {
          name: projectName,
          length,
          force,
          udl,
          inertia: I,
          c,
          support,
          unit_system: unitSystem,
        },
      ]);

      if (error) throw error;

      alert("Project saved!");
      loadProjects();
    } catch {
      alert("Error saving project");
    } finally {
      setSaving(false);
    }
  };

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

  const loadProjectIntoForm = (p: any) => {
    setProjectName(p.name);
    setLength(p.length);
    setForce(p.force);
    setUdl(p.udl);
    setI(p.inertia);
    setC(p.c);
    setSupport(p.support);
    setUnitSystem(p.unit_system || "SI");
  };

  return (
    <DashboardLayout title="Beam Analysis Module">
      <CalculatorLayout
        title="Beam Analysis Module"

        left={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Saved Projects</h3>

            {savedProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => loadProjectIntoForm(p)}
                className="w-full text-left px-3 py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {p.name}
              </button>
            ))}
          </div>
        }

        center={
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
            />

            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            >
              <option value="SI">SI</option>
              <option value="Imperial">Imperial</option>
            </select>

            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              value={length}
              onChange={(e) => setLength(+e.target.value)}
              placeholder={`Length (${units.length})`}
            />

            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              value={force}
              onChange={(e) => setForce(+e.target.value)}
              placeholder={`Point Load (${units.force})`}
            />

            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              value={udl}
              onChange={(e) => setUdl(+e.target.value)}
              placeholder={`UDL (${units.forcePerLength})`}
            />

            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              value={I}
              onChange={(e) => setI(+e.target.value)}
              placeholder={`Inertia (${units.inertia})`}
            />

            <input
              className="w-full px-3 py-2 border rounded-lg"
              type="number"
              value={c}
              onChange={(e) => setC(+e.target.value)}
              placeholder={`Outer Fiber Distance (${units.length})`}
            />

            <button
              onClick={calculate}
              className="w-full bg-gray-900 text-white py-2 rounded-lg"
            >
              Solve
            </button>
          </div>
        }

        right={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            {result ? (
              <>
                <Plot data={[{ x: result.x, y: result.shear, type: "scatter" }]}
                      layout={{ title: `Shear (${units.force})` }} />

                <Plot data={[{ x: result.x, y: result.moment, type: "scatter" }]}
                      layout={{ title: `Moment (${units.moment})` }} />

                <Plot data={[{ x: result.x, y: result.deflection, type: "scatter" }]}
                      layout={{ title: `Deflection (${units.length})` }} />

                <Plot data={[{ x: result.x, y: result.stress, type: "scatter" }]}
                      layout={{ title: `Stress (${units.stress})` }} />

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p><b>Max Stress:</b> {result.maxStress.toExponential(3)} {units.stress}</p>
                  <p><b>Max Deflection:</b> {result.maxDeflection.toExponential(3)} {units.length}</p>
                </div>
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