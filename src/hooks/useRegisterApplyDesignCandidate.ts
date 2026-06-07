"use client";

import { useEffect } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";

/** Registers a handler so Select-mode Apply in the advisor loads a candidate into the form. */
export function useRegisterApplyDesignCandidate(
  applyDesign: ((fields: Record<string, unknown>) => void) | undefined
) {
  const { setMode, registerApplyDesignCandidate } = useDesignWorkflow();

  useEffect(() => {
    if (!applyDesign) return;
    registerApplyDesignCandidate((fields) => {
      applyDesign(fields);
      setMode("check");
    });
    return () => registerApplyDesignCandidate(null);
  }, [applyDesign, registerApplyDesignCandidate, setMode]);
}
