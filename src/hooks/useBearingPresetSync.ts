"use client";

import { useEffect } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { getModuleApplicationPreset } from "@/lib/applications";
import {
  getBearingPresetDefaults,
  getPlainBearingPresetDefaults,
} from "@/lib/applications/bearingPresets";
import {
  bearingCatalog,
  filterCatalog,
  equivalentDesignation,
} from "@/data/catalogs/bearingCatalog";
import type {
  BearingApplicationProfile,
  BearingManufacturer,
  CatalogBearingType,
} from "@/data/catalogs/bearingCatalog";
import type { BearingReliability, LubricationClass } from "@/lib/machine/bearings/types";

type RollingSyncHandlers = {
  setApplicationProfile: (v: BearingApplicationProfile | "all") => void;
  setBearingType: (v: CatalogBearingType) => void;
  setManufacturer: (v: BearingManufacturer) => void;
  setReliability: (v: BearingReliability) => void;
  setLubricationClass: (v: LubricationClass | "") => void;
  setSafetyFactor: (v: number) => void;
  setDesignation: (v: string) => void;
  designation: string;
};

/** Apply rolling-bearing catalog defaults when the application preset changes. */
export function useRollingBearingPresetSync(handlers: RollingSyncHandlers) {
  const { userInputs } = useDesignWorkflow();
  const presetId = userInputs.applicationPresetId;

  useEffect(() => {
    if (!presetId) return;
    const defaults = getBearingPresetDefaults(presetId);
    if (!defaults) return;

    const preset = getModuleApplicationPreset("bearings", presetId);
    handlers.setApplicationProfile(defaults.catalogProfile);
    if (defaults.bearingType) handlers.setBearingType(defaults.bearingType);
    if (defaults.manufacturer) handlers.setManufacturer(defaults.manufacturer);
    if (defaults.reliability) handlers.setReliability(defaults.reliability);
    if (defaults.lubricationClass !== undefined) {
      handlers.setLubricationClass(defaults.lubricationClass);
    }
    if (preset.knobs.targetSafetyFactor != null) {
      handlers.setSafetyFactor(preset.knobs.targetSafetyFactor);
    }

    const mfr = defaults.manufacturer ?? "SKF";
    const type = defaults.bearingType ?? "deep_groove";
    const mapped = equivalentDesignation(handlers.designation, mfr);
    const pool = filterCatalog(bearingCatalog, {
      manufacturer: mfr,
      type,
      applicationProfile: defaults.catalogProfile,
    });
    const next = mapped && pool.some((b) => b.designation === mapped) ? mapped : pool[0]?.designation;
    if (next) handlers.setDesignation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on preset id only
  }, [presetId]);
}

type PlainSyncHandlers = {
  setBearingType: (v: "journal" | "thrust_pad" | "tilting_pad") => void;
};

export function usePlainBearingPresetSync(handlers: PlainSyncHandlers) {
  const { userInputs } = useDesignWorkflow();
  const presetId = userInputs.applicationPresetId;

  useEffect(() => {
    if (!presetId) return;
    const defaults = getPlainBearingPresetDefaults(presetId);
    if (defaults?.bearingType) handlers.setBearingType(defaults.bearingType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId]);
}
