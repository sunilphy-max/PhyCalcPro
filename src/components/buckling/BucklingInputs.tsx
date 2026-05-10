"use client";

import { useState } from "react";
import type { EndCondition } from "@/lib/buckling/types";

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
}: Props) {
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
            <select
              value={lengthUnit}
              onChange={(e) => setLengthUnit(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="m">m</option>
              <option value="mm">mm</option>
              <option value="cm">cm</option>
            </select>
          </div>
        </div>

        {/* Area */}
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

        {/* Second Moment of Inertia */}
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
            <select
              value={inertiaUnit}
              onChange={(e) => setInertiaUnit(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="m4">m⁴</option>
              <option value="mm4">mm⁴</option>
            </select>
          </div>
        </div>
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
            <select
              value={elasticModulusUnit}
              onChange={(e) => setElasticModulusUnit(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="Pa">Pa</option>
              <option value="MPa">MPa</option>
              <option value="GPa">GPa</option>
            </select>
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
            <select
              value={loadUnit}
              onChange={(e) => setLoadUnit(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="N">N</option>
              <option value="kN">kN</option>
              <option value="MN">MN</option>
            </select>
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
        Calculate
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
