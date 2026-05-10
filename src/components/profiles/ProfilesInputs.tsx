"use client";

import { useState } from "react";
import type { ShapeType, ShapeProperties } from "@/lib/profiles/types";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;

  shape: ShapeProperties;
  setShape: (shape: ShapeProperties) => void;

  // Actions
  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

export default function ProfilesInputs({
  projectName,
  setProjectName,
  shape,
  setShape,
  onCalculate,
  onSave,
  saving,
}: Props) {
  const [shapeType, setShapeType] = useState<ShapeType>(shape.shape);

  const updateShapeType = (newType: ShapeType) => {
    setShapeType(newType);
    const newShape: ShapeProperties = { shape: newType };

    // Initialize with default values
    switch (newType) {
      case "rectangle":
        newShape.rectangle = { width: 0.1, height: 0.2 };
        break;
      case "circle":
        newShape.circle = { diameter: 0.1 };
        break;
      case "hollow_circle":
        newShape.hollowCircle = { outerDiameter: 0.1, innerDiameter: 0.08 };
        break;
      case "i_beam":
        newShape.iBeam = { height: 0.3, width: 0.15, webThickness: 0.008, flangeThickness: 0.012 };
        break;
      case "t_beam":
        newShape.tBeam = { height: 0.3, width: 0.15, webThickness: 0.008, flangeThickness: 0.012 };
        break;
      case "c_channel":
        newShape.cChannel = { height: 0.2, width: 0.1, webThickness: 0.006, flangeThickness: 0.008 };
        break;
      case "angle":
        newShape.angle = { leg1: 0.1, leg2: 0.1, thickness: 0.008 };
        break;
      case "custom":
        newShape.custom = { area: 0.01, centroidX: 0.05, centroidY: 0.05, ixx: 1e-6, iyy: 1e-6, ixy: 0 };
        break;
    }

    setShape(newShape);
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

      {/* Shape Selection */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Cross-Section Shape</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Shape Type</label>
          <select
            value={shapeType}
            onChange={(e) => updateShapeType(e.target.value as ShapeType)}
            className="w-full border p-2 rounded"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="hollow_circle">Hollow Circle</option>
            <option value="i_beam">I-Beam</option>
            <option value="t_beam">T-Beam</option>
            <option value="c_channel">C-Channel</option>
            <option value="angle">Angle</option>
            <option value="custom">Custom Properties</option>
          </select>
        </div>
      </div>

      {/* Shape Parameters */}
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Shape Parameters</h4>

        {shapeType === "rectangle" && shape.rectangle && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Width (m)</label>
              <input
                type="number"
                value={shape.rectangle.width}
                onChange={(e) => setShape({
                  ...shape,
                  rectangle: { ...shape.rectangle!, width: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Height (m)</label>
              <input
                type="number"
                value={shape.rectangle.height}
                onChange={(e) => setShape({
                  ...shape,
                  rectangle: { ...shape.rectangle!, height: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
          </div>
        )}

        {shapeType === "circle" && shape.circle && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Diameter (m)</label>
            <input
              type="number"
              value={shape.circle.diameter}
              onChange={(e) => setShape({
                ...shape,
                circle: { diameter: parseFloat(e.target.value) || 0 }
              })}
              className="w-full border p-2 rounded"
              step="0.01"
            />
          </div>
        )}

        {shapeType === "hollow_circle" && shape.hollowCircle && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Outer Diameter (m)</label>
              <input
                type="number"
                value={shape.hollowCircle.outerDiameter}
                onChange={(e) => setShape({
                  ...shape,
                  hollowCircle: { ...shape.hollowCircle!, outerDiameter: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Inner Diameter (m)</label>
              <input
                type="number"
                value={shape.hollowCircle.innerDiameter}
                onChange={(e) => setShape({
                  ...shape,
                  hollowCircle: { ...shape.hollowCircle!, innerDiameter: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
          </div>
        )}

        {(shapeType === "i_beam" || shapeType === "t_beam" || shapeType === "c_channel") && (
          shape.iBeam || shape.tBeam || shape.cChannel
        ) && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Height (m)</label>
              <input
                type="number"
                value={
                  shape.iBeam?.height || shape.tBeam?.height || shape.cChannel?.height || 0
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (shapeType === "i_beam" && shape.iBeam) {
                    setShape({ ...shape, iBeam: { ...shape.iBeam, height: value } });
                  } else if (shapeType === "t_beam" && shape.tBeam) {
                    setShape({ ...shape, tBeam: { ...shape.tBeam, height: value } });
                  } else if (shapeType === "c_channel" && shape.cChannel) {
                    setShape({ ...shape, cChannel: { ...shape.cChannel, height: value } });
                  }
                }}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Width (m)</label>
              <input
                type="number"
                value={
                  shape.iBeam?.width || shape.tBeam?.width || shape.cChannel?.width || 0
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (shapeType === "i_beam" && shape.iBeam) {
                    setShape({ ...shape, iBeam: { ...shape.iBeam, width: value } });
                  } else if (shapeType === "t_beam" && shape.tBeam) {
                    setShape({ ...shape, tBeam: { ...shape.tBeam, width: value } });
                  } else if (shapeType === "c_channel" && shape.cChannel) {
                    setShape({ ...shape, cChannel: { ...shape.cChannel, width: value } });
                  }
                }}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Web Thickness (m)</label>
              <input
                type="number"
                value={
                  shape.iBeam?.webThickness || shape.tBeam?.webThickness || shape.cChannel?.webThickness || 0
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (shapeType === "i_beam" && shape.iBeam) {
                    setShape({ ...shape, iBeam: { ...shape.iBeam, webThickness: value } });
                  } else if (shapeType === "t_beam" && shape.tBeam) {
                    setShape({ ...shape, tBeam: { ...shape.tBeam, webThickness: value } });
                  } else if (shapeType === "c_channel" && shape.cChannel) {
                    setShape({ ...shape, cChannel: { ...shape.cChannel, webThickness: value } });
                  }
                }}
                className="w-full border p-2 rounded"
                step="0.001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Flange Thickness (m)</label>
              <input
                type="number"
                value={
                  shape.iBeam?.flangeThickness || shape.tBeam?.flangeThickness || shape.cChannel?.flangeThickness || 0
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (shapeType === "i_beam" && shape.iBeam) {
                    setShape({ ...shape, iBeam: { ...shape.iBeam, flangeThickness: value } });
                  } else if (shapeType === "t_beam" && shape.tBeam) {
                    setShape({ ...shape, tBeam: { ...shape.tBeam, flangeThickness: value } });
                  } else if (shapeType === "c_channel" && shape.cChannel) {
                    setShape({ ...shape, cChannel: { ...shape.cChannel, flangeThickness: value } });
                  }
                }}
                className="w-full border p-2 rounded"
                step="0.001"
              />
            </div>
          </div>
        )}

        {shapeType === "angle" && shape.angle && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Leg 1 Length (m)</label>
              <input
                type="number"
                value={shape.angle.leg1}
                onChange={(e) => setShape({
                  ...shape,
                  angle: { ...shape.angle!, leg1: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Leg 2 Length (m)</label>
              <input
                type="number"
                value={shape.angle.leg2}
                onChange={(e) => setShape({
                  ...shape,
                  angle: { ...shape.angle!, leg2: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Thickness (m)</label>
              <input
                type="number"
                value={shape.angle.thickness}
                onChange={(e) => setShape({
                  ...shape,
                  angle: { ...shape.angle!, thickness: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="0.001"
              />
            </div>
          </div>
        )}

        {shapeType === "custom" && shape.custom && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Area (m²)</label>
              <input
                type="number"
                value={shape.custom.area}
                onChange={(e) => setShape({
                  ...shape,
                  custom: { ...shape.custom!, area: parseFloat(e.target.value) || 0 }
                })}
                className="w-full border p-2 rounded"
                step="1e-6"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Centroid X (m)</label>
                <input
                  type="number"
                  value={shape.custom.centroidX}
                  onChange={(e) => setShape({
                    ...shape,
                    custom: { ...shape.custom!, centroidX: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-2 rounded"
                  step="0.001"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Centroid Y (m)</label>
                <input
                  type="number"
                  value={shape.custom.centroidY}
                  onChange={(e) => setShape({
                    ...shape,
                    custom: { ...shape.custom!, centroidY: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-2 rounded"
                  step="0.001"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ixx (m⁴)</label>
                <input
                  type="number"
                  value={shape.custom.ixx}
                  onChange={(e) => setShape({
                    ...shape,
                    custom: { ...shape.custom!, ixx: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-2 rounded"
                  step="1e-8"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Iyy (m⁴)</label>
                <input
                  type="number"
                  value={shape.custom.iyy}
                  onChange={(e) => setShape({
                    ...shape,
                    custom: { ...shape.custom!, iyy: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-2 rounded"
                  step="1e-8"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ixy (m⁴)</label>
                <input
                  type="number"
                  value={shape.custom.ixy}
                  onChange={(e) => setShape({
                    ...shape,
                    custom: { ...shape.custom!, ixy: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full border p-2 rounded"
                  step="1e-8"
                />
              </div>
            </div>
          </div>
        )}
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
