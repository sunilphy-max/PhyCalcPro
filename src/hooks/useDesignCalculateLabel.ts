"use client";

import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";

export function getDesignCalculateLabel(
  mode: "check" | "design" | "select",
  fallback = "Calculate"
): string {
  if (mode === "design") return "Run design";
  if (mode === "select") return "Compare options";
  return fallback;
}

/** Label for the primary action button based on workflow mode. */
export function useDesignCalculateLabel(fallback = "Calculate"): string {
  const { mode } = useDesignWorkflow();
  return getDesignCalculateLabel(mode, fallback);
}
