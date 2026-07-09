import {
  materials,
  findMaterial,
  findMaterialById,
  shearModulus,
  CUSTOM_MATERIAL,
  type Material,
  type MaterialCategory,
} from "@/data/materials";
import {
  getDefaultMaterialForProfile,
  getMaterialsForProfile,
  type MaterialProfile,
} from "@/lib/materials/materialProfiles";

export type MaterialCatalogEntry = {
  id: string;
  name: string;
  category: MaterialCategory;
  standard?: string;
  E: number;
  yieldStress: number;
  ultimateStrength: number;
  density: number;
  poisson?: number;
  G?: number;
  enduranceLimit?: number;
  hardnessHB?: number;
  weldAllowableShear?: number;
  weldElectrodeStrength?: number;
  shearStrength?: number;
  bearingStrength?: number;
  thermalExpansion?: number;
};

export type ResolvedMaterialProps = MaterialCatalogEntry & {
  isCustom: boolean;
};

function toEntry(item: Material): MaterialCatalogEntry {
  const G = shearModulus(item);
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    standard: item.standard,
    E: item.E,
    yieldStress: item.yieldStress,
    ultimateStrength: item.ultimateStrength,
    density: item.density,
    poisson: item.poisson,
    G,
    enduranceLimit: item.enduranceLimit,
    hardnessHB: item.hardnessHB,
    weldAllowableShear: item.weldAllowableShear ?? 0.6 * (item.weldElectrodeStrength ?? item.ultimateStrength),
    weldElectrodeStrength: item.weldElectrodeStrength ?? item.ultimateStrength,
    shearStrength: item.shearStrength ?? 0.6 * item.ultimateStrength,
    bearingStrength: item.bearingStrength ?? 2 * item.yieldStress,
    thermalExpansion: item.thermalExpansion,
  };
}

export function getMaterialCatalog(): MaterialCatalogEntry[] {
  return materials.map(toEntry);
}

export function findMaterialByName(name?: string): MaterialCatalogEntry | undefined {
  if (!name || name === CUSTOM_MATERIAL) return undefined;
  const item = findMaterial(name);
  return item ? toEntry(item) : undefined;
}

export function findMaterialEntryById(id: string): MaterialCatalogEntry | undefined {
  const item = findMaterialById(id);
  return item ? toEntry(item) : undefined;
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

export function shearModulusFromEntry(entry: Pick<MaterialCatalogEntry, "E" | "G" | "poisson">): number {
  if (entry.G != null) return entry.G;
  const nu = entry.poisson ?? 0.3;
  return entry.E / (2 * (1 + nu));
}

export function getMaterialDefaults(profile: MaterialProfile): ResolvedMaterialProps {
  const item = getDefaultMaterialForProfile(profile);
  return { ...toEntry(item), isCustom: false };
}

export type CustomMaterialOverrides = Partial<
  Pick<
    ResolvedMaterialProps,
    | "E"
    | "G"
    | "yieldStress"
    | "ultimateStrength"
    | "density"
    | "poisson"
    | "enduranceLimit"
    | "hardnessHB"
    | "weldElectrodeStrength"
    | "weldAllowableShear"
    | "shearStrength"
    | "bearingStrength"
    | "thermalExpansion"
  >
>;

export function resolveMaterial(
  name: string,
  profile: MaterialProfile,
  customOverrides?: CustomMaterialOverrides
): ResolvedMaterialProps {
  if (name === CUSTOM_MATERIAL) {
    const defaults = getMaterialDefaults(profile);
    return {
      ...defaults,
      ...customOverrides,
      name: CUSTOM_MATERIAL,
      isCustom: true,
    };
  }

  const item = findMaterial(name);
  if (!item) {
    const fallback = getDefaultMaterialForProfile(profile);
    return { ...toEntry(fallback), isCustom: false };
  }

  return { ...toEntry(item), isCustom: false };
}

export function getMaterialsForProfileEntries(profile: MaterialProfile): MaterialCatalogEntry[] {
  return getMaterialsForProfile(profile).map(toEntry);
}

/** Weld solver expects { name, strength, yieldStress } */
export function toWeldMaterial(resolved: ResolvedMaterialProps) {
  return {
    name: resolved.name,
    strength: resolved.weldElectrodeStrength ?? resolved.ultimateStrength,
    yieldStress: resolved.yieldStress,
  };
}

/** Rivet solver expects { name, yieldStress, shearStrength, bearingStrength } */
export function toRivetMaterial(resolved: ResolvedMaterialProps) {
  return {
    name: resolved.name,
    yieldStress: resolved.yieldStress,
    shearStrength: resolved.shearStrength ?? 0.6 * resolved.ultimateStrength,
    bearingStrength: resolved.bearingStrength ?? 2 * resolved.yieldStress,
  };
}

/** Shaft solver material shape */
export function toShaftMaterial(resolved: ResolvedMaterialProps) {
  return {
    name: resolved.name,
    E: resolved.E,
    G: resolved.G ?? shearModulusFromEntry(resolved),
    density: resolved.density,
    yieldStress: resolved.yieldStress,
    ultimateStrength: resolved.ultimateStrength,
  };
}

/** Gear solver material shape */
export function toGearMaterial(resolved: ResolvedMaterialProps) {
  return {
    name: resolved.name,
    E: resolved.E,
    yieldStress: resolved.yieldStress,
    poisson: resolved.poisson ?? 0.3,
  };
}

/** Returns field updates when user picks a catalog grade */
export function getMaterialFieldUpdates(
  name: string,
  profile: MaterialProfile,
  customOverrides?: CustomMaterialOverrides
) {
  const r = resolveMaterial(name, profile, customOverrides);
  return {
    materialName: r.name,
    E: r.E,
    G: r.G ?? shearModulusFromEntry(r),
    yieldStress: r.yieldStress,
    ultimateStrength: r.ultimateStrength,
    density: r.density,
    poisson: r.poisson ?? 0.3,
    enduranceLimit: r.enduranceLimit,
    hardnessHB: r.hardnessHB,
    weldElectrodeStrength: r.weldElectrodeStrength,
    weldAllowableShear: r.weldAllowableShear,
    shearStrength: r.shearStrength,
    bearingStrength: r.bearingStrength,
    thermalExpansion: r.thermalExpansion,
  };
}
