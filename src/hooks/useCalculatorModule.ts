"use client";

import { useStandardCalculation } from "@/hooks/useStandardCalculation";

/** Alias for pages that pass explicit region unit setters. */
export function useCalculatorModule(
  moduleId: string,
  onRegionUnits: (units: Record<string, string>) => void
) {
  return useStandardCalculation(moduleId, onRegionUnits);
}
