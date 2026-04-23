"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beam/solver";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

// Prevent SSR issues with Plotly
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
  // SAVE PROJECT
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

      alert("Project saved successfully!");
      loadProjects();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error saving project");
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

    if (error) {
      console.error(error);
      return;
    }

    setSavedProjects(data || []);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // =============================
  // LOAD INTO FORM
  // =============================
  const loadProjectIntoForm = (project: any) => {
    setProjectName(project.name);
    setLength(project.length);
    setForce(project.force);
    setI(project.inertia);
    setC(project.c);
    setSupport(project.support);
  };

  // =============================
  // UI
  // =============================
  return (
    <DashboardLayout title="Beam Analysis Module">
      <div style={page}>
        <h1>Beam Analysis Module</h1>

        {/* SAVED PROJECTS */}
        <div style={savedCard}>
          <h3>Saved Projects</h3>

          {savedProjects.length === 0 ? (
            <p>No saved projects yet</p>
          ) : (
            savedProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => loadProjectIntoForm(p)}
                style={savedProjectButton}
              >
                {p.name}
              </button>
            ))
          )}
        </div>

        {/* INPUTS */}
        <div style={card}>
          <label>Project Name</label>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          <label>Length (m)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(+e.target.value)}
          />

          <label>Point Load (N)</label>
          <input
            type="number"
            value={force}
            onChange={(e) => setForce(+e.target.value)}
          />

          <label>I (m⁴)</label>
          <input
            type="number"
            value={I}
            onChange={(e) => setI(+e.target.value)}
          />

          <label>c (m)</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(+e.target.value)}
          />

          <label>Support</label>
          <select
            value={support}
            onChange={(e) =>
              setSupport(
                e.target.value as
                  | "simply_supported"
                  | "cantilever"
                  | "fixed_fixed"
              )
            }
          >
            <option value="simply_supported">Simply Supported</option>
            <option value="cantilever">Cantilever</option>
            <option value="fixed_fixed">Fixed-Fixed</option>
          </select>

          <button onClick={calculate} style={button}>
            Solve Beam
          </button>

          <button onClick={saveProject} style={saveButton} disabled={saving}>
            {saving ? "Saving..." : "Save Project"}
          </button>
        </div>

        {/* RESULTS */}
        {result && (
          <div style={grid}>
            <Plot
              data={[{ x: result.x, y: result.shear, type: "scatter", mode: "lines" }]}
              layout={{ title: "Shear Force" }}
            />

            <Plot
              data={[{ x: result.x, y: result.moment, type: "scatter", mode: "lines" }]}
              layout={{ title: "Moment" }}
            />

            <Plot
              data={[{ x: result.x, y: result.deflection, type: "scatter", mode: "lines" }]}
              layout={{ title: "Deflection" }}
            />

            <Plot
              data={[{ x: result.x, y: result.stress, type: "scatter", mode: "lines" }]}
              layout={{ title: "Stress" }}
            />

            <div style={resultCard}>
              <p>
                <b>Max Stress:</b> {result.maxStress.toExponential(3)}
              </p>
              <p>
                <b>Max Deflection:</b> {result.maxDeflection.toExponential(3)}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// =============================
// STYLES
// =============================
const page: any = {
  padding: 20,
  background: "#f5f7fb",
  minHeight: "100vh",
};

const card: any = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  maxWidth: 420,
  marginBottom: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const savedCard: any = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
  maxWidth: 420,
  marginBottom: 20,
};

const savedProjectButton: any = {
  display: "block",
  width: "100%",
  marginTop: 8,
  padding: 8,
  background: "#f3f4f6",
  borderRadius: 6,
  textAlign: "left",
};

const button: any = {
  padding: 10,
  background: "#111827",
  color: "#fff",
  borderRadius: 6,
};

const saveButton: any = {
  padding: 10,
  background: "#2563eb",
  color: "#fff",
  borderRadius: 6,
  marginTop: 10,
};

const grid: any = {
  display: "grid",
  gap: 20,
};

const resultCard: any = {
  background: "#fff",
  padding: 15,
  borderRadius: 10,
};