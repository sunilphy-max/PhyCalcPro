"use client";

import type { Load } from "@/lib/beam/types";

type Props = {
  projectName: string;
  setProjectName: (v: string) => void;

  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (v: string) => void;

  force: number;
  setForce: (v: number) => void;
  forceUnit: string;
  setForceUnit: (v: string) => void;

  udl: number;
  setUdl: (v: number) => void;
  udlUnit: string;
  setUdlUnit: (v: string) => void;

  I: number;
  setI: (v: number) => void;
  inertiaUnit: string;
  setInertiaUnit: (v: string) => void;

  support: "simply_supported" | "cantilever" | "fixed_fixed";
  setSupport: (v: "simply_supported" | "cantilever" | "fixed_fixed") => void;

  loads: Load[];
  updateLoad: (index: number, newLoad: Load) => void;
  removeLoad: (index: number) => void;
  addPointLoad: () => void;
  addUDL: () => void;

  calculate: () => void;
  saveProject: () => void;
  saving: boolean;
};

export default function BeamInputs(props: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">

      {/* PROJECT */}
      <input
        className="w-full p-2 border rounded"
        value={props.projectName}
        onChange={(e) => props.setProjectName(e.target.value)}
      />

      {/* SUPPORT */}
      <select
        className="w-full border p-2 rounded"
        value={props.support}
        onChange={(e) =>
          props.setSupport(e.target.value as Props["support"])
        }
      >
        <option value="simply_supported">Simply Supported</option>
        <option value="cantilever">Cantilever</option>
        <option value="fixed_fixed">Fixed-Fixed</option>
      </select>

      {/* LENGTH */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.length}
          onChange={(e) => props.setLength(+e.target.value)}
        />
        <select
          value={props.lengthUnit}
          onChange={(e) => props.setLengthUnit(e.target.value)}
        >
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
          value={props.force}
          onChange={(e) => props.setForce(+e.target.value)}
        />
        <select
          value={props.forceUnit}
          onChange={(e) => props.setForceUnit(e.target.value)}
        >
          <option value="N">N</option>
          <option value="kN">kN</option>
          <option value="lbf">lbf</option>
        </select>
      </div>

      {/* UDL */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.udl}
          onChange={(e) => props.setUdl(+e.target.value)}
        />
        <select
          value={props.udlUnit}
          onChange={(e) => props.setUdlUnit(e.target.value)}
        >
          <option value="N/m">N/m</option>
          <option value="kN/m">kN/m</option>
          <option value="lbf/ft">lbf/ft</option>
        </select>
      </div>

      {/* INERTIA */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.I}
          onChange={(e) => props.setI(+e.target.value)}
        />
        <select
          value={props.inertiaUnit}
          onChange={(e) => props.setInertiaUnit(e.target.value)}
        >
          <option value="m4">m⁴</option>
          <option value="in4">in⁴</option>
        </select>
      </div>

      {/* LOADS */}
      <div className="border-t pt-3">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Loads</label>
        {props.loads.map((load, idx) => (
          <div key={idx} className="mb-2 p-2 bg-gray-50 rounded border text-sm">
            {load.type === "point" ? (
              <>
                <div>Point Load: {load.value.toFixed(2)} at {load.position.toFixed(2)}</div>
              </>
            ) : (
              <>
                <div>UDL: {load.value.toFixed(2)} from {load.start.toFixed(2)} to {load.end.toFixed(2)}</div>
              </>
            )}
            <button
              onClick={() => props.removeLoad(idx)}
              className="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={props.addPointLoad}
            className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded"
          >
            + Point Load
          </button>
          <button
            onClick={props.addUDL}
            className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded"
          >
            + UDL
          </button>
        </div>
      </div>

      {/* ACTIONS */}
      <button
        onClick={props.calculate}
        className="w-full bg-black text-white py-2 rounded"
      >
        Solve
      </button>

      <button
        onClick={props.saveProject}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {props.saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}