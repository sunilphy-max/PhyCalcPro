import type { PhysicsDimension } from "@/lib/physics/units";
import { fromBase, toBase } from "@/lib/units/conversions";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import type { DesignInputFieldDef } from "@/lib/design-workflows/designInputFieldRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

/** Maps design-target dimensions to `ModuleUserInputs` unit keys. */
export const DESIGN_TARGET_UNIT_KEYS: Partial<
  Record<NonNullable<DesignInputFieldDef["dimension"]>, keyof ModuleUserInputs>
> = {
  length: "lengthUnit",
  stress: "stressUnit",
  force: "forceUnit",
  torque: "torqueUnit",
  moment: "momentUnit",
  pressure: "pressureUnit",
  power: "powerUnit",
  frequency: "frequencyUnit",
  time: "timeUnit",
  temperature: "temperatureUnit",
  energy: "energyUnit",
  mass: "massUnit",
  velocity: "velocityUnit",
};

const DEFAULT_FIELD_KEY: Partial<Record<NonNullable<DesignInputFieldDef["dimension"]>, string>> = {
  length: "length",
  stress: "stress",
  force: "force",
  torque: "torque",
  moment: "moment",
  pressure: "pressure",
  power: "power",
  frequency: "speed",
  time: "life",
  temperature: "temperature",
  energy: "energy",
  mass: "mass",
  velocity: "velocity",
};

const DEFAULT_UNIT: Partial<Record<NonNullable<DesignInputFieldDef["dimension"]>, string>> = {
  length: "mm",
  stress: "MPa",
  force: "N",
  torque: "N·m",
  moment: "N·m",
  pressure: "MPa",
  power: "kW",
  frequency: "rpm",
  time: "hr",
  temperature: "C",
  energy: "J",
  mass: "kg",
  velocity: "m/s",
};

export function getDesignTargetUnitKey(
  dimension: NonNullable<DesignInputFieldDef["dimension"]>
): keyof ModuleUserInputs | undefined {
  return DESIGN_TARGET_UNIT_KEYS[dimension];
}

export function resolveDesignTargetUnit(
  field: DesignInputFieldDef,
  moduleId: string,
  inputs: ModuleUserInputs
): string {
  if (!field.dimension) return field.unitLabel ?? "—";
  const unitKey = DESIGN_TARGET_UNIT_KEYS[field.dimension];
  const fromInputs = unitKey ? (inputs[unitKey] as string | undefined) : undefined;
  if (fromInputs) return fromInputs;

  const profile = getModuleFieldProfile(
    moduleId,
    field.fieldKey ?? DEFAULT_FIELD_KEY[field.dimension] ?? field.dimension
  );
  return profile?.defaultUnit ?? DEFAULT_UNIT[field.dimension] ?? "—";
}

export function readDesignTargetValue(
  field: DesignInputFieldDef,
  moduleId: string,
  designTargets: ModuleUserInputs,
  userInputs: ModuleUserInputs
): number {
  const merged = { ...userInputs, ...designTargets };
  const raw = designTargets[field.inputKey] ?? userInputs[field.inputKey];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return field.defaultValue ?? 0;
  }
  if (!field.dimension || field.dimension === "ratio" || field.dimension === "count") {
    return raw;
  }

  const unit = resolveDesignTargetUnit(field, moduleId, merged);
  return fromBase(raw, field.dimension as PhysicsDimension, unit);
}

export function writeDesignTargetValue(
  field: DesignInputFieldDef,
  moduleId: string,
  value: number,
  inputs: ModuleUserInputs
): ModuleUserInputs[keyof ModuleUserInputs] {
  if (!field.dimension || field.dimension === "ratio" || field.dimension === "count") {
    return value;
  }
  const unit = resolveDesignTargetUnit(field, moduleId, inputs);
  return toBase(value, field.dimension as PhysicsDimension, unit);
}

export function getDesignTargetFieldKey(field: DesignInputFieldDef): string | undefined {
  if (!field.dimension || field.dimension === "ratio" || field.dimension === "count") {
    return undefined;
  }
  return field.fieldKey ?? DEFAULT_FIELD_KEY[field.dimension] ?? field.dimension;
}

export function getDesignTargetUnitProfile(
  moduleId: string,
  field: DesignInputFieldDef
): { dimension: PhysicsDimension; fieldKey?: string } | null {
  if (!field.dimension || field.dimension === "ratio" || field.dimension === "count") {
    return null;
  }
  const fieldKey = getDesignTargetFieldKey(field);
  const profile = fieldKey ? getModuleFieldProfile(moduleId, fieldKey) : undefined;
  return {
    dimension: (profile?.dimension ?? field.dimension) as PhysicsDimension,
    fieldKey,
  };
}
