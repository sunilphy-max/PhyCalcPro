import type { DesignCodeId } from "@/lib/standards/types";

/**
 * Application presets define calculation standards and screening knobs only.
 * They must NOT force product geometry, catalog designation, section, mount style,
 * belt profile, bolt size, or bearing family — those stay user-selected.
 */
export type ApplicationPresetKnobs = {
  loadFactor?: number;
  allowableStressRatio?: number;
  deflectionLimitRatio?: number;
  targetSafetyFactor?: number;
  serviceFactor?: number;
};

export type ModuleApplicationPreset = {
  id: string;
  label: string;
  description: string;
  /** Design standards this preset aligns with; empty = all standards. */
  designCodes: DesignCodeId[];
  standards: string[];
  fatigueSensitive?: boolean;
  calculationNotes?: string[];
  limitations?: string[];
  knobs: ApplicationPresetKnobs;
};

export const ALL_DESIGN_CODES: DesignCodeId[] = ["INDICATIVE", "US", "EU", "ISO"];
