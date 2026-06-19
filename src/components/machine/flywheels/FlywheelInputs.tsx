"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

import type { Dispatch, SetStateAction } from "react";
import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  outerDiameter: number;
  setOuterDiameter: Dispatch<SetStateAction<number>>;
  outerDiameterUnit: string;
  setOuterDiameterUnit: Dispatch<SetStateAction<string>>;
  thickness: number;
  setThickness: Dispatch<SetStateAction<number>>;
  thicknessUnit: string;
  setThicknessUnit: Dispatch<SetStateAction<string>>;
  faceWidth: number;
  setFaceWidth: Dispatch<SetStateAction<number>>;
  faceWidthUnit: string;
  setFaceWidthUnit: Dispatch<SetStateAction<string>>;
  density: number;
  setDensity: Dispatch<SetStateAction<number>>;
  densityUnit: string;
  setDensityUnit: Dispatch<SetStateAction<string>>;
  rpm: number;
  setRpm: Dispatch<SetStateAction<number>>;
  yieldStress: number;
  setYieldStress: Dispatch<SetStateAction<number>>;
  yieldStressUnit: string;
  setYieldStressUnit: Dispatch<SetStateAction<string>>;
  onCalculate: () => void;
};

export default function FlywheelInputs({
  outerDiameter,
  setOuterDiameter,
  outerDiameterUnit,
  setOuterDiameterUnit,
  thickness,
  setThickness,
  thicknessUnit,
  setThicknessUnit,
  faceWidth,
  setFaceWidth,
  faceWidthUnit,
  setFaceWidthUnit,
  density,
  setDensity,
  densityUnit,
  setDensityUnit,
  rpm,
  setRpm,
  yieldStress,
  setYieldStress,
  yieldStressUnit,
  setYieldStressUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Flywheel design"
      description="Energy storage and inertia design for rotating systems."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate flywheel" designAware />}
    >
<div className={`${calculatorInputGridClass}`}>
        <label className="space-y-2 text-sm text-slate-700">
          <span>Outer diameter</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={outerDiameter}
              onChange={(event) => setOuterDiameter(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={outerDiameterUnit}
              onChange={setOuterDiameterUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Thickness</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={thickness}
              onChange={(event) => setThickness(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={thicknessUnit}
              onChange={setThicknessUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Face width</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={faceWidth}
              onChange={(event) => setFaceWidth(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={faceWidthUnit}
              onChange={setFaceWidthUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Density</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={density}
              onChange={(event) => setDensity(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="density"
              value={densityUnit}
              onChange={setDensityUnit}
            />
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Speed</span>
          <input
            type="number"
            value={rpm}
            onChange={(event) => setRpm(Number(event.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-400">RPM</p>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Yield stress</span>
          <div className="flex gap-2">
            <input
              type="number"
              value={yieldStress}
              onChange={(event) => setYieldStress(Number(event.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="stress"
              value={yieldStressUnit}
              onChange={setYieldStressUnit}
            />
          </div>
        </label>
      </div>
    </CalculatorInputPanel>
  );
}

