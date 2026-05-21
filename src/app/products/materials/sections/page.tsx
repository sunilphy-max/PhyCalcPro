"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import SectionInputs from "@/components/materials/SectionInputs";
import SectionResults from "@/components/materials/SectionResults";
import { toBase, fromBase } from "@/lib/units/conversions";
import { solveSectionEngine } from "@/lib/materials/engine";
import type { SectionConfig, SectionResult } from "@/lib/materials/types";

export default function Page() {
  const [shape, setShape] = useState<SectionConfig["shape"]>("rectangle");
  const [width, setWidth] = useState(0.1);
  const [height, setHeight] = useState(0.2);
  const [diameter, setDiameter] = useState(0.15);
  const [flangeWidth, setFlangeWidth] = useState(0.12);
  const [flangeThickness, setFlangeThickness] = useState(0.015);
  const [webHeight, setWebHeight] = useState(0.18);
  const [webThickness, setWebThickness] = useState(0.01);
  const [lengthUnit, setLengthUnit] = useState("m");
  const [result, setResult] = useState<SectionResult | null>(null);

  const calculate = () => {
    const config: SectionConfig = {
      shape,
      width: shape === "rectangle" ? toBase(width, "length", lengthUnit) : undefined,
      height: shape === "rectangle" ? toBase(height, "length", lengthUnit) : undefined,
      diameter: shape === "circle" ? toBase(diameter, "length", lengthUnit) : undefined,
      flangeWidth: shape === "i_beam" ? toBase(flangeWidth, "length", lengthUnit) : undefined,
      flangeThickness: shape === "i_beam" ? toBase(flangeThickness, "length", lengthUnit) : undefined,
      webHeight: shape === "i_beam" ? toBase(webHeight, "length", lengthUnit) : undefined,
      webThickness: shape === "i_beam" ? toBase(webThickness, "length", lengthUnit) : undefined,
    };

    const raw = solveSectionEngine(config);
    const areaUnit = `${lengthUnit}2`;
    const inertiaUnit = lengthUnit === "mm" ? "mm4" : lengthUnit === "in" ? "in4" : "m4";

    setResult({
      ...raw,
      area: fromBase(raw.area, "area", areaUnit),
      centroidY: fromBase(raw.centroidY, "length", lengthUnit),
      Ixx: fromBase(raw.Ixx, "inertia", inertiaUnit),
      Iyy: fromBase(raw.Iyy, "inertia", inertiaUnit),
    });
  };

  return (
    <DashboardLayout title="Section Properties">
      <CalculatorLayout
        title="Section Property Calculator"
        left={<SectionInputs
          shape={shape}
          setShape={setShape}
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
          diameter={diameter}
          setDiameter={setDiameter}
          flangeWidth={flangeWidth}
          setFlangeWidth={setFlangeWidth}
          flangeThickness={flangeThickness}
          setFlangeThickness={setFlangeThickness}
          webHeight={webHeight}
          setWebHeight={setWebHeight}
          webThickness={webThickness}
          setWebThickness={setWebThickness}
          lengthUnit={lengthUnit}
          setLengthUnit={setLengthUnit}
          onCalculate={calculate}
        />}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Calculate area, centroid position, and second moments of area for standard section shapes.</p>
        </div>}
        right={<SectionResults
          result={result}
          linearUnit={lengthUnit}
          areaUnit={`${lengthUnit}2`}
          inertiaUnit={lengthUnit === "mm" ? "mm4" : lengthUnit === "in" ? "in4" : "m4"}
        />}
      />
    </DashboardLayout>
  );
}
