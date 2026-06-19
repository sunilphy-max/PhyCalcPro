"use client";

import { calculatorInputGridTightClass } from "@/components/calculator/styles";
import { useState } from "react";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import type { ShapeType, ShapeProperties } from "@/lib/profiles/types";

type Props = {
  projectName: string;
  setProjectName: (name: string) => void;

  shape: ShapeProperties;
  setShape: (shape: ShapeProperties) => void;

  onCalculate: () => void;
  onSave: () => void;
  saving: boolean;
};

const meterUnit = <span className="px-2 text-sm text-slate-600">m</span>;
const areaUnit = <span className="px-2 text-sm text-slate-600">m²</span>;
const inertiaUnit = <span className="px-2 text-sm text-slate-600">m⁴</span>;

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

  const updateSectionDimension = (field: "height" | "width" | "webThickness" | "flangeThickness", value: number) => {
    if (shapeType === "i_beam" && shape.iBeam) {
      setShape({ ...shape, iBeam: { ...shape.iBeam, [field]: value } });
    } else if (shapeType === "t_beam" && shape.tBeam) {
      setShape({ ...shape, tBeam: { ...shape.tBeam, [field]: value } });
    } else if (shapeType === "c_channel" && shape.cChannel) {
      setShape({ ...shape, cChannel: { ...shape.cChannel, [field]: value } });
    }
  };

  const sectionHeight =
    shape.iBeam?.height || shape.tBeam?.height || shape.cChannel?.height || 0;
  const sectionWidth = shape.iBeam?.width || shape.tBeam?.width || shape.cChannel?.width || 0;
  const sectionWeb =
    shape.iBeam?.webThickness || shape.tBeam?.webThickness || shape.cChannel?.webThickness || 0;
  const sectionFlange =
    shape.iBeam?.flangeThickness || shape.tBeam?.flangeThickness || shape.cChannel?.flangeThickness || 0;

  return (
    <CalculatorInputPanel
      title="Area properties"
      description="Compute area, centroid, and second moments for standard and custom cross-sections."
      footer={
        <div className="space-y-2">
          <CalculatorCalculateButton onClick={onCalculate} label="Calculate properties" designAware />
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save project"}
          </button>
        </div>
      }
    >
      <input
        className="w-full p-2 border rounded"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
      />

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

      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold mb-2">Shape Parameters</h4>

        {shapeType === "rectangle" && shape.rectangle && (
          <div className={`${calculatorInputGridTightClass}`}>
            <CalculatorUnitField
              label="Width"
              value={shape.rectangle.width}
              onChange={(width) =>
                setShape({ ...shape, rectangle: { ...shape.rectangle!, width } })
              }
              unit={meterUnit}
              step={0.01}
            />
            <CalculatorUnitField
              label="Height"
              value={shape.rectangle.height}
              onChange={(height) =>
                setShape({ ...shape, rectangle: { ...shape.rectangle!, height } })
              }
              unit={meterUnit}
              step={0.01}
            />
          </div>
        )}

        {shapeType === "circle" && shape.circle && (
          <CalculatorUnitField
            label="Diameter"
            value={shape.circle.diameter}
            onChange={(diameter) => setShape({ ...shape, circle: { diameter } })}
            unit={meterUnit}
            step={0.01}
          />
        )}

        {shapeType === "hollow_circle" && shape.hollowCircle && (
          <div className={`${calculatorInputGridTightClass}`}>
            <CalculatorUnitField
              label="Outer diameter"
              value={shape.hollowCircle.outerDiameter}
              onChange={(outerDiameter) =>
                setShape({
                  ...shape,
                  hollowCircle: { ...shape.hollowCircle!, outerDiameter },
                })
              }
              unit={meterUnit}
              step={0.01}
            />
            <CalculatorUnitField
              label="Inner diameter"
              value={shape.hollowCircle.innerDiameter}
              onChange={(innerDiameter) =>
                setShape({
                  ...shape,
                  hollowCircle: { ...shape.hollowCircle!, innerDiameter },
                })
              }
              unit={meterUnit}
              step={0.01}
            />
          </div>
        )}

        {(shapeType === "i_beam" || shapeType === "t_beam" || shapeType === "c_channel") &&
          (shape.iBeam || shape.tBeam || shape.cChannel) && (
            <div className={`${calculatorInputGridTightClass}`}>
              <CalculatorUnitField
                label="Height"
                value={sectionHeight}
                onChange={(value) => updateSectionDimension("height", value)}
                unit={meterUnit}
                step={0.01}
              />
              <CalculatorUnitField
                label="Width"
                value={sectionWidth}
                onChange={(value) => updateSectionDimension("width", value)}
                unit={meterUnit}
                step={0.01}
              />
              <CalculatorUnitField
                label="Web thickness"
                value={sectionWeb}
                onChange={(value) => updateSectionDimension("webThickness", value)}
                unit={meterUnit}
                step={0.001}
              />
              <CalculatorUnitField
                label="Flange thickness"
                value={sectionFlange}
                onChange={(value) => updateSectionDimension("flangeThickness", value)}
                unit={meterUnit}
                step={0.001}
              />
            </div>
          )}

        {shapeType === "angle" && shape.angle && (
          <div className={`${calculatorInputGridTightClass}`}>
            <CalculatorUnitField
              label="Leg 1 length"
              value={shape.angle.leg1}
              onChange={(leg1) =>
                setShape({ ...shape, angle: { ...shape.angle!, leg1 } })
              }
              unit={meterUnit}
              step={0.01}
            />
            <CalculatorUnitField
              label="Leg 2 length"
              value={shape.angle.leg2}
              onChange={(leg2) =>
                setShape({ ...shape, angle: { ...shape.angle!, leg2 } })
              }
              unit={meterUnit}
              step={0.01}
            />
            <CalculatorUnitField
              label="Thickness"
              value={shape.angle.thickness}
              onChange={(thickness) =>
                setShape({ ...shape, angle: { ...shape.angle!, thickness } })
              }
              unit={meterUnit}
              step={0.001}
            />
          </div>
        )}

        {shapeType === "custom" && shape.custom && (
          <div className="space-y-3">
            <CalculatorUnitField
              label="Area"
              value={shape.custom.area}
              onChange={(area) =>
                setShape({ ...shape, custom: { ...shape.custom!, area } })
              }
              unit={areaUnit}
              step={1e-6}
            />
            <div className={`${calculatorInputGridTightClass}`}>
              <CalculatorUnitField
                label="Centroid X"
                value={shape.custom.centroidX}
                onChange={(centroidX) =>
                  setShape({ ...shape, custom: { ...shape.custom!, centroidX } })
                }
                unit={meterUnit}
                step={0.001}
              />
              <CalculatorUnitField
                label="Centroid Y"
                value={shape.custom.centroidY}
                onChange={(centroidY) =>
                  setShape({ ...shape, custom: { ...shape.custom!, centroidY } })
                }
                unit={meterUnit}
                step={0.001}
              />
            </div>
            <div className={`${calculatorInputGridTightClass}`}>
              <CalculatorUnitField
                label="Ixx"
                value={shape.custom.ixx}
                onChange={(ixx) =>
                  setShape({ ...shape, custom: { ...shape.custom!, ixx } })
                }
                unit={inertiaUnit}
                step={1e-8}
              />
              <CalculatorUnitField
                label="Iyy"
                value={shape.custom.iyy}
                onChange={(iyy) =>
                  setShape({ ...shape, custom: { ...shape.custom!, iyy } })
                }
                unit={inertiaUnit}
                step={1e-8}
              />
              <CalculatorUnitField
                label="Ixy"
                value={shape.custom.ixy}
                onChange={(ixy) =>
                  setShape({ ...shape, custom: { ...shape.custom!, ixy } })
                }
                unit={inertiaUnit}
                step={1e-8}
              />
            </div>
          </div>
        )}
      </div>

    </CalculatorInputPanel>
  );
}
