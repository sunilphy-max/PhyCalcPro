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
    <div className="flex flex-col gap-4">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Geometry Section */}
      <div className="border-t border-slate-600 pt-4">
        <h3 className="font-semibold text-slate-300 mb-3">Column Geometry</h3>

        {/* Length */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            placeholder="Length"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <select
            value={lengthUnit}
            onChange={(e) => setLengthUnit(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>m</option>
            <option>mm</option>
            <option>cm</option>
          </select>
        </div>

        {/* Area */}
        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">
            Cross-sectional Area (m²)
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            placeholder="Area"
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="1e-6"
          />
        </div>

        {/* Second Moment of Inertia */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={inertia}
            onChange={(e) => setInertia(parseFloat(e.target.value) || 0)}
            placeholder="Inertia"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="1e-8"
          />
          <select
            value={inertiaUnit}
            onChange={(e) => setInertiaUnit(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>m4</option>
            <option>mm4</option>
          </select>
        </div>
      </div>

      {/* Material Section */}
      <div className="border-t border-slate-600 pt-4">
        <h3 className="font-semibold text-slate-300 mb-3">Material</h3>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={elasticModulus}
            onChange={(e) => setElasticModulus(parseFloat(e.target.value) || 0)}
            placeholder="E"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="1e6"
          />
          <select
            value={elasticModulusUnit}
            onChange={(e) => setElasticModulusUnit(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>Pa</option>
            <option>MPa</option>
            <option>GPa</option>
          </select>
        </div>
      </div>

      {/* Loading Section */}
      <div className="border-t border-slate-600 pt-4">
        <h3 className="font-semibold text-slate-300 mb-3">Axial Load</h3>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={load}
            onChange={(e) => setLoad(parseFloat(e.target.value) || 0)}
            placeholder="Load"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          />
          <select
            value={loadUnit}
            onChange={(e) => setLoadUnit(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>N</option>
            <option>kN</option>
            <option>MN</option>
          </select>
        </div>

        {/* End Condition */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            End Condition
          </label>
          <select
            value={endCondition}
            onChange={(e) => setEndCondition(e.target.value as EndCondition)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option value="pinned">Pinned-Pinned</option>
            <option value="fixed">Fixed-Fixed</option>
            <option value="cantilever">Cantilever</option>
            <option value="guided">Guided</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-600 pt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onCalculate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          Calculate
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
