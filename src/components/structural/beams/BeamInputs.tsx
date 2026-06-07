"use client";

import { Load, UDL } from "@/lib/structural/beams/types";
import { materials } from "@/data/materials";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import MeshControls from "@/components/shared/MeshControls";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import {
  beamApplicationPresets,
  type BeamApplicationId,
} from "@/lib/structural/beams/applicationPresets";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

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
  applicationId: BeamApplicationId;
  setApplicationId: (v: BeamApplicationId) => void;

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

  workflowMode?: DesignWorkflowMode;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  designMaxDeflection?: number;
  setDesignMaxDeflection?: (value: number) => void;
  designMaxStress?: number;
  setDesignMaxStress?: (value: number) => void;
};

export default function BeamInputs(props: Props) {
  const beamMaterials = materials.filter((material) => material.name !== "Concrete");
  const selectedApplication =
    beamApplicationPresets.find((preset) => preset.id === props.applicationId) ??
    beamApplicationPresets[0]!;
  const isDesignMode = props.workflowMode === "design";
  const showManualSection = !isDesignMode;

  return (
    <CalculatorInputPanel
      title="Beam analysis"
      description="Deflection, bending moment, and shear force for point loads and UDLs."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton
            onClick={props.onCalculate}
            label={isDesignMode ? "Size section" : "Solve beam"}
            designAware
          />
          <button
            type="button"
            onClick={props.saveProject}
            disabled={props.saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {props.saving ? "Saving..." : "Save project"}
          </button>
        </div>
      }
    >
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

      {/* ================= APPLICATION ================= */}
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
          What are you working on?
        </label>
        <select
          className="mt-2 w-full rounded border border-cyan-200 bg-white p-2 text-sm"
          value={props.applicationId}
          onChange={(e) => props.setApplicationId(e.target.value as BeamApplicationId)}
        >
          {beamApplicationPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs leading-relaxed text-cyan-900">
          {selectedApplication.description}
        </p>
        <p className="mt-2 text-xs text-cyan-800">
          Load factor {selectedApplication.loadFactor.toFixed(2)} · allowable stress{" "}
          {(selectedApplication.allowableStressRatio * 100).toFixed(0)}% of yield · deflection
          target L/{selectedApplication.deflectionLimitRatio}
        </p>
      </div>

      {/* ================= MATERIAL ================= */}
      <select
        className="w-full border p-2 rounded"
        value={props.material}
        onChange={(e) => props.setMaterial(e.target.value)}
      >
        {beamMaterials.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      {isDesignMode ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">Design targets</p>
          <label className="block text-sm text-slate-700">
            Max deflection ({props.lengthUnit})
            <input
              type="number"
              className="mt-1 w-full rounded border p-2"
              value={props.designMaxDeflection ?? props.length / selectedApplication.deflectionLimitRatio}
              onChange={(e) => props.setDesignMaxDeflection?.(+e.target.value)}
            />
          </label>
          <label className="block text-sm text-slate-700">
            Max bending stress ({props.stressUnit})
            <input
              type="number"
              className="mt-1 w-full rounded border p-2"
              value={
                props.designMaxStress ??
                ((materials.find((m) => m.name === props.material)?.yieldStress ?? 250e6) *
                  selectedApplication.allowableStressRatio) /
                  (props.stressUnit === "MPa" ? 1e6 : props.stressUnit === "Pa" ? 1 : 1e6)
              }
              onChange={(e) => props.setDesignMaxStress?.(+e.target.value)}
            />
          </label>
          <p className="text-xs text-cyan-900">
            Design mode searches the rolled-section catalog for the lightest section that passes stress and
            deflection limits with your load case.
          </p>
        </div>
      ) : null}

      {!isDesignMode ? (
        <RolledSectionPicker
          designation={props.sectionDesignation}
          onDesignationChange={props.setSectionDesignation}
          onSectionApplied={props.onSectionApplied}
        />
      ) : null}

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
      {showManualSection ? (
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
      ) : null}

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
      {showManualSection ? (
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
      ) : null}

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

    </CalculatorInputPanel>
  );
}