"use client";

import { useApplyDesignFields } from "@/hooks/useApplyDesignFields";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CostEstimatorInputs from "@/components/manufacturing/CostEstimatorInputs";
import CostEstimatorResults from "@/components/manufacturing/CostEstimatorResults";
import { solveCostEstimatorEngine } from "@/lib/manufacturing/costEstimator/engine";
import type { CostEstimatorResult } from "@/lib/manufacturing/costEstimator/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("cost-estimator");
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

  const runCheck = () => {
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

    setResult(wrapResult(raw));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      costTarget: materialVolume * materialDensity * materialCostPerKg,
    }), [materialVolume, materialDensity, materialCostPerKg]);

  useSyncDesignInputs("cost-estimator", designUserInputs);

  const applyDesignFields = useApplyDesignFields({
    machiningTime: (v) => setMachiningTime(typeof v === "number" ? v : Number(v)),
  });

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("cost-estimator", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="cost-estimator"
        title="Manufacturing Cost Estimator"
        inputs={<CostEstimatorInputs
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
        results={<CostEstimatorResults result={result} />}
      />
  );
}
