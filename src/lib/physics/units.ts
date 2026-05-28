import { dimensions, type DimensionVector, sameDimension } from "./dimensions";

export type PhysicsDimension =
  | "length"
  | "force"
  | "stress"
  | "inertia"
  | "forcePerLength"
  | "moment"
  | "pressure"
  | "power"
  | "torque"
  | "density"
  | "area";

export type UnitTable = Record<PhysicsDimension, Record<string, number>>;

export const unitFactors: UnitTable = {
  length: { m: 1, mm: 0.001, ft: 0.3048, in: 0.0254 },
  force: { N: 1, lbf: 4.44822 },
  stress: { Pa: 1, psi: 6894.76 },
  inertia: { m4: 1, mm4: 1e-12, in4: 4.16231e-7 },
  forcePerLength: { "N/m": 1, "lbf/ft": 14.5939 },
  moment: { "N·m": 1, "lbf·ft": 1.35582 },
  pressure: { Pa: 1, psi: 6894.76 },
  power: { W: 1, kW: 1000, hp: 745.7 },
  torque: { "N·m": 1, "lbf·ft": 1.35582 },
  density: { "kg/m3": 1, "lb/ft3": 16.0185 },
  area: { m2: 1, mm2: 1e-6, in2: 0.00064516, ft2: 0.092903 },
};

export const dimensionByPhysicsDimension: Record<PhysicsDimension, DimensionVector> = {
  length: dimensions.length,
  force: dimensions.force,
  stress: dimensions.stress,
  inertia: dimensions.inertia,
  forcePerLength: dimensions.forcePerLength,
  moment: dimensions.moment,
  pressure: dimensions.pressure,
  power: dimensions.power,
  torque: dimensions.torque,
  density: dimensions.density,
  area: dimensions.area,
};

export function toBaseUnit(value: number, dimension: PhysicsDimension, unit: string): number {
  const factor = unitFactors[dimension][unit];
  if (typeof factor !== "number") {
    throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
  }
  return value * factor;
}

export function fromBaseUnit(value: number, dimension: PhysicsDimension, unit: string): number {
  const factor = unitFactors[dimension][unit];
  if (typeof factor !== "number") {
    throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
  }
  return value / factor;
}

export function assertDimensionCompatible(
  expected: PhysicsDimension,
  provided: DimensionVector,
  label = "quantity"
): void {
  const expectedDimension = dimensionByPhysicsDimension[expected];
  if (!sameDimension(expectedDimension, provided)) {
    throw new Error(`Dimension mismatch for ${label}. Expected ${expected}.`);
  }
}
