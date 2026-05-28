"use client";

import { useCallback } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { withCalculationSpec } from "@/lib/standards/withCalculationSpec";
import { buildModuleUnitMap } from "@/lib/standards/unitPreferences";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";
import { useDesignCodeUnits } from "@/hooks/useDesignCodeUnits";

/**
 * Attach CalculationSpec to solver output and apply region units for a module.
 */
export function useStandardCalculation(moduleId: string) {
  const { designCode } = useDesignCode();

  const fieldKeys = Object.keys(moduleUnitProfiles[moduleId] ?? {});

  const wrapResult = useCallback(
    <T extends object>(result: T) => withCalculationSpec(moduleId, designCode, result),
    [moduleId, designCode]
  );

  const applyModuleUnits = useCallback(
    (applyUnits: (units: Record<string, string>) => void) => {
      applyUnits(buildModuleUnitMap(moduleId, fieldKeys, designCode));
    },
    [moduleId, designCode, fieldKeys]
  );

  return { designCode, wrapResult, fieldKeys, applyModuleUnits };
}

export function useModuleDesignCodeUnits(
  moduleId: string,
  applyUnits: (units: Record<string, string>) => void
) {
  const { fieldKeys, applyModuleUnits } = useStandardCalculation(moduleId);
  useDesignCodeUnits(moduleId, fieldKeys, applyUnits);
  return applyModuleUnits;
}
