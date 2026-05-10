"use client";

import { useState } from "react";
import type { LoadCase } from "@/lib/shaft/types";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;

  // Geometry
  diameter: number;
  setDiameter: (v: number) => void;
  length: number;
  setLength: (v: number) => void;
  lengthUnit: string;
  setLengthUnit: (u: string) => void;

  // Material
  material: string;
  setMaterial: (m: string) => void;
  elasticModulus: number;
  setElasticModulus: (v: number) => void;
  shearModulus: number;
  setShearModulus: (v: number) => void;
  modulusUnit: string;
  setModulusUnit: (u: string) => void;

  // Loads
  loads: LoadCase[];
  setLoads: (loads: LoadCase[]) => void;

  // Actions
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function ShaftInputs({
  projectName,
  setProjectName,
  diameter,
  setDiameter,
  length,
  setLength,
  lengthUnit,
  setLengthUnit,
  material,
  setMaterial,
  elasticModulus,
  setElasticModulus,
  shearModulus,
  setShearModulus,
  modulusUnit,
  setModulusUnit,
  loads,
  setLoads,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [torqueInput, setTorqueInput] = useState(0);
  const [bendingMomentInput, setBendingMomentInput] = useState(0);
  const [positionInput, setPositionInput] = useState(0.5);

  const addLoad = () => {
    const newLoad: LoadCase = {
      position: Math.min(positionInput, length),
      torque: torqueInput || undefined,
      bendingMoment: bendingMomentInput || undefined,
    };
    setLoads([...loads, newLoad]);
    setTorqueInput(0);
    setBendingMomentInput(0);
    setPositionInput(length / 2);
  };

  const removeLoad = (index: number) => {
    setLoads(loads.filter((_, i) => i !== index));
  };

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
        <h3 className="font-semibold text-slate-300 mb-3">Shaft Geometry</h3>

        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">
            Diameter (m)
          </label>
          <input
            type="number"
            value={diameter}
            onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
            placeholder="Diameter"
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
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
          </select>
        </div>
      </div>

      {/* Material Section */}
      <div className="border-t border-slate-600 pt-4">
        <h3 className="font-semibold text-slate-300 mb-3">Material</h3>

        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>Steel</option>
            <option>Aluminum</option>
            <option>Titanium</option>
            <option>Custom</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            value={elasticModulus}
            onChange={(e) => setElasticModulus(parseFloat(e.target.value) || 0)}
            placeholder="E"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="1e6"
          />
          <select
            value={modulusUnit}
            onChange={(e) => setModulusUnit(e.target.value)}
            className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            <option>Pa</option>
            <option>MPa</option>
            <option>GPa</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={shearModulus}
            onChange={(e) => setShearModulus(parseFloat(e.target.value) || 0)}
            placeholder="G"
            className="col-span-2 px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            step="1e6"
          />
          <div className="px-3 py-2 rounded bg-slate-800 text-slate-400 border border-slate-600 text-sm">
            {modulusUnit}
          </div>
        </div>
      </div>

      {/* Loads Section */}
      <div className="border-t border-slate-600 pt-4">
        <h3 className="font-semibold text-slate-300 mb-3">Loads</h3>

        <div className="mb-3 space-y-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Position (m)
            </label>
            <input
              type="number"
              value={positionInput}
              onChange={(e) => setPositionInput(parseFloat(e.target.value) || 0)}
              placeholder="Position"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
              max={length}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Torque (N·m)
            </label>
            <input
              type="number"
              value={torqueInput}
              onChange={(e) => setTorqueInput(parseFloat(e.target.value) || 0)}
              placeholder="Torque"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Bending Moment (N·m)
            </label>
            <input
              type="number"
              value={bendingMomentInput}
              onChange={(e) => setBendingMomentInput(parseFloat(e.target.value) || 0)}
              placeholder="Bending Moment"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={addLoad}
            className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600 text-sm transition"
          >
            + Add Load
          </button>
        </div>

        {loads.length > 0 && (
          <div className="space-y-2 mt-3">
            {loads.map((load, idx) => (
              <div
                key={idx}
                className="bg-slate-700/50 p-2 rounded text-sm flex justify-between items-center"
              >
                <span className="text-slate-300">
                  @ {load.position.toFixed(2)}m: T={load.torque?.toFixed(0) ?? 0}Nm, M=
                  {load.bendingMoment?.toFixed(0) ?? 0}Nm
                </span>
                <button
                  onClick={() => removeLoad(idx)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
