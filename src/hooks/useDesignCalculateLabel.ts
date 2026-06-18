"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import {
  getDesignCalculateLabel as getLabel,
  type DesignWorkflowMode,
} from "@/lib/design-workflows/workflowModeLabels";

export function getDesignCalculateLabel(
  mode: DesignWorkflowMode,
  fallback = "Calculate"
): string {
  return getLabel(mode, fallback);
}

/** Label for the primary action button based on workflow mode. */
export function useDesignCalculateLabel(fallback = "Calculate"): string {
  const { mode } = useDesignWorkflow();
  return getDesignCalculateLabel(mode, fallback);
}
