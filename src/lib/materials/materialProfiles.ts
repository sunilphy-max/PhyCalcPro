import {
  materials,
  type Material,
  type MaterialCategory,
  CUSTOM_MATERIAL,
} from "@/data/materials";

export type MaterialProfile =
  | "structural"
  | "machine-shaft"
  | "machine-gear"
  | "weld-base"
  | "weld-filler"
  | "rivet"
  | "bolt"
  | "dynamics"
  | "plate-shell"
  | "pressure"
  | "fatigue-handoff";

export type MaterialProfileField =
  | "E"
  | "G"
  | "yieldStress"
  | "ultimateStrength"
  | "density"
  | "poisson"
  | "enduranceLimit"
  | "hardnessHB"
  | "weldAllowableShear"
  | "weldElectrodeStrength"
  | "shearStrength"
  | "bearingStrength"
  | "thermalExpansion";

type ProfileConfig = {
  categories: MaterialCategory[];
  fields: MaterialProfileField[];
  allowCustom: boolean;
  defaultMaterialId: string;
};

const METAL_CATEGORIES: MaterialCategory[] = [
  "structural-steel",
  "alloy-steel",
  "gear-steel",
  "stainless-steel",
  "cast-iron",
  "aluminum",
  "titanium",
  "copper-alloy",
];

export const MATERIAL_PROFILES: Record<MaterialProfile, ProfileConfig> = {
  structural: {
    categories: [...METAL_CATEGORIES],
    fields: ["E", "yieldStress", "ultimateStrength", "poisson"],
    allowCustom: true,
    defaultMaterialId: "s275jr",
  },
  "machine-shaft": {
    categories: ["alloy-steel", "structural-steel", "stainless-steel", "aluminum", "titanium"],
    fields: ["E", "G", "density", "yieldStress", "ultimateStrength", "enduranceLimit"],
    allowCustom: true,
    defaultMaterialId: "42crmo4-4140",
  },
  "machine-gear": {
    categories: ["gear-steel", "alloy-steel", "structural-steel", "cast-iron", "aluminum", "copper-alloy"],
    fields: ["E", "yieldStress", "poisson", "hardnessHB", "ultimateStrength"],
    allowCustom: true,
    defaultMaterialId: "c45-1045-n",
  },
  "weld-base": {
    categories: ["structural-steel", "alloy-steel", "stainless-steel", "aluminum"],
    fields: ["yieldStress", "weldElectrodeStrength", "weldAllowableShear"],
    allowCustom: false,
    defaultMaterialId: "s275jr",
  },
  "weld-filler": {
    categories: ["weld-filler"],
    fields: ["weldElectrodeStrength", "weldAllowableShear", "ultimateStrength"],
    allowCustom: false,
    defaultMaterialId: "weld-e7018",
  },
  rivet: {
    categories: ["structural-steel", "alloy-steel", "aluminum", "copper-alloy"],
    fields: ["yieldStress", "shearStrength", "bearingStrength", "ultimateStrength"],
    allowCustom: true,
    defaultMaterialId: "s275jr",
  },
  bolt: {
    categories: ["bolt-class"],
    fields: ["E", "yieldStress", "ultimateStrength"],
    allowCustom: false,
    defaultMaterialId: "bolt-8-8",
  },
  dynamics: {
    categories: ["structural-steel", "alloy-steel", "aluminum", "titanium", "polymer"],
    fields: ["E", "density"],
    allowCustom: true,
    defaultMaterialId: "s275jr",
  },
  "plate-shell": {
    categories: ["structural-steel", "alloy-steel", "stainless-steel", "aluminum"],
    fields: ["E", "poisson"],
    allowCustom: true,
    defaultMaterialId: "s275jr",
  },
  pressure: {
    categories: ["structural-steel", "stainless-steel", "alloy-steel"],
    fields: ["yieldStress", "ultimateStrength"],
    allowCustom: true,
    defaultMaterialId: "s275jr",
  },
  "fatigue-handoff": {
    categories: METAL_CATEGORIES,
    fields: ["ultimateStrength", "enduranceLimit"],
    allowCustom: true,
    defaultMaterialId: "42crmo4-4140",
  },
};

export function getMaterialsForProfile(profile: MaterialProfile): Material[] {
  const { categories } = MATERIAL_PROFILES[profile];
  return materials.filter((m) => categories.includes(m.category));
}

export function getDefaultMaterialForProfile(profile: MaterialProfile): Material {
  const { defaultMaterialId } = MATERIAL_PROFILES[profile];
  const found = materials.find((m) => m.id === defaultMaterialId);
  if (!found) {
    return getMaterialsForProfile(profile)[0]!;
  }
  return found;
}

export function getDefaultMaterialNameForProfile(profile: MaterialProfile): string {
  return getDefaultMaterialForProfile(profile).name;
}

export function profileAllowsCustom(profile: MaterialProfile): boolean {
  return MATERIAL_PROFILES[profile].allowCustom;
}

export function isCustomMaterial(name: string): boolean {
  return name === CUSTOM_MATERIAL;
}

/** US design codes prefer ASTM A36; EU/ISO prefer S275JR */
export function getDefaultMaterialNameForDesignCode(
  profile: MaterialProfile,
  designCode?: string
): string {
  if (profile === "structural" || profile === "plate-shell" || profile === "pressure") {
    if (designCode === "US") {
      const us = materials.find((m) => m.id === "astm-a36");
      if (us && getMaterialsForProfile(profile).some((m) => m.id === us.id)) {
        return us.name;
      }
    }
  }
  return getDefaultMaterialNameForProfile(profile);
}
