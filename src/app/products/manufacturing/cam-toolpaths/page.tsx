"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import CamToolpathsInputs from "@/components/manufacturing/CamToolpathsInputs";
import CamToolpathsResults from "@/components/manufacturing/CamToolpathsResults";
import { solveCamToolpathsEngine } from "@/lib/manufacturing/camToolpaths/engine";
import type { CamToolpathsResult } from "@/lib/manufacturing/camToolpaths/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("cam-toolpaths");
  const [toolDiameter, setToolDiameter] = useState(12);
  const [numFlutes, setNumFlutes] = useState(4);
  const [spindleSpeed, setSpindleSpeed] = useState(4200);
  const [feedPerTooth, setFeedPerTooth] = useState(0.06);
  const [axialDepth, setAxialDepth] = useState(2);
  const [radialDepth, setRadialDepth] = useState(6);
  const [stockLength, setStockLength] = useState(80);
  const [stockWidth, setStockWidth] = useState(40);
  const [stepOverPercent, setStepOverPercent] = useState(60);
  const [result, setResult] = useState<CamToolpathsResult | null>(null);

  const runCheck = () => {
    const raw = solveCamToolpathsEngine({
      toolDiameter,
      numFlutes,
      spindleSpeed,
      feedPerTooth,
      axialDepth,
      radialDepth,
      stockLength,
      stockWidth,
      stepOverPercent,
    });

    setResult(wrapResult(raw));
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      cycleTimeTarget: stockLength / Math.max(feedPerTooth * numFlutes * spindleSpeed / 60, 1),
    }), [stockLength, feedPerTooth, numFlutes, spindleSpeed]);

  useSyncDesignInputs("cam-toolpaths", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  useRegisterApplyDesignCandidate(applyDesignFields);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("cam-toolpaths", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
          <CalculatorLayout
        moduleId="cam-toolpaths"
        title="CAM Toolpath Calculator"
        left={<CamToolpathsInputs
          toolDiameter={toolDiameter}
          setToolDiameter={setToolDiameter}
          numFlutes={numFlutes}
          setNumFlutes={setNumFlutes}
          spindleSpeed={spindleSpeed}
          setSpindleSpeed={setSpindleSpeed}
          feedPerTooth={feedPerTooth}
          setFeedPerTooth={setFeedPerTooth}
          axialDepth={axialDepth}
          setAxialDepth={setAxialDepth}
          radialDepth={radialDepth}
          setRadialDepth={setRadialDepth}
          stockLength={stockLength}
          setStockLength={setStockLength}
          stockWidth={stockWidth}
          setStockWidth={setStockWidth}
          stepOverPercent={stepOverPercent}
          setStepOverPercent={setStepOverPercent}
          onCalculate={calculate}
        />}
        center={<div className="bg-white rounded-xl p-6 shadow-sm text-slate-500">
          <p>Estimate a basic roughing toolpath with feed, material removal rate, and cut time guidance.</p>
        </div>}
        right={<CamToolpathsResults result={result} />}
      />
  );
}
