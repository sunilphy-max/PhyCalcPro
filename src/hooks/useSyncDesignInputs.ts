"use client";

import { useEffect, useMemo } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

/**
 * Pushes live calculator state into DesignWorkflowContext so the advisor
 * and computed candidates reflect current form values.
 */
export function useSyncDesignInputs(_moduleId: string | undefined, userInputs: ModuleUserInputs) {
  const { setUserInputs } = useDesignWorkflow();
  const inputsKey = useMemo(() => JSON.stringify(userInputs), [userInputs]);

  useEffect(() => {
    setUserInputs(userInputs);
  }, [setUserInputs, inputsKey, userInputs]);
}
