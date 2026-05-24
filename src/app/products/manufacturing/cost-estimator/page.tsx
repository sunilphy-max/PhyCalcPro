"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CalculatorLayout from "@/components/CalculatorLayout";
import CostEstimatorInputs from "@/components/manufacturing/CostEstimatorInputs";
import CostEstimatorResults from "@/components/manufacturing/CostEstimatorResults";
import { solveCostEstimatorEngine } from "@/lib/manufacturing/costEstimator/engine";
import type { CostEstimatorResult } from "@/lib/manufacturing/costEstimator/types";

export default function Page() {
  const [materialVolume, setMaterialVolume] = useState(0.5);
  const [materialDensity, setMaterialDensity] = useState(7800);
  const [materialCostPerKg, setMaterialCostPerKg] = useState(2.5);
  const [machiningTime, setMachiningTime] = useState(1.5);
  const [machineRate, setMachineRate] = useState(60);
  const [laborTime, setLaborTime] = useState(0.8);
  const [laborRate, setLaborRate] = useState(45);
  const [finishPercent, setFinishPercent] = useState(12);
  const [overheadPercent, setOverheadPercent] = useState(18);
  const [scrapPercent, setScrapPercent] = useState(6);
  const [result, setResult] = useState<CostEstimatorResult | null>(null);

  const calculate = () => {
    const raw = solveCostEstimatorEngine({
      materialVolume,
      materialDensity,
      materialCostPerKg,
      machiningTime,
      machineRate,
      laborTime,
      laborRate,
      finishPercent,
      overheadPercent,
      scrapPercent,
    });

    setResult(raw);
  };

  return (
    <DashboardLayout title="Cost Estimation">
      <CalculatorLayout
        title="Manufacturing Cost Estimator"
        left={<CostEstimatorInputs
          materialVolume={materialVolume}
          setMaterialVolume={setMaterialVolume}
          materialDensity={materialDensity}
          setMaterialDensity={setMaterialDensity}
          materialCostPerKg={materialCostPerKg}
          setMaterialCostPerKg={setMaterialCostPerKg}
          machiningTime={machiningTime}
          setMachiningTime={setMachiningTime}
          machineRate={machineRate}
          setMachineRate={setMachineRate}
          laborTime={laborTime}
          setLaborTime={setLaborTime}
          laborRate={laborRate}
          setLaborRate={setLaborRate}
          finishPercent={finishPercent}
          setFinishPercent={setFinishPercent}
          overheadPercent={overheadPercent}
          setOverheadPercent={setOverheadPercent}
          scrapPercent={scrapPercent}
          setScrapPercent={setScrapPercent}
          onCalculate={calculate}
        />}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Estimate material, machining and labor costs for a simple manufacturing operation, accounting for finish and overhead.</p>
        </div>}
        right={<CostEstimatorResults result={result} />}
      />
    </DashboardLayout>
  );
}
