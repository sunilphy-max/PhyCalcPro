"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beam/solver";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import { supabase } from "@/lib/supabase";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Page() {
  // =============================
  // STATE
  // =============================
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);

  const [support, setSupport] = useState<
    "simply_supported" | "cantilever" | "fixed_fixed"
  >("simply_supported");

  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  const [result, setResult] = useState<any>(null);

  const [projectName, setProjectName] = useState("Beam Project");
  const [saving, setSaving] = useState(false);

  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  // =============================
  // CALCULATE
  // =============================
  const calculate = () => {
    const res = solveBeam({
      length,
      E: 210e9,
      I,
      c,
      support,
      loads: [
        {
          type: "point",
          value: force,
          position: length / 2,
        },
        {
          type: "udl",
          value: 200,
          start: 1,
          end: 4,
        },
      ],
    });

    setResult(res);
  };

  // =============================
  // SAVE TO SUPABASE
  // =============================
  const saveProject = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.from("beam_projects").insert([
        {
          name: projectName,
          length,
          force,
          inertia: I,
          c,
          support,
        },
      ]);

      if (error) throw error;

      alert("Project saved!");
      loadProjects();
    } catch (err: any) {
      console.error(err);
      alert("Error saving project");
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // LOAD PROJECTS
  // =============================
  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("beam_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setSavedProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // =============================
  // LOAD INTO FORM
  // =============================
  const loadProjectIntoForm = (p: any) => {
    setProjectName(p.name);
    setLength(p.length);
    setForce(p.force);
    setI(p.inertia);
    setC(p.c);
    setSupport(p.support);
  };

  // =============================
  // UI
  // =============================
  return (
    <DashboardLayout title="Beam Analysis Module">

      <CalculatorLayout

        title="Beam Analysis Module"

        // ================= LEFT =================
        left={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Saved Projects</h3>

            {savedProjects.length === 0 ? (
              <p className="text-gray-400 text-sm">No saved projects</p>
            ) : (
              savedProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadProjectIntoForm(p)}
                  className="w-full text-left px-3 py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {p.name}
                </button>
              ))
            )}
          </div>
        }

        // ================= CENTER =================
        center={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Beam Inputs</h3>

            <input
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <input
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              type="number"
              placeholder="Length (m)"
              value={length}
              onChange={(e) => setLength(+e.target.value)}
            />

            <input
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              type="number"
              placeholder="Force (N)"
              value={force}
              onChange={(e) => setForce(+e.target.value)}
            />

            <input
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              type="number"
              placeholder="Moment of Inertia"
              value={I}
              onChange={(e) => setI(+e.target.value)}
            />

            <input
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              type="number"
              placeholder="Outer Fiber Distance"
              value={c}
              onChange={(e) => setC(+e.target.value)}
            />

            <select
              className="w-full px-3 py-2 mb-3 border rounded-lg"
              value={support}
              onChange={(e) =>
                setSupport(e.target.value as any)
              }
            >
              <option value="simply_supported">Simply Supported</option>
              <option value="cantilever">Cantilever</option>
              <option value="fixed_fixed">Fixed-Fixed</option>
            </select>

            <div className="flex gap-2 mt-2">
              <button
                onClick={calculate}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
              >
                Solve
              </button>

              <button
                onClick={saveProject}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        }

        // ================= RIGHT =================
        right={
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Results</h3>

            {result ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <Plot
                    data={[
                      {
                        x: result.x,
                        y: result.shear,
                        type: "scatter",
                        mode: "lines",
                      },
                    ]}
                    layout={{ title: "Shear Force" }}
                  />

                  <Plot
                    data={[
                      {
                        x: result.x,
                        y: result.moment,
                        type: "scatter",
                        mode: "lines",
                      },
                    ]}
                    layout={{ title: "Bending Moment" }}
                  />

                  <Plot
                    data={[
                      {
                        x: result.x,
                        y: result.deflection,
                        type: "scatter",
                        mode: "lines",
                      },
                    ]}
                    layout={{ title: "Deflection" }}
                  />

                  <Plot
                    data={[
                      {
                        x: result.x,
                        y: result.stress,
                        type: "scatter",
                        mode: "lines",
                      },
                    ]}
                    layout={{ title: "Stress" }}
                  />

                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p>
                    <b>Max Stress:</b> {result.maxStress.toExponential(3)}
                  </p>
                  <p>
                    <b>Max Deflection:</b> {result.maxDeflection.toExponential(3)}
                  </p>
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