/**
 * Complete material encyclopedia datasheets (all catalog grades).
 * Hand-authored flagships merge over category templates; every material gets
 * summary, applications, advantages, limitations, physical notes, and equivalents.
 */

import { materials, type Material } from "@/data/materials";
import { materialDatasheetsHandAuthored } from "@/data/materialDatasheetsHandAuthored";
import { buildDatasheetFromTemplate } from "@/data/materialDatasheetTemplates";
import type { MaterialDatasheet } from "@/data/materialDatasheetTypes";

export type {
  CompositionEntry,
  CorrosionEnvironment,
  MaterialDatasheet,
  MaterialDatasheetElectrical,
  MaterialStandardRef,
} from "@/data/materialDatasheetTypes";

const EQUIVALENT_COUNT = 4;

function nearestEquivalents(material: Material): string[] {
  return materials
    .filter((m) => m.category === material.category && m.id !== material.id)
    .map((m) => ({
      id: m.id,
      delta: Math.abs(m.yieldStress - material.yieldStress),
    }))
    .sort((a, b) => a.delta - b.delta)
    .slice(0, EQUIVALENT_COUNT)
    .map((m) => m.id);
}

function mergeDatasheet(base: MaterialDatasheet, override: MaterialDatasheet): MaterialDatasheet {
  return {
    summary: override.summary || base.summary,
    aliases: override.aliases ?? base.aliases,
    formSupply: override.formSupply ?? base.formSupply,
    electrical: override.electrical ?? base.electrical,
    composition: override.composition ?? base.composition,
    applications:
      override.applications && override.applications.length > 0
        ? override.applications
        : base.applications,
    advantages:
      override.advantages && override.advantages.length > 0
        ? override.advantages
        : base.advantages,
    limitations:
      override.limitations && override.limitations.length > 0
        ? override.limitations
        : base.limitations,
    physicalNotes: override.physicalNotes ?? base.physicalNotes,
    standards:
      override.standards && override.standards.length > 0 ? override.standards : base.standards,
    machinabilityNotes: override.machinabilityNotes ?? base.machinabilityNotes,
    costNotes: override.costNotes ?? base.costNotes,
    corrosionNotes: override.corrosionNotes ?? base.corrosionNotes,
    environments:
      override.environments && override.environments.length > 0
        ? override.environments
        : base.environments,
    alternativeIds:
      override.alternativeIds && override.alternativeIds.length > 0
        ? override.alternativeIds
        : base.alternativeIds,
  };
}

function buildSheetForMaterial(material: Material): MaterialDatasheet {
  const templated = buildDatasheetFromTemplate(material.category, material.name, material.standard, {
    alternativeIds: nearestEquivalents(material),
  });
  const hand = materialDatasheetsHandAuthored[material.id];
  if (!hand) return templated;
  return mergeDatasheet(templated, hand);
}

function buildAllDatasheets(): Record<string, MaterialDatasheet> {
  const out: Record<string, MaterialDatasheet> = {};
  for (const material of materials) {
    out[material.id] = buildSheetForMaterial(material);
  }
  return out;
}

export const materialDatasheets: Record<string, MaterialDatasheet> = buildAllDatasheets();

export function getMaterialDatasheet(id: string): MaterialDatasheet | undefined {
  return materialDatasheets[id];
}

export function hasMaterialDatasheet(id: string): boolean {
  return id in materialDatasheets;
}

export function listDatasheetIds(): string[] {
  return Object.keys(materialDatasheets);
}
