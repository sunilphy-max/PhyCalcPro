"use client";

import { useMemo } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

/** Page form state merged with editable Auto-design / Compare targets. */
export function useMergedDesignInputs(userInputs: ModuleUserInputs): ModuleUserInputs {
  const { designTargets } = useDesignWorkflow();
  return useMemo(
    () => ({ ...userInputs, ...designTargets }),
    [userInputs, designTargets]
  );
}
