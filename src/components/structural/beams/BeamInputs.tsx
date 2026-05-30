"use client";

import { Load, UDL } from "@/lib/structural/beams/types";
import { materials } from "@/data/materials";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";

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
  momentUnit: string;
  setMomentUnit: (v: string) => void;
  stressUnit: string;
  setStressUnit: (v: string) => void;

  c: number;
  setC: (v: number) => void;

  support: "simply_supported" | "cantilever" | "fixed_fixed";
  setSupport: (v: "simply_supported" | "cantilever" | "fixed_fixed") => void;

  material: string;
  setMaterial: (v: string) => void;

  onCalculate: () => void;
  saveProject: () => void;
  saving: boolean;

  // ✅ LOADS (IMPORTANT)
  loads: Load[];
  updateLoad: (i: number, l: Load) => void;
  removeLoad: (i: number) => void;
  addPointLoad: () => void;
  addUDL: () => void;

  meshSegments: number;
  setMeshSegments: (value: number) => void;
};

export default function BeamInputs(props: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">

      {/* ================= PROJECT NAME ================= */}
      <input
        className="w-full p-2 border rounded"
        value={props.projectName}
        onChange={(e) => props.setProjectName(e.target.value)}
      />

      {/* ================= SUPPORT TYPE ================= */}
      <select
        className="w-full border p-2 rounded"
        value={props.support}
        onChange={(e) => props.setSupport(e.target.value as Props["support"])}
      >
        <option value="simply_supported">Simply Supported</option>
        <option value="cantilever">Cantilever</option>
        <option value="fixed_fixed">Fixed-Fixed</option>
      </select>

      {/* ================= MATERIAL ================= */}
      <select
        className="w-full border p-2 rounded"
        value={props.material}
        onChange={(e) => props.setMaterial(e.target.value)}
      >
        {materials.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      {/* ================= LENGTH ================= */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.length}
          onChange={(e) => props.setLength(+e.target.value)}
        />
        <ModuleUnitSelect
          moduleId="beams"
          fieldKey="length"
          value={props.lengthUnit}
          onChange={props.setLengthUnit}
        />
      </div>

      {/* ================= FORCE ================= */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.force}
          onChange={(e) => props.setForce(+e.target.value)}
        />
        <ModuleUnitSelect
          moduleId="beams"
          fieldKey="force"
          value={props.forceUnit}
          onChange={props.setForceUnit}
        />
      </div>

      {/* ================= UDL ================= */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.udl}
          onChange={(e) => props.setUdl(+e.target.value)}
        />
        <ModuleUnitSelect
          moduleId="beams"
          fieldKey="udl"
          value={props.udlUnit}
          onChange={props.setUdlUnit}
        />
      </div>

      {/* ================= INERTIA ================= */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={props.I}
          onChange={(e) => props.setI(+e.target.value)}
        />
        <ModuleUnitSelect
          moduleId="beams"
          fieldKey="inertia"
          value={props.inertiaUnit}
          onChange={props.setInertiaUnit}
        />
      </div>

      {/* ================= MOMENT/STRESS UNITS ================= */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">Moment units</label>
          <ModuleUnitSelect
            moduleId="beams"
            fieldKey="moment"
            value={props.momentUnit}
            onChange={props.setMomentUnit}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">Stress units</label>
          <ModuleUnitSelect
            moduleId="beams"
            fieldKey="stress"
            value={props.stressUnit}
            onChange={props.setStressUnit}
          />
        </div>
      </div>

      {/* ================= DISTANCE C (Neutral Axis to Extreme Fiber) ================= */}
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Distance to extreme fiber (c)"
          value={props.c}
          onChange={(e) => props.setC(+e.target.value)}
        />
        <ModuleUnitSelect
          moduleId="beams"
          fieldKey="length"
          value={props.lengthUnit}
          onChange={props.setLengthUnit}
        />
      </div>

      {/* ================= LOADS SECTION ================= */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Loads</h4>

        {(props.loads ?? []).map((load, i) => (
          <div key={i} className="mb-2 p-2 border rounded">

            <div className="text-sm mb-1">
              {load.type === "point"
                ? "Point Load"
                : load.type === "udl"
                ? "UDL"
                : "Moment"}
            </div>

            {/* VALUE */}
            <input
              className="w-full border p-1 mb-1"
              value={load.value}
              onChange={(e) =>
                props.updateLoad(i, {
                  ...load,
                  value: +e.target.value,
                })
              }
            />

            {/* POSITION / RANGE */}
            {load.type === "point" ? (
              <input
                className="w-full border p-1"
                value={load.position}
                onChange={(e) =>
                  props.updateLoad(i, {
                    ...load,
                    position: +e.target.value,
                  })
                }
              />
            ) : load.type === "udl" ? (
              <>
                <input
                  className="w-full border p-1 mb-1"
                  value={load.start}
                  onChange={(e) =>
                    props.updateLoad(i, {
                      ...(load as UDL),
                      start: +e.target.value,
                    })
                  }
                />
                <input
                  className="w-full border p-1"
                  value={load.end}
                  onChange={(e) =>
                    props.updateLoad(i, {
                      ...(load as UDL),
                      end: +e.target.value,
                    })
                  }
                />
              </>
            ) : (
              <input
                className="w-full border p-1"
                value={load.position}
                onChange={(e) =>
                  props.updateLoad(i, {
                    ...load,
                    position: +e.target.value,
                  })
                }
              />
            )}

            <button
              className="text-red-500 text-sm mt-1"
              onClick={() => props.removeLoad(i)}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-2 mt-2">
          <button
            onClick={props.addPointLoad}
            className="bg-gray-200 px-2 py-1 rounded"
          >
            + Point Load
          </button>

          <button
            onClick={props.addUDL}
            className="bg-gray-200 px-2 py-1 rounded"
          >
            + UDL
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Mesh refinement</h3>
        <p className="text-xs text-slate-500">
          Increase element count for smoother moment, shear, and deflection curves.
        </p>
        <MeshControls
          elements={props.meshSegments}
          onChangeElements={props.setMeshSegments}
          refine
        />
      </div>

      {/* ================= ACTIONS ================= */}
      <button
        onClick={props.onCalculate}
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