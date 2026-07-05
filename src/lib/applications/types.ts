import type { DesignCodeId } from "@/lib/standards/types";

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
