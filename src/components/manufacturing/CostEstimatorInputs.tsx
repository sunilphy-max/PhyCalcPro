"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";

type Props = {
  materialVolume: number;
  setMaterialVolume: (value: number) => void;
  materialDensity: number;
  setMaterialDensity: (value: number) => void;
  materialCostPerKg: number;
  setMaterialCostPerKg: (value: number) => void;
  machiningTime: number;
  setMachiningTime: (value: number) => void;
  machineRate: number;
  setMachineRate: (value: number) => void;
  laborTime: number;
  setLaborTime: (value: number) => void;
  laborRate: number;
  setLaborRate: (value: number) => void;
  finishPercent: number;
  setFinishPercent: (value: number) => void;
  overheadPercent: number;
  setOverheadPercent: (value: number) => void;
  scrapPercent: number;
  setScrapPercent: (value: number) => void;
  onCalculate: () => void;
};

export default function CostEstimatorInputs({
  materialVolume,
  setMaterialVolume,
  materialDensity,
  setMaterialDensity,
  materialCostPerKg,
  setMaterialCostPerKg,
  machiningTime,
  setMachiningTime,
  machineRate,
  setMachineRate,
  laborTime,
  setLaborTime,
  laborRate,
  setLaborRate,
  finishPercent,
  setFinishPercent,
  overheadPercent,
  setOverheadPercent,
  scrapPercent,
  setScrapPercent,
  onCalculate,
}: Props) {
  return (
    <CalculatorInputPanel
      title="Cost estimation"
      description="Estimate material, machining and labor costs for a simple manufacturing operation, accounting for finish and overhead."
      footer={<CalculatorCalculateButton onClick={onCalculate} label="Estimate cost" designAware />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Material volume</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={materialVolume}
              min={0}
              step={0.01}
              onChange={(e) => setMaterialVolume(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">m³</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Material density</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={materialDensity}
              min={0}
              step={10}
              onChange={(e) => setMaterialDensity(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">kg/m³</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Material cost</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={materialCostPerKg}
              min={0}
              step={0.01}
              onChange={(e) => setMaterialCostPerKg(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">$/kg</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Machining time</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={machiningTime}
              min={0}
              step={0.1}
              onChange={(e) => setMachiningTime(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">h</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Machine rate</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={machineRate}
              min={0}
              step={1}
              onChange={(e) => setMachineRate(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">$/h</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Labor time</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={laborTime}
              min={0}
              step={0.1}
              onChange={(e) => setLaborTime(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">h</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Labor rate</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={laborRate}
              min={0}
              step={1}
              onChange={(e) => setLaborRate(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">$/h</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Finishing markup</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={finishPercent}
              min={0}
              max={100}
              step={1}
              onChange={(e) => setFinishPercent(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Overhead markup</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={overheadPercent}
              min={0}
              max={100}
              step={1}
              onChange={(e) => setOverheadPercent(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Scrap allowance</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={scrapPercent}
              min={0}
              max={90}
              step={1}
              onChange={(e) => setScrapPercent(Number(e.target.value))}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </label>
      </div>

    </CalculatorInputPanel>
  );
}
