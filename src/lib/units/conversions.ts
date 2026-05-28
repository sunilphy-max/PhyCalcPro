import {
  fromBaseUnit,
  toBaseUnit,
  type PhysicsDimension,
  unitFactors as conversionFactors,
} from "@/lib/physics/units";

export { conversionFactors };

export function toBase(
  value: number,
  dimension: PhysicsDimension,
  unit: string
): number {
  return toBaseUnit(value, dimension, unit);
}

export function fromBase(
  value: number,
  dimension: PhysicsDimension,
  unit: string
): number {
  return fromBaseUnit(value, dimension, unit);
}