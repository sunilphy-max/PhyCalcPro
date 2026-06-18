"use client";

import { useCallback } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";

type Options = {
  moduleId: string;
  userInputs: ModuleUserInputs;
  runCheck: () => void;
  applyDesign?: (fields: Record<string, unknown>) => void;
};

/**
 * Syncs live inputs to the design advisor and branches Calculate on Validate vs Auto-design mode.
 * Registers applyDesign for Select-mode candidate loading in the advisor panel.
 */
export function useModuleDesignCalculate({
  moduleId,
  userInputs,
  runCheck,
  applyDesign,
}: Options) {
  const { mode: workflowMode } = useDesignWorkflow();

  useSyncDesignInputs(moduleId, userInputs);
  useRegisterApplyDesignCandidate(applyDesign);

  const calculate = useCallback(() => {
    if (workflowMode === "design" && applyDesign) {
      const design = runModuleDesignMode(moduleId, userInputs);
      if (design?.best?.fields) {
        applyDesign(design.best.fields);
      }
    }
    runCheck();
  }, [workflowMode, moduleId, userInputs, runCheck, applyDesign]);

  return { calculate, workflowMode };
}
