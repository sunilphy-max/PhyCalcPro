"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

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
        <label className="space-y-2 text-sm text-slate-700">
          <span>Tool diameter</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={toolDiameter}
              min={1}
              step={0.1}
              onChange={(e) => setToolDiameter(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Number of flutes</span>
          <input
            type="number"
            value={numFlutes}
            min={1}
            step={1}
            onChange={(e) => setNumFlutes(Number(e.target.value))}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Spindle speed</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={spindleSpeed}
              min={100}
              step={10}
              onChange={(e) => setSpindleSpeed(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">RPM</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Feed per tooth</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={feedPerTooth}
              min={0.01}
              step={0.01}
              onChange={(e) => setFeedPerTooth(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm/tooth</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Axial depth</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={axialDepth}
              min={0.1}
              step={0.1}
              onChange={(e) => setAxialDepth(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Radial depth</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={radialDepth}
              min={0.1}
              step={0.1}
              onChange={(e) => setRadialDepth(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Stock length</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={stockLength}
              min={1}
              step={1}
              onChange={(e) => setStockLength(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Stock width</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={stockWidth}
              min={toolDiameter}
              step={1}
              onChange={(e) => setStockWidth(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">mm</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Step-over</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={stepOverPercent}
              min={10}
              max={100}
              step={5}
              onChange={(e) => setStepOverPercent(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </label>
      </div>

    </CalculatorInputPanel>
  );
}
