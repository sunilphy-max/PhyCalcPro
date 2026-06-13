import { materials, type Material, type MaterialCategory } from "@/data/materials";

export type MaterialCatalogEntry = {
  name: string;
  category: MaterialCategory;
  standard?: string;
  E: number;
  yieldStress: number;
  ultimateStrength: number;
  density: number;
  poisson?: number;
  enduranceLimit?: number;
  hardnessHB?: number;
};

function toEntry(item: Material): MaterialCatalogEntry {
  return {
    name: item.name,
    category: item.category,
    standard: item.standard,
    E: item.E,
    yieldStress: item.yieldStress,
    ultimateStrength: item.ultimateStrength,
    density: item.density,
    poisson: item.poisson,
    enduranceLimit: item.enduranceLimit,
    hardnessHB: item.hardnessHB,
  };
}

export function getMaterialCatalog(): MaterialCatalogEntry[] {
  return materials.map(toEntry);
}

export function findMaterialByName(name?: string): MaterialCatalogEntry | undefined {
  if (!name) return getMaterialCatalog()[0];
  return getMaterialCatalog().find((item) => item.name === name);
}

export function rankMaterialsByStrength(requiredAllowablePa: number, limit = 8): MaterialCatalogEntry[] {
  return getMaterialCatalog()
    .map((item) => ({
      item,
      utilization: requiredAllowablePa / Math.max(item.yieldStress, 1e6),
    }))
    .sort((a, b) => a.utilization - b.utilization)
    .slice(0, limit)
    .map(({ item }) => item);
}
