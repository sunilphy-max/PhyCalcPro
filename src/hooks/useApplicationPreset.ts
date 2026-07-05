"use client";

import { useEffect, useMemo } from "react";
import { useDesignCode } from "@/contexts/DesignCodeContext";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import {
  asBeamApplicationId,
  getDefaultPresetId,
  getModuleApplicationPreset,
  moduleSupportsApplicationPreset,
} from "@/lib/applications";
import type { ModuleApplicationPreset } from "@/lib/applications";
import type { BeamApplicationId } from "@/lib/structural/beams/applicationPresets";

/**
 * Resolves the active application preset for a module from design workflow state.
 */
export function useApplicationPreset(moduleId: string | undefined) {
  const { designCode } = useDesignCode();
  const { userInputs } = useDesignWorkflow();

  const presetId =
    userInputs.applicationPresetId ??
    (moduleId ? getDefaultPresetId(moduleId, designCode) : "general_mechanics");

  const preset = useMemo(
    () => (moduleId ? getModuleApplicationPreset(moduleId, presetId) : null),
    [moduleId, presetId]
  );

  return { presetId, preset };
}

/** Beam pages: map shared preset id to BeamApplicationId for solvers. */
export function useBeamApplicationPreset(): {
  applicationId: BeamApplicationId;
  preset: ModuleApplicationPreset | null;
} {
  const { presetId, preset } = useApplicationPreset("beams");
  return {
    applicationId: asBeamApplicationId(presetId),
    preset,
  };
}

type ApplyHandler = (preset: ModuleApplicationPreset, presetId: string) => void;

/**
 * Calls handler when the user changes application preset (not on initial mount).
 */
export function useOnApplicationPresetChange(
  moduleId: string | undefined,
  handler: ApplyHandler
) {
  const { presetId, preset } = useApplicationPreset(moduleId);
  const { userInputs } = useDesignWorkflow();

  useEffect(() => {
    if (!moduleId || !preset || userInputs.applicationPresetId == null) return;
    handler(preset, presetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to preset id changes
  }, [presetId]);
}

export function useShowApplicationPreset(moduleId: string | undefined): boolean {
  return Boolean(moduleId && moduleSupportsApplicationPreset(moduleId));
}
