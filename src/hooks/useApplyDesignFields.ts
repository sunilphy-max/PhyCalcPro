"use client";

import { useCallback, useRef } from "react";
import { applyDesignFieldValues } from "@/lib/design-workflows/applyDesignFieldValues";

/** Stable callback that applies ranked design candidate fields to form setters. */
export function useApplyDesignFields(
  setters: Record<string, (value: unknown) => void>
) {
  const ref = useRef(setters);
  ref.current = setters;

  return useCallback((fields: Record<string, unknown>) => {
    applyDesignFieldValues(fields, ref.current);
  }, []);
}
