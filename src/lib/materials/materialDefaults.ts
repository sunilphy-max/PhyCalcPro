import { findMaterial, findMaterialById, shearModulus } from "@/data/materials";
import { getDefaultMaterialForProfile, type MaterialProfile } from "@/lib/materials/materialProfiles";

export const DEFAULT_STRUCTURAL = findMaterialById("s275jr") ?? findMaterial("S275JR")!;
export const DEFAULT_STRUCTURAL_US = findMaterialById("astm-a36") ?? findMaterial("ASTM A36")!;
export const DEFAULT_MACHINE_SHAFT = findMaterialById("42crmo4-4140") ?? findMaterial("42CrMo4 (4140) Q&T")!;
export const DEFAULT_MACHINE_GEAR = findMaterialById("c45-1045-n") ?? findMaterial("C45 (1045) normalized")!;
export const DEFAULT_ALUMINUM = findMaterialById("al-6061") ?? findMaterial("AW-6061 T6")!;
export const DEFAULT_BOLT = findMaterialById("bolt-8-8") ?? findMaterial("Bolt class 8.8")!;
export const DEFAULT_WELD_FILLER = findMaterialById("weld-e7018") ?? findMaterial("E7018 (AWS A5.1)")!;

/** Legacy steel defaults used across solvers — sourced from catalog */
export const STEEL_E = DEFAULT_STRUCTURAL.E;
export const STEEL_YIELD = DEFAULT_STRUCTURAL.yieldStress;
export const STEEL_DENSITY = DEFAULT_STRUCTURAL.density;
export const STEEL_POISSON = DEFAULT_STRUCTURAL.poisson;
export const STEEL_G = shearModulus(DEFAULT_STRUCTURAL);
/** Typical design allowable for pressure modules (≈55% of yield) */
export const PRESSURE_ALLOWABLE = STEEL_YIELD * 0.55;

export function getProfileDefaults(profile: MaterialProfile) {
  const m = getDefaultMaterialForProfile(profile);
  return {
    materialName: m.name,
    E: m.E,
    G: shearModulus(m),
    yieldStress: m.yieldStress,
    ultimateStrength: m.ultimateStrength,
    density: m.density,
    poisson: m.poisson,
    enduranceLimit: m.enduranceLimit,
    hardnessHB: m.hardnessHB,
    weldElectrodeStrength: m.weldElectrodeStrength ?? m.ultimateStrength,
    weldAllowableShear: m.weldAllowableShear ?? 0.6 * (m.weldElectrodeStrength ?? m.ultimateStrength),
    shearStrength: m.shearStrength ?? 0.6 * m.ultimateStrength,
    bearingStrength: m.bearingStrength ?? 2 * m.yieldStress,
    thermalExpansion: m.thermalExpansion,
  };
}
