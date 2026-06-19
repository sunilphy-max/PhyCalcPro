"use client";

import { calculatorInputGridClass } from "@/components/calculator/styles";
import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  boreDiameter: number;
  setBoreDiameter: (value: number) => void;
  rodDiameter: number;
  setRodDiameter: (value: number) => void;
  strokeLength: number;
  setStrokeLength: (value: number) => void;
  boreUnit: string;
  setBoreUnit: (unit: string) => void;
  strokeUnit: string;
  setStrokeUnit: (unit: string) => void;
  pressure: number;
  setPressure: (value: number) => void;
  pressureUnit: string;
  setPressureUnit: (unit: string) => void;
  forceGoal: number;
  setForceGoal: (value: number) => void;
  forceUnit: string;
  setForceUnit: (unit: string) => void;
  onCalculate: () => void;
};

export default function HydraulicsInputs({
  boreDiameter,
  setBoreDiameter,
  rodDiameter,
  setRodDiameter,
  strokeLength,
  setStrokeLength,
  boreUnit,
  setBoreUnit,
  strokeUnit,
  setStrokeUnit,
  pressure,
  setPressure,
  pressureUnit,
  setPressureUnit,
  forceGoal,
  setForceGoal,
  forceUnit,
  setForceUnit,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Hydraulic cylinder"
      description="Analyze actuator forces and pressure loads."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Calculate hydraulics" designAware />}
    >
<div className={`${calculatorInputGridClass}`}>
        <div className="space-y-2 text-sm text-slate-700">
          <label>Bore diameter</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={0.001}
              value={boreDiameter}
              onChange={(e) => setBoreDiameter(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={boreUnit}
              onChange={setBoreUnit}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label>Rod diameter</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={0.001}
              value={rodDiameter}
              onChange={(e) => setRodDiameter(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={boreUnit}
              onChange={setBoreUnit}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label>Stroke length</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={0.01}
              value={strokeLength}
              onChange={(e) => setStrokeLength(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="length"
              value={strokeUnit}
              onChange={setStrokeUnit}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label>System pressure</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={10000}
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="pressure"
              value={pressureUnit}
              onChange={setPressureUnit}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-700">
          <label>Target force</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={100}
              value={forceGoal}
              onChange={(e) => setForceGoal(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <UnitSelector
              label=""
              dimension="force"
              value={forceUnit}
              onChange={setForceUnit}
            />
          </div>
        </div>
      </div>
    </CalculatorInputPanel>
  );
}

