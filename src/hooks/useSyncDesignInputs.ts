"use client";

import { useEffect, useMemo } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

/**
 * Pushes live calculator state into DesignWorkflowContext so the advisor
 * and computed candidates reflect current form values.
 */
export function useSyncDesignInputs(_moduleId: string | undefined, userInputs: ModuleUserInputs) {
  const { setUserInputs, designTargets } = useDesignWorkflow();
  const mergedInputs = useMemo(
    () => ({ ...userInputs, ...designTargets }),
    [userInputs, designTargets]
  );
  const inputsKey = useMemo(() => JSON.stringify(mergedInputs), [mergedInputs]);

  useEffect(() => {
    setUserInputs((prev) => {
      if (JSON.stringify(prev) === inputsKey) return prev;
      return mergedInputs;
    });
  }, [setUserInputs, inputsKey, mergedInputs]);
}
