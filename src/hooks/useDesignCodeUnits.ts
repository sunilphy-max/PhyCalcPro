"use client";

import { useEffect } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { buildModuleUnitMap } from "@/lib/standards/unitPreferences";

/**
 * When the user changes US / EU / ISO / Indicative, apply region-default units for listed fields.
 */
export function useDesignCodeUnits(
  moduleId: string,
  fieldKeys: string[],
  applyUnits: (units: Record<string, string>) => void
) {
  const { designCode } = useDesignCode();

  useEffect(() => {
    applyUnits(buildModuleUnitMap(moduleId, fieldKeys, designCode));
  }, [designCode, moduleId, fieldKeys, applyUnits]);
}
