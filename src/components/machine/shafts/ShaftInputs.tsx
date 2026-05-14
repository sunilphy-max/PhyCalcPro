"use client";

import { useState } from "react";
import type { LoadCase } from "@/lib/machine/shafts/types";

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
        <h4 className="font-semibold mb-2">Shaft Geometry</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Diameter</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              className="flex-1 border p-2 rounded"
              value={diameter}
              onChange={(e) => setDiameter(+e.target.value)}
            />
            <select
              value={lengthUnit}
              onChange={(e) => setLengthUnit(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="m">m</option>
              <option value="mm">mm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

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
              <option value="in">in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Material Section */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Material Properties</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Material</label>
          <select
            className="w-full border p-2 rounded"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="steel">Steel</option>
            <option value="aluminum">Aluminum</option>
            <option value="titanium">Titanium</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {material === "custom" && (
          <>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Elastic Modulus (E)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="1e9"
                  className="flex-1 border p-2 rounded"
                  value={elasticModulus}
                  onChange={(e) => setElasticModulus(+e.target.value)}
                />
                <select
                  value={modulusUnit}
                  onChange={(e) => setModulusUnit(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Pa">Pa</option>
                  <option value="GPa">GPa</option>
                  <option value="psi">psi</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Shear Modulus (G)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="1e9"
                  className="flex-1 border p-2 rounded"
                  value={shearModulus}
                  onChange={(e) => setShearModulus(+e.target.value)}
                />
                <select
                  value={modulusUnit}
                  onChange={(e) => setModulusUnit(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Pa">Pa</option>
                  <option value="GPa">GPa</option>
                  <option value="psi">psi</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loads Section */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Loads</h4>

        {/* Add Load Form */}
        <div className="mb-3 p-3 border rounded bg-gray-50">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="number"
              placeholder="Torque (N·m)"
              className="border p-2 rounded text-sm"
              value={torqueInput}
              onChange={(e) => setTorqueInput(+e.target.value)}
            />
            <input
              type="number"
              placeholder="Bending Moment (N·m)"
              className="border p-2 rounded text-sm"
              value={bendingMomentInput}
              onChange={(e) => setBendingMomentInput(+e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Position (m)"
              className="border p-2 rounded text-sm"
              value={positionInput}
              onChange={(e) => setPositionInput(+e.target.value)}
            />
          </div>
          <button
            onClick={addLoad}
            className="bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Add Load
          </button>
        </div>

        {/* Load List */}
        {loads.map((load, index) => (
          <div key={index} className="mb-2 p-2 border rounded flex justify-between items-center">
            <div className="text-sm">
              <div>Position: {load.position.toFixed(3)} m</div>
              {load.torque && <div>Torque: {load.torque} N·m</div>}
              {load.bendingMoment && <div>Bending: {load.bendingMoment} N·m</div>}
            </div>
            <button
              onClick={() => removeLoad(index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button
        onClick={onCalculate}
        className="w-full bg-black text-white py-2 rounded"
      >
        Solve
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