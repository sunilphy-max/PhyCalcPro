import { materials } from "@/data/materials";

export type MaterialCatalogEntry = {
  name: string;
  E: number;
  yieldStress: number;
  ultimateStrength: number;
  density: number;
  poisson?: number;
};

export function getMaterialCatalog(): MaterialCatalogEntry[] {
  return materials.map((item) => ({
    name: item.name,
    E: item.E,
    yieldStress: item.yieldStress ?? 250e6,
    ultimateStrength: (item as { ultimateStrength?: number }).ultimateStrength ?? (item.yieldStress ?? 250e6) * 1.6,
    density: (item as { density?: number }).density ?? 7850,
    poisson: (item as { poisson?: number }).poisson,
  }));
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
