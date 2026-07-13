"use client";

import { useEffect } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getModuleApplicationPreset } from "@/lib/applications";
import {
  getBearingPresetDefaults,
  getHousingPresetDefaults,
  getPlainBearingPresetDefaults,
} from "@/lib/applications/bearingPresets";
import type {
  BearingReliability,
  LubricationClass,
  LubricantType,
  BearingLifeMethod,
  RollingElementMaterial,
} from "@/lib/machine/bearings/types";

type RollingSyncHandlers = {
  setReliability: (v: BearingReliability) => void;
  setLubricationClass: (v: LubricationClass | "") => void;
  setSafetyFactor: (v: number) => void;
  setShockFactor?: (v: number) => void;
  setLubricantType?: (v: LubricantType) => void;
  setContamination?: (v: import("@/lib/machine/bearings/types").ContaminationLevel) => void;
  setLifeMethod?: (v: BearingLifeMethod) => void;
  setRollingElementMaterial?: (v: RollingElementMaterial) => void;
};

/**
 * Apply calculation-standard knobs when the application preset changes.
 * Does not change bearing type, manufacturer, designation, or catalog profile.
 */
export function useRollingBearingPresetSync(handlers: RollingSyncHandlers) {
  const { mergedUserInputs } = useDesignWorkflow();
  const presetId = mergedUserInputs.applicationPresetId;

  useEffect(() => {
    if (!presetId) return;
    const defaults = getBearingPresetDefaults(presetId);
    if (!defaults) return;

    const preset = getModuleApplicationPreset("bearings", presetId);

    if (defaults.reliability != null) handlers.setReliability(defaults.reliability);
    if (defaults.lubricationClass !== undefined) {
      handlers.setLubricationClass(defaults.lubricationClass);
    }
    if (preset.knobs.targetSafetyFactor != null) {
      handlers.setSafetyFactor(preset.knobs.targetSafetyFactor);
    }
    if (defaults.shockFactor != null && handlers.setShockFactor) {
      handlers.setShockFactor(defaults.shockFactor);
    }
    if (defaults.preferModifiedLife && handlers.setLubricantType) {
      handlers.setLubricantType("oil");
      handlers.setContamination?.("normal_clean");
    }
    if (defaults.preferLifeMethod && handlers.setLifeMethod) {
      handlers.setLifeMethod(defaults.preferLifeMethod);
    }
    if (defaults.preferRollingElementMaterial && handlers.setRollingElementMaterial) {
      handlers.setRollingElementMaterial(defaults.preferRollingElementMaterial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on preset id only
  }, [presetId]);
}

type PlainSyncHandlers = {
  setSafetyFactor?: (v: number) => void;
  setServiceFactor?: (v: number) => void;
};

/**
 * Apply plain-bearing calculation knobs only.
 * Does not change journal / thrust / tilting-pad selection.
 */
export function usePlainBearingPresetSync(handlers: PlainSyncHandlers = {}) {
  const { mergedUserInputs, patchDesignTarget } = useDesignWorkflow();
  const presetId = mergedUserInputs.applicationPresetId;

  useEffect(() => {
    if (!presetId) return;
    const defaults = getPlainBearingPresetDefaults(presetId);
    if (!defaults) return;

    if (defaults.targetSafetyFactor != null) {
      handlers.setSafetyFactor?.(defaults.targetSafetyFactor);
      patchDesignTarget("targetSafetyFactor", defaults.targetSafetyFactor);
    }
    if (defaults.serviceFactor != null) {
      handlers.setServiceFactor?.(defaults.serviceFactor);
      patchDesignTarget("serviceFactor", defaults.serviceFactor);
    }
    if (defaults.loadFactor != null) {
      patchDesignTarget("loadFactor", defaults.loadFactor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on preset id only
  }, [presetId]);
}

type HousingSyncHandlers = {
  setSafetyFactor?: (v: number) => void;
  setServiceFactor?: (v: number) => void;
};

/**
 * Apply housing calculation knobs only — never forces mount style.
 */
export function useHousingPresetSync(handlers: HousingSyncHandlers = {}) {
  const { mergedUserInputs, patchDesignTarget } = useDesignWorkflow();
  const presetId = mergedUserInputs.applicationPresetId;

  useEffect(() => {
    if (!presetId) return;
    const defaults = getHousingPresetDefaults(presetId);
    if (!defaults) return;

    if (defaults.targetSafetyFactor != null) {
      handlers.setSafetyFactor?.(defaults.targetSafetyFactor);
      patchDesignTarget("targetSafetyFactor", defaults.targetSafetyFactor);
    }
    if (defaults.serviceFactor != null) {
      handlers.setServiceFactor?.(defaults.serviceFactor);
      patchDesignTarget("serviceFactor", defaults.serviceFactor);
    }
    if (defaults.loadFactor != null) {
      patchDesignTarget("loadFactor", defaults.loadFactor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on preset id only
  }, [presetId]);
}
