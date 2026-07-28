/**
 * Encyclopedia enrichment types for graded materials.
 * Narrative / structured datasheet fields only — SI mechanical properties stay in materials.ts.
 */

export type CompositionEntry = {
  element: string;
  min?: number;
  max?: number;
  typical?: number;
};

export type MaterialStandardRef = {
  code: string;
  title?: string;
};

export type CorrosionEnvironment = {
  name: string;
  rating: "poor" | "fair" | "good" | "excellent";
  notes?: string;
};

export type MaterialDatasheetElectrical = {
  /** Resistivity (Ω·m) — may mirror Material.electricalResistivity */
  resistivity?: number;
  /** % IACS conductivity when published */
  conductivityIacsPct?: number;
  notes?: string;
};

export type MaterialDatasheet = {
  summary: string;
  aliases?: string[];
  formSupply?: string;
  electrical?: MaterialDatasheetElectrical;
  composition?: CompositionEntry[];
  applications?: string[];
  advantages?: string[];
  limitations?: string[];
  physicalNotes?: string;
  standards?: MaterialStandardRef[];
  machinabilityNotes?: string;
  costNotes?: string;
  corrosionNotes?: string;
  environments?: CorrosionEnvironment[];
  /** Catalog material ids — Equivalent Materials */
  alternativeIds?: string[];
};
