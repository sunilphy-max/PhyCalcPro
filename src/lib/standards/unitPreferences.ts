import type { DesignCodeId } from "./types";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import { getDesignCodeOption } from "./designCodes";
import { unitFactors } from "@/lib/physics/units";
import type { PhysicsDimension } from "@/lib/physics/units";

export type ModuleUnitDefaults = Record<string, string>;

const regionUnitDefaults: Record<DesignCodeId, ModuleUnitDefaults> = {
  INDICATIVE: {
    length: "m",
    force: "N",
    stress: "MPa",
    pressure: "MPa",
    moment: "N·m",
    torque: "N·m",
    power: "kW",
    density: "kg/m3",
    area: "m2",
    inertia: "m4",
    udl: "N/m",
    diameter: "mm",
    module: "mm",
    thickness: "mm",
    velocity: "m/s",
    mass: "kg",
    energy: "J",
    flow: "m3/s",
    speed: "rpm",
  },
  US: {
    length: "in",
    force: "lbf",
    stress: "ksi",
    pressure: "psi",
    moment: "lbf·ft",
    torque: "lbf·ft",
    power: "hp",
    density: "lb/ft3",
    area: "in2",
    inertia: "in4",
    udl: "lbf/ft",
    diameter: "in",
    module: "in",
    thickness: "in",
    velocity: "ft/s",
    mass: "lb",
    energy: "ft·lbf",
    flow: "gpm",
    speed: "rpm",
  },
  EU: {
    length: "mm",
    force: "N",
    stress: "MPa",
    pressure: "bar",
    moment: "N·m",
    torque: "N·m",
    power: "kW",
    density: "kg/m3",
    area: "mm2",
    inertia: "mm4",
    udl: "N/m",
    diameter: "mm",
    module: "mm",
    thickness: "mm",
    velocity: "m/s",
    mass: "kg",
    energy: "J",
    flow: "L/min",
    speed: "rpm",
  },
  ISO: {
    length: "m",
    force: "N",
    stress: "MPa",
    pressure: "MPa",
    moment: "N·m",
    torque: "N·m",
    power: "kW",
    density: "kg/m3",
    area: "m2",
    inertia: "m4",
    udl: "N/m",
    diameter: "mm",
    module: "mm",
    thickness: "mm",
    velocity: "m/s",
    mass: "kg",
    energy: "J",
    flow: "m3/s",
    speed: "rpm",
  },
};

export function getRegionUnitDefaults(designCode: DesignCodeId): ModuleUnitDefaults {
  return regionUnitDefaults[designCode] ?? regionUnitDefaults.INDICATIVE;
}

/** Resolve display/solver units for a module field when the user changes design code. */
export function resolveFieldUnit(
  moduleId: string,
  fieldKey: string,
  designCode: DesignCodeId
): string | undefined {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  const regionDefaults = getRegionUnitDefaults(designCode);
  const preferred = regionDefaults[fieldKey];
  const unitSystem = getDesignCodeOption(designCode).unitSystem;

  if (profile) {
    const dim = profile.dimension as PhysicsDimension;
    const isValid = (u: string) => u in (unitFactors[dim] ?? {});

    if (preferred && isValid(preferred)) return preferred;

    if (unitSystem === "US") {
      const usCandidates = ["in", "lbf", "psi", "ksi", "lbf·ft", "hp", "lb/ft3", "in2", "in4", "lbf/ft", "gpm"];
      const usPick = usCandidates.find(isValid);
      if (usPick) return usPick;
    }
    return profile.defaultUnit;
  }

  return preferred;
}

export function buildModuleUnitMap(
  moduleId: string,
  fieldKeys: string[],
  designCode: DesignCodeId
): ModuleUnitDefaults {
  const map: ModuleUnitDefaults = {};
  for (const key of fieldKeys) {
    const unit = resolveFieldUnit(moduleId, key, designCode);
    if (unit) map[key] = unit;
  }
  return map;
}
