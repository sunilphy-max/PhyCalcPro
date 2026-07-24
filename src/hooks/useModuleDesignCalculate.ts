"use client";

import { useCallback } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { useRegisterApplyDesignCandidate } from "@/hooks/useRegisterApplyDesignCandidate";
import { useSyncDesignInputs } from "@/hooks/useSyncDesignInputs";
import { useMergedDesignInputs } from "@/hooks/useMergedDesignInputs";

type Options = {
  moduleId: string;
  userInputs: ModuleUserInputs;
  runCheck: () => void;
  applyDesign?: (fields: Record<string, unknown>) => void;
};

/**
 * Syncs live inputs to the design advisor and branches Calculate by workflow mode:
 * - Auto-design (`design`): size → apply best → validate
 * - Validate / Compare / Diagnose (`check` | `select` | `diagnose`): forward validate only
 * Compare Apply lives in ModuleDesignAdvisor; Diagnose attaches risk findings in the results layer.
 */
export function useModuleDesignCalculate({
  moduleId,
  userInputs,
  runCheck,
  applyDesign,
}: Options) {
  const { mode: workflowMode } = useDesignWorkflow();
  const mergedInputs = useMergedDesignInputs(userInputs);

  useSyncDesignInputs(moduleId, userInputs);
  useRegisterApplyDesignCandidate(applyDesign);

  const calculate = useCallback(() => {
    // Only Auto-design sizes. Validate, Compare, and Diagnose run the forward solver only.
    if (workflowMode === "design" && applyDesign) {
      const design = runModuleDesignMode(moduleId, mergedInputs);
      if (design?.best?.fields) {
        applyDesign(design.best.fields);
      }
    }
    runCheck();
  }, [workflowMode, moduleId, mergedInputs, runCheck, applyDesign]);

  return { calculate, workflowMode };
}
