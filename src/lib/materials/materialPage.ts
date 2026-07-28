import {
  findMaterialById,
  materials,
  shearModulus,
  type Material,
  type MaterialCategory,
  type MaterialCorrosionClass,
  type MaterialCostBand,
} from "@/data/materials";
import {
  getMaterialDatasheet,
  hasMaterialDatasheet,
  type CompositionEntry,
  type CorrosionEnvironment,
  type MaterialDatasheet,
  type MaterialDatasheetElectrical,
  type MaterialStandardRef,
} from "@/data/materialDatasheets";

export type MaterialPageSectionId =
  | "overview"
  | "mechanical"
  | "thermal"
  | "physical"
  | "applications"
  | "advantages"
  | "limitations"
  | "standards"
  | "equivalents"
  | "electrical"
  | "composition"
  | "machinability"
  | "cost"
  | "corrosion";

export const MATERIAL_PAGE_SECTIONS: Array<{ id: MaterialPageSectionId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "mechanical", label: "Mechanical Properties" },
  { id: "thermal", label: "Thermal Properties" },
  { id: "physical", label: "Physical Properties" },
  { id: "applications", label: "Applications" },
  { id: "advantages", label: "Advantages" },
  { id: "limitations", label: "Limitations" },
  { id: "standards", label: "Standards" },
  { id: "equivalents", label: "Equivalent Materials" },
  { id: "electrical", label: "Electrical Properties" },
  { id: "composition", label: "Chemical Composition" },
  { id: "machinability", label: "Machinability" },
  { id: "cost", label: "Cost" },
  { id: "corrosion", label: "Corrosion" },
];

export type MaterialPageAlternative = {
  id: string;
  name: string;
  category: MaterialCategory;
  yieldStress: number;
  hasDatasheet: boolean;
};

export type MaterialPageModel = {
  material: Material;
  hasDatasheet: boolean;
  summary?: string;
  aliases: string[];
  formSupply?: string;
  physicalNotes?: string;
  electrical?: MaterialDatasheetElectrical & {
    resistivity?: number;
  };
  composition: CompositionEntry[];
  applications: string[];
  advantages: string[];
  limitations: string[];
  standards: MaterialStandardRef[];
  machinabilityNotes?: string;
  machinabilityIndex?: number;
  costBand?: MaterialCostBand;
  costNotes?: string;
  corrosionClass?: MaterialCorrosionClass;
  corrosionNotes?: string;
  environments: CorrosionEnvironment[];
  alternatives: MaterialPageAlternative[];
  shearModulusPa: number;
  sectionAvailability: Record<MaterialPageSectionId, boolean>;
};

function resolveStandards(material: Material, sheet?: MaterialDatasheet): MaterialStandardRef[] {
  if (sheet?.standards?.length) return sheet.standards;
  if (material.standard) return [{ code: material.standard }];
  return [];
}

function resolveElectrical(
  material: Material,
  sheet?: MaterialDatasheet
): MaterialPageModel["electrical"] | undefined {
  const resistivity = sheet?.electrical?.resistivity ?? material.electricalResistivity;
  const conductivityIacsPct = sheet?.electrical?.conductivityIacsPct;
  const notes = sheet?.electrical?.notes;
  if (resistivity == null && conductivityIacsPct == null && !notes) return undefined;
  return { resistivity, conductivityIacsPct, notes };
}

function sectionAvailability(model: Omit<MaterialPageModel, "sectionAvailability">): Record<
  MaterialPageSectionId,
  boolean
> {
  const thermalPublished =
    materialHasThermal(model.material) ||
    model.material.specificHeat != null ||
    model.material.meltingPoint != null;
  return {
    overview: Boolean(model.summary || model.aliases.length || model.formSupply),
    mechanical: true,
    thermal: thermalPublished,
    physical: true,
    applications: model.applications.length > 0,
    advantages: model.advantages.length > 0,
    limitations: model.limitations.length > 0,
    standards: model.standards.length > 0,
    equivalents: model.alternatives.length > 0,
    electrical: Boolean(model.electrical),
    composition: model.composition.length > 0,
    machinability: model.machinabilityIndex != null || Boolean(model.machinabilityNotes),
    cost: Boolean(model.costBand) || Boolean(model.costNotes),
    corrosion:
      Boolean(model.corrosionClass) ||
      Boolean(model.corrosionNotes) ||
      model.environments.length > 0,
  };
}

function materialHasThermal(material: Material): boolean {
  return material.thermalExpansion != null || material.thermalConductivity != null;
}

export function getMaterialPage(id: string): MaterialPageModel | undefined {
  const material = findMaterialById(id);
  if (!material) return undefined;

  const sheet = getMaterialDatasheet(id);
  const alternatives: MaterialPageAlternative[] = (sheet?.alternativeIds ?? [])
    .map((altId) => {
      const alt = findMaterialById(altId);
      if (!alt) return null;
      return {
        id: alt.id,
        name: alt.name,
        category: alt.category,
        yieldStress: alt.yieldStress,
        hasDatasheet: hasMaterialDatasheet(alt.id),
      };
    })
    .filter((x): x is MaterialPageAlternative => x != null);

  const base: Omit<MaterialPageModel, "sectionAvailability"> = {
    material,
    hasDatasheet: Boolean(sheet),
    summary: sheet?.summary,
    aliases: sheet?.aliases ?? [],
    formSupply: sheet?.formSupply,
    physicalNotes: sheet?.physicalNotes,
    electrical: resolveElectrical(material, sheet),
    composition: sheet?.composition ?? [],
    applications: sheet?.applications ?? [],
    advantages: sheet?.advantages ?? [],
    limitations: sheet?.limitations ?? [],
    standards: resolveStandards(material, sheet),
    machinabilityNotes: sheet?.machinabilityNotes,
    machinabilityIndex: material.machinabilityIndex,
    costBand: material.costBand,
    costNotes: sheet?.costNotes,
    corrosionClass: material.corrosionClass,
    corrosionNotes: sheet?.corrosionNotes,
    environments: sheet?.environments ?? [],
    alternatives,
    shearModulusPa: shearModulus(material),
  };

  return {
    ...base,
    sectionAvailability: sectionAvailability(base),
  };
}

export function listMaterialPages(): MaterialPageModel[] {
  return materials
    .map((m) => getMaterialPage(m.id))
    .filter((p): p is MaterialPageModel => p != null);
}

export function listMaterialIds(): string[] {
  return materials.map((m) => m.id);
}

export function materialDatasheetHref(id: string): string {
  return `/products/materials/database/${encodeURIComponent(id)}`;
}

export function materialCompareHref(ids: string[]): string {
  const clean = ids.map((id) => id.trim()).filter(Boolean).slice(0, 4);
  return `/products/materials/database/compare?ids=${clean.map(encodeURIComponent).join(",")}`;
}
