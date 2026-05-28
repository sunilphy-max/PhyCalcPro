import type { DimensionVector } from "./dimensions";
import { sameDimension } from "./dimensions";
import { fromBaseUnit, toBaseUnit, type PhysicsDimension } from "./units";

export type Quantity = {
  value: number;
  dimension: DimensionVector;
};

export function quantity(value: number, dimension: DimensionVector): Quantity {
  return { value, dimension };
}

export function add(a: Quantity, b: Quantity): Quantity {
  if (!sameDimension(a.dimension, b.dimension)) {
    throw new Error("Cannot add quantities with different dimensions");
  }
  return { value: a.value + b.value, dimension: a.dimension };
}

export function subtract(a: Quantity, b: Quantity): Quantity {
  if (!sameDimension(a.dimension, b.dimension)) {
    throw new Error("Cannot subtract quantities with different dimensions");
  }
  return { value: a.value - b.value, dimension: a.dimension };
}

export function scale(q: Quantity, factor: number): Quantity {
  return { value: q.value * factor, dimension: q.dimension };
}

export function fromUnit(value: number, dimension: PhysicsDimension, unit: string, vector: DimensionVector): Quantity {
  return { value: toBaseUnit(value, dimension, unit), dimension: vector };
}

export function toUnit(q: Quantity, dimension: PhysicsDimension, unit: string): number {
  return fromBaseUnit(q.value, dimension, unit);
}
