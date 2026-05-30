"use client";

import { useState, useCallback } from "react";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";

/** Numeric value + unit state for one module profile field. */
export function useUnitFieldState(moduleId: string, fieldKey: string, initialValue: number) {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  const [value, setValue] = useState(initialValue);
  const [unit, setUnit] = useState(profile?.defaultUnit ?? "");

  return { value, setValue, unit, setUnit, profile };
}

/** Build applyUnitMap setters for known field keys. */
export function unitSetters(
  fields: Record<string, (unit: string) => void>
): (units: Record<string, string>) => void {
  return (units) => {
    for (const [key, setter] of Object.entries(fields)) {
      if (units[key]) setter(units[key]);
    }
  };
}
