"use client";

import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import CalculatorGuidancePanel from "@/components/calculator/CalculatorGuidancePanel";
import GearRatioDesignInputs from "@/components/machine/gear-ratio-design/GearRatioDesignInputs";
import GearRatioDesignResults from "@/components/machine/gear-ratio-design/GearRatioDesignResults";
import { useStandardCalculation } from "@/hooks/useStandardCalculation";
import { solveGearRatioDesignEngine } from "@/lib/machine/gear-ratio-design/engine";
import type { GearRatioDesignResult } from "@/lib/machine/gear-ratio-design/types";
import type { CalculationSpec } from "@/lib/standards/types";

export default function Page() {
  const { mode: workflowMode } = useDesignWorkflow();
  const { wrapResult } = useStandardCalculation("gear-ratio-design");

  const [targetRatio, setTargetRatio] = useState(3.5);
  const [maxTeeth, setMaxTeeth] = useState(120);
  const [minPinionTeeth, setMinPinionTeeth] = useState(12);
  const [result, setResult] = useState<(GearRatioDesignResult & { calculationSpec?: CalculationSpec }) | null>(null);

  const runCheck = () => {
    setResult(
      wrapResult(
        solveGearRatioDesignEngine({
          targetRatio,
          maxTeeth,
          minPinionTeeth,
        })
      )
    );
  };


  const designUserInputs = useMemo((): ModuleUserInputs => ({
      ratio: targetRatio,
      pinionTeeth: minPinionTeeth,
    }), [targetRatio, minPinionTeeth]);

  useSyncDesignInputs("gear-ratio-design", designUserInputs);

  const applyDesignFields = useCallback((_fields: Record<string, unknown>) => {}, []);

  const calculate = () => {
    if (workflowMode === "design") {
      const design = runModuleDesignMode("gear-ratio-design", designUserInputs);
      if (design?.best?.fields) applyDesignFields(design.best.fields);
    }
    runCheck();
  };

  return (
    <CalculatorLayout
      moduleId="gear-ratio-design"
      title="Gear Ratio Design"
      left={
        <GearRatioDesignInputs
          targetRatio={targetRatio}
          setTargetRatio={setTargetRatio}
          maxTeeth={maxTeeth}
          setMaxTeeth={setMaxTeeth}
          minPinionTeeth={minPinionTeeth}
          setMinPinionTeeth={setMinPinionTeeth}
          onCalculate={calculate}
        />
      }
      center={
        <CalculatorGuidancePanel title="Gear ratio design">
          <p>
            Searches integer tooth pairs within the specified bounds. Prefer pinion teeth above 17 to avoid
            undercutting and verify contact ratio for the selected module.
          </p>
        </CalculatorGuidancePanel>
      }
      right={<GearRatioDesignResults result={result} targetRatio={targetRatio} />}
    />
  );
}
