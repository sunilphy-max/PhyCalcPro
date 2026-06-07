"use client";

import { useMemo } from "react";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import type { SectionShape } from "@/lib/materials/types";

type Props = {
  shape: SectionShape;
  setShape: (shape: SectionShape) => void;
  width: number;
  setWidth: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  diameter: number;
  setDiameter: (value: number) => void;
  flangeWidth: number;
  setFlangeWidth: (value: number) => void;
  flangeThickness: number;
  setFlangeThickness: (value: number) => void;
  webHeight: number;
  setWebHeight: (value: number) => void;
  webThickness: number;
  setWebThickness: (value: number) => void;
  lengthUnit: string;
  setLengthUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function SectionInputs({
  shape,
  setShape,
  width,
  setWidth,
  height,
  setHeight,
  diameter,
  setDiameter,
  flangeWidth,
  setFlangeWidth,
  flangeThickness,
  setFlangeThickness,
  webHeight,
  setWebHeight,
  webThickness,
  setWebThickness,
  lengthUnit,
  setLengthUnit,
  onCalculate,
}: Props) {
  const shapeLabel = useMemo(() => {
    switch (shape) {
      case "circle":
        return "Circular section";
      case "i_beam":
        return "I-beam section";
      default:
        return "Rectangular section";
    }
  }, [shape]);

  return (
    <CalculatorInputPanel
      title="Section properties"
      description="Calculate area, centroid position, and second moments of area for standard section shapes."
      footer={
        <CalculatorCalculateButton onClick={onCalculate} label={`Calculate ${shapeLabel.toLowerCase()}`} designAware />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-600">
          Section type
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as SectionShape)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="i_beam">I-beam</option>
          </select>
        </label>

        <ModuleUnitSelect
          moduleId="sections"
          fieldKey="length"
          value={lengthUnit}
          onChange={setLengthUnit}
        />
      </div>

      <div className="grid gap-4">
        {shape === "rectangle" ? (
          <>
            <label className="space-y-1 text-sm text-slate-600">
              Width
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Height
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
          </>
        ) : shape === "circle" ? (
          <label className="space-y-1 text-sm text-slate-600">
            Diameter
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(Number(e.target.value))}
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </label>
        ) : (
          <>
            <label className="space-y-1 text-sm text-slate-600">
              Flange width
              <input
                type="number"
                value={flangeWidth}
                onChange={(e) => setFlangeWidth(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Flange thickness
              <input
                type="number"
                value={flangeThickness}
                onChange={(e) => setFlangeThickness(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Web height
              <input
                type="number"
                value={webHeight}
                onChange={(e) => setWebHeight(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Web thickness
              <input
                type="number"
                value={webThickness}
                onChange={(e) => setWebThickness(Number(e.target.value))}
                className="w-full rounded border border-slate-200 px-3 py-2"
              />
            </label>
          </>
        )}
      </div>

    </CalculatorInputPanel>
  );
}
