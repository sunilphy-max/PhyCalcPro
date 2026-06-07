"use client";

import type { EndCondition } from "@/lib/structural/columns/types";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import RolledSectionPicker from "@/components/design-workflows/RolledSectionPicker";
import type { DesignWorkflowMode } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;

  // Column properties
  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (u: string) => void;

  // Load
  load: number;
  setLoad: (v: number) => void;
  loadUnit: string;
  setLoadUnit: (u: string) => void;

  // Cross-section
  inertia: number;
  setInertia: (v: number) => void;
  area: number;
  setArea: (v: number) => void;
  inertiaUnit: string;
  setInertiaUnit: (u: string) => void;

  // Material
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  elasticModulusUnit: string;
  setElasticModulusUnit: (u: string) => void;

  // End condition
  endCondition: EndCondition;
  setEndCondition: (c: EndCondition) => void;

  // Actions
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;

  workflowMode?: DesignWorkflowMode;
  sectionDesignation: string;
  setSectionDesignation: (value: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  targetSafetyFactor: number;
  setTargetSafetyFactor: (value: number) => void;
};

export default function BucklingInputs({
  projectName,
  setProjectName,
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  load,
  setLoad,
  loadUnit,
  setLoadUnit,
  inertia,
  setInertia,
  area,
  setArea,
  inertiaUnit,
  setInertiaUnit,
  elasticModulus,
  setElasticModulus,
  elasticModulusUnit,
  setElasticModulusUnit,
  endCondition,
  setEndCondition,
  onCalculate,
  onSave,
  saving,
  workflowMode = "check",
  sectionDesignation,
  setSectionDesignation,
  onSectionApplied,
  targetSafetyFactor,
  setTargetSafetyFactor,
}: Props) {
  const isDesignMode = workflowMode === "design";
  const showManualSection = !isDesignMode;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      {/* Project Name */}
      <input
        className="w-full p-2 border rounded"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />

      {/* Geometry Section */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Column Geometry</h4>

        {!isDesignMode ? (
          <RolledSectionPicker
            designation={sectionDesignation}
            onDesignationChange={setSectionDesignation}
            onSectionApplied={onSectionApplied}
            className="mb-3"
          />
        ) : null}

        {isDesignMode ? (
          <div className="mb-3 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3">
            <label className="block text-sm text-slate-700">
              Target buckling safety factor
              <input
                type="number"
                step="0.1"
                min={1}
                className="mt-1 w-full rounded border p-2"
                value={targetSafetyFactor}
                onChange={(e) => setTargetSafetyFactor(+e.target.value)}
              />
            </label>
            <p className="mt-2 text-xs text-cyan-900">
              Design mode selects the lightest catalog section with Pcr/P at or above this target.
            </p>
          </div>
        ) : null}

        {/* Length */}
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Length</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              className="flex-1 border p-2 rounded"
              value={length}
              onChange={(e) => setLength(+e.target.value)}
            />
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="length"
              value={lengthUnit}
              onChange={setLengthUnit}
            />
          </div>
        </div>

        {/* Area */}
        {showManualSection ? (
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Cross-sectional Area</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="1e-6"
              className="flex-1 border p-2 rounded"
              value={area}
              onChange={(e) => setArea(+e.target.value)}
            />
            <span className="px-2 py-2 text-gray-600">m²</span>
          </div>
        </div>
        ) : null}

        {/* Second Moment of Inertia */}
        {showManualSection ? (
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Second Moment of Inertia</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="1e-8"
              className="flex-1 border p-2 rounded"
              value={inertia}
              onChange={(e) => setInertia(+e.target.value)}
            />
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="inertia"
              value={inertiaUnit}
              onChange={setInertiaUnit}
            />
          </div>
        </div>
        ) : null}
      </div>

      {/* Material Section */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Material</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Elastic Modulus (E)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="1e6"
              className="flex-1 border p-2 rounded"
              value={elasticModulus}
              onChange={(e) => setElasticModulus(+e.target.value)}
            />
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="stress"
              value={elasticModulusUnit}
              onChange={setElasticModulusUnit}
            />
          </div>
        </div>
      </div>

      {/* Loading Section */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Axial Load</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Load</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 border p-2 rounded"
              value={load}
              onChange={(e) => setLoad(+e.target.value)}
            />
            <ModuleUnitSelect
              moduleId="columns"
              fieldKey="load"
              value={loadUnit}
              onChange={setLoadUnit}
            />
          </div>
        </div>

        {/* End Condition */}
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">End Condition</label>
          <select
            value={endCondition}
            onChange={(e) => setEndCondition(e.target.value as EndCondition)}
            className="w-full border p-2 rounded"
          >
            <option value="pinned">Pinned-Pinned</option>
            <option value="fixed">Fixed-Fixed</option>
            <option value="cantilever">Cantilever</option>
            <option value="guided">Guided</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={onCalculate}
        className="w-full bg-black text-white py-2 rounded"
      >
        {isDesignMode ? "Size section" : "Calculate"}
      </button>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
