"use client";

import CalculatorInputPanel from "@/components/calculator/CalculatorInputPanel";
import CalculatorCalculateButton from "@/components/calculator/CalculatorCalculateButton";
import CalculatorNumberField from "@/components/calculator/CalculatorNumberField";
import { calculatorInputGridClass } from "@/components/calculator/styles";

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
      <div className={`${calculatorInputGridClass}`}>
        <CalculatorNumberField
          label="Material volume (m³)"
          value={materialVolume}
          onChange={setMaterialVolume}
          min={0}
          step={0.01}
        />
        <CalculatorNumberField
          label="Material density (kg/m³)"
          value={materialDensity}
          onChange={setMaterialDensity}
          min={0}
          step={10}
        />
        <CalculatorNumberField
          label="Material cost ($/kg)"
          value={materialCostPerKg}
          onChange={setMaterialCostPerKg}
          min={0}
          step={0.01}
        />
        <CalculatorNumberField
          label="Machining time (h)"
          value={machiningTime}
          onChange={setMachiningTime}
          min={0}
          step={0.1}
        />
        <CalculatorNumberField
          label="Machine rate ($/h)"
          value={machineRate}
          onChange={setMachineRate}
          min={0}
          step={1}
        />
        <CalculatorNumberField
          label="Labor time (h)"
          value={laborTime}
          onChange={setLaborTime}
          min={0}
          step={0.1}
        />
        <CalculatorNumberField
          label="Labor rate ($/h)"
          value={laborRate}
          onChange={setLaborRate}
          min={0}
          step={1}
        />
        <CalculatorNumberField
          label="Finishing markup (%)"
          value={finishPercent}
          onChange={setFinishPercent}
          min={0}
          max={100}
          step={1}
        />
        <CalculatorNumberField
          label="Overhead markup (%)"
          value={overheadPercent}
          onChange={setOverheadPercent}
          min={0}
          max={100}
          step={1}
        />
        <CalculatorNumberField
          label="Scrap allowance (%)"
          value={scrapPercent}
          onChange={setScrapPercent}
          min={0}
          max={90}
          step={1}
        />
      </div>
    </CalculatorInputPanel>
  );
}
