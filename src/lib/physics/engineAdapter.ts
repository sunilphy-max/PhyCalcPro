import type { PhysicsDimension } from "./units";
import { toBaseUnit } from "./units";

export type UnitizedInput<TDimension extends PhysicsDimension> = {
  value: number;
  unit: string;
  dimension: TDimension;
};

export function normalizeInput<TDimension extends PhysicsDimension>(
  input: UnitizedInput<TDimension>
): number {
  return toBaseUnit(input.value, input.dimension, input.unit);
}

export type EngineMigrationHint = {
  moduleId: string;
  stage: "shim" | "native";
  notes: string;
};

export const physicsCoreMigrationHints: EngineMigrationHint[] = [
  {
    moduleId: "beams",
    stage: "shim",
    notes: "Normalize all UI units through normalizeInput before solver call.",
  },
  {
    moduleId: "vibrations",
    stage: "shim",
    notes: "Route stiffness/mass inputs through quantity validation.",
  },
  {
    moduleId: "pipes",
    stage: "shim",
    notes: "Replace inline pressure conversions with toBaseUnit contract.",
  },
];
