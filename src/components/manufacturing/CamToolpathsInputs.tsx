"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import { calculatorInputGridClass } from "@/components/calculator/styles";

type Props = {
  toolDiameter: number;
  setToolDiameter: (value: number) => void;
  numFlutes: number;
  setNumFlutes: (value: number) => void;
  spindleSpeed: number;
  setSpindleSpeed: (value: number) => void;
  feedPerTooth: number;
  setFeedPerTooth: (value: number) => void;
  axialDepth: number;
  setAxialDepth: (value: number) => void;
  radialDepth: number;
  setRadialDepth: (value: number) => void;
  stockLength: number;
  setStockLength: (value: number) => void;
  stockWidth: number;
  setStockWidth: (value: number) => void;
  stepOverPercent: number;
  setStepOverPercent: (value: number) => void;
  onCalculate: () => void;
};

export default function CamToolpathsInputs({
  toolDiameter,
  setToolDiameter,
  numFlutes,
  setNumFlutes,
  spindleSpeed,
  setSpindleSpeed,
  feedPerTooth,
  setFeedPerTooth,
  axialDepth,
  setAxialDepth,
  radialDepth,
  setRadialDepth,
  stockLength,
  setStockLength,
  stockWidth,
  setStockWidth,
  stepOverPercent,
  setStepOverPercent,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="CAM toolpaths"
      description="Estimate a basic roughing toolpath with feed, material removal rate, and cut time guidance."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate toolpath" designAware />}
    >
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorNumberField
          label="Tool diameter (mm)"
          value={toolDiameter}
          onChange={setToolDiameter}
          min={1}
          step={0.1}
        />
        <CalculatorNumberField label="Number of flutes" value={numFlutes} onChange={setNumFlutes} min={1} step={1} />
        <CalculatorNumberField
          label="Spindle speed (rpm)"
          value={spindleSpeed}
          onChange={setSpindleSpeed}
          min={100}
          step={10}
        />
        <CalculatorNumberField
          label="Feed per tooth (mm/tooth)"
          value={feedPerTooth}
          onChange={setFeedPerTooth}
          min={0.01}
          step={0.01}
        />
        <CalculatorNumberField
          label="Axial depth (mm)"
          value={axialDepth}
          onChange={setAxialDepth}
          min={0.1}
          step={0.1}
        />
        <CalculatorNumberField
          label="Radial depth (mm)"
          value={radialDepth}
          onChange={setRadialDepth}
          min={0.1}
          step={0.1}
        />
        <CalculatorNumberField
          label="Stock length (mm)"
          value={stockLength}
          onChange={setStockLength}
          min={1}
          step={1}
        />
        <CalculatorNumberField
          label="Stock width (mm)"
          value={stockWidth}
          onChange={setStockWidth}
          min={toolDiameter}
          step={1}
        />
        <CalculatorNumberField
          label="Step-over (%)"
          value={stepOverPercent}
          onChange={setStepOverPercent}
          min={10}
          max={100}
          step={5}
        />
      </div>
    </CalculatorInputPanel>
  );
}
