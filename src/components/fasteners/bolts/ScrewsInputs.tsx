"use client";

import { useState } from "react";
import type { ScrewConfig, ScrewType, ThreadType } from "@/lib/fasteners/bolts/types";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;
  config: ScrewConfig;
  setConfig: (config: ScrewConfig) => void;
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function ScrewsInputs({
  projectName,
  setProjectName,
  config,
  setConfig,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [screwType, setScrewType] = useState<ScrewType>(config.screwType);

  const updateConfig = (updates: any) => {
    setConfig({ ...config, ...updates });
  };

  const handleScrewTypeChange = (newType: ScrewType) => {
    setScrewType(newType);

    if (newType === "power_screw") {
      setConfig({
        screwType: "power_screw",
        threadType: "square",
        majorDiameter: 0.05,
        pitch: 0.01,
        lead: 0.01,
        length: 0.5,
        axialForce: 10000,
        frictionCoefficient: 0.15,
        starts: 1,
      });
    } else {
      setConfig({
        screwType: "ball_screw",
        majorDiameter: 0.05,
        pitch: 0.01,
        lead: 0.01,
        ballDiameter: 0.006,
        contactAngle: 45,
        axialForce: 10000,
        frictionCoefficient: 0.003,
        speed: 1000,
      });
    }
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

      {/* Screw Type Selection */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Screw Type</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleScrewTypeChange("power_screw")}
            className={`px-4 py-2 rounded font-medium transition ${
              screwType === "power_screw"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Power Screw
          </button>
          <button
            onClick={() => handleScrewTypeChange("ball_screw")}
            className={`px-4 py-2 rounded font-medium transition ${
              screwType === "ball_screw"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ball Screw
          </button>
        </div>
      </div>

      {/* Power Screw Inputs */}
      {screwType === "power_screw" && (
        <div className="border-t pt-3 mt-3 space-y-3">
          <h4 className="font-semibold">Power Screw Parameters</h4>

          {/* Thread Type */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Thread Type</label>
            <select
              value={(config as any).threadType}
              onChange={(e) => updateConfig({ threadType: e.target.value as ThreadType })}
              className="w-full border p-2 rounded"
            >
              <option value="square">Square Thread</option>
              <option value="acme">Acme Thread</option>
              <option value="buttress">Buttress Thread</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Major Diameter (mm)</label>
              <input
                type="number"
                step="0.1"
                value={(config as any).majorDiameter * 1000}
                onChange={(e) => updateConfig({ majorDiameter: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pitch (mm)</label>
              <input
                type="number"
                step="0.1"
                value={(config as any).pitch * 1000}
                onChange={(e) => updateConfig({ pitch: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Lead (mm)</label>
              <input
                type="number"
                step="0.1"
                value={((config as any).lead || (config as any).pitch) * 1000}
                onChange={(e) => updateConfig({ lead: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Number of Starts</label>
              <input
                type="number"
                min="1"
                value={(config as any).starts || 1}
                onChange={(e) => updateConfig({ starts: parseInt(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* Forces and Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Axial Force (N)</label>
              <input
                type="number"
                step="100"
                value={(config as any).axialForce}
                onChange={(e) => updateConfig({ axialForce: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Friction Coefficient</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={(config as any).frictionCoefficient}
                onChange={(e) => updateConfig({ frictionCoefficient: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ball Screw Inputs */}
      {screwType === "ball_screw" && (
        <div className="border-t pt-3 mt-3 space-y-3">
          <h4 className="font-semibold">Ball Screw Parameters</h4>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Major Diameter (mm)</label>
              <input
                type="number"
                step="0.1"
                value={(config as any).majorDiameter * 1000}
                onChange={(e) => updateConfig({ majorDiameter: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pitch (mm)</label>
              <input
                type="number"
                step="0.1"
                value={(config as any).pitch * 1000}
                onChange={(e) => updateConfig({ pitch: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ball Diameter (mm)</label>
              <input
                type="number"
                step="0.01"
                value={(config as any).ballDiameter * 1000}
                onChange={(e) => updateConfig({ ballDiameter: parseFloat(e.target.value) / 1000 })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact Angle (°)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="90"
                value={(config as any).contactAngle}
                onChange={(e) => updateConfig({ contactAngle: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          {/* Forces and Operating Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Axial Force (N)</label>
              <input
                type="number"
                step="100"
                value={(config as any).axialForce}
                onChange={(e) => updateConfig({ axialForce: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Speed (rpm)</label>
              <input
                type="number"
                step="100"
                value={(config as any).speed}
                onChange={(e) => updateConfig({ speed: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Friction Coefficient</label>
              <input
                type="number"
                step="0.001"
                min="0"
                max="0.01"
                value={(config as any).frictionCoefficient}
                onChange={(e) => updateConfig({ frictionCoefficient: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preload (N) - Optional</label>
              <input
                type="number"
                step="10"
                value={(config as any).preload || ""}
                onChange={(e) => updateConfig({ preload: parseFloat(e.target.value) || undefined })}
                className="w-full border p-2 rounded"
                placeholder="No preload"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
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
        {saving ? "Saving..." : "Save Project"}
      </button>
    </div>
  );
}