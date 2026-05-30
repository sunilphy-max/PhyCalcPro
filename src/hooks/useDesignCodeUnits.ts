"use client";

import { useEffect, useRef } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { buildModuleUnitMap } from "@/lib/standards/unitPreferences";

/**
 * When the user changes design standard (US / EU / ISO / Indicative), apply region-default
 * units for listed fields. Does not re-run when the apply callback identity changes so
 * manual unit picks are preserved until the standard changes again.
 */
export function useDesignCodeUnits(
  moduleId: string,
  fieldKeys: string[],
  applyUnits: (units: Record<string, string>) => void
) {
  const { designCode } = useDesignCode();
  const applyRef = useRef(applyUnits);
  applyRef.current = applyUnits;

  useEffect(() => {
    applyRef.current(buildModuleUnitMap(moduleId, fieldKeys, designCode));
  }, [designCode, moduleId, fieldKeys]);
}
