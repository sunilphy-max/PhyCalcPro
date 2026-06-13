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
  | "area"
  | "time"
  | "lengthPerTime"
  | "frequency"
  | "dimensionless"
  | "mass"
  | "velocity"
  | "energy"
  | "volumeFlow"
  | "temperature"
  | "inverseTemperature";

export type UnitTable = Record<PhysicsDimension, Record<string, number>>;

const YEAR_SECONDS = 365.25 * 24 * 3600;

export const unitFactors: UnitTable = {
  length: {
    m: 1,
    mm: 0.001,
    cm: 0.01,
    um: 1e-6,
    "\u00b5m": 1e-6,
    ft: 0.3048,
    in: 0.0254,
  },
  force: { N: 1, kN: 1000, lbf: 4.44822 },
  stress: {
    Pa: 1,
    kPa: 1000,
    MPa: 1e6,
    GPa: 1e9,
    psi: 6894.76,
    ksi: 6_894_757,
    bar: 100000,
  },
  inertia: { m4: 1, mm4: 1e-12, in4: 4.16231e-7 },
  forcePerLength: { "N/m": 1, "kN/m": 1000, "lbf/ft": 14.5939 },
  moment: { "N\u00b7m": 1, "kN\u00b7m": 1000, "lbf\u00b7ft": 1.35582 },
  pressure: {
    Pa: 1,
    kPa: 1000,
    MPa: 1e6,
    GPa: 1e9,
    psi: 6894.76,
    ksi: 6_894_757,
    bar: 100000,
  },
  power: { W: 1, kW: 1000, hp: 745.7 },
  torque: { "N\u00b7m": 1, "lbf\u00b7ft": 1.35582 },
  density: { "kg/m3": 1, "g/cm3": 1000, "lb/ft3": 16.0185 },
  area: { m2: 1, mm2: 1e-6, cm2: 1e-4, in2: 0.00064516, ft2: 0.092903 },
  time: { s: 1, min: 60, hr: 3600, year: YEAR_SECONDS },
  lengthPerTime: {
    "m/s": 1,
    "mm/year": 0.001 / YEAR_SECONDS,
    "m/year": 1 / YEAR_SECONDS,
    "in/year": 0.0254 / YEAR_SECONDS,
  },
  frequency: { Hz: 1, kHz: 1000, rpm: 1 / 60, "rad/s": 1 / (2 * Math.PI) },
  dimensionless: {
    "-": 1,
    "%": 0.01,
    deg: Math.PI / 180,
    rad: 1,
    "kg\u00b7m2": 1,
    "lb\u00b7ft2": 0.04214011,
  },
  mass: { kg: 1, lb: 0.453592 },
  velocity: { "m/s": 1, "ft/s": 0.3048, "km/h": 1 / 3.6, "mm/s": 0.001 },
  energy: { J: 1, kJ: 1000, "ft\u00b7lbf": 1.35582 },
  volumeFlow: { "m3/s": 1, "L/min": 1 / 60000, gpm: 6.30902e-5 },
  // Temperature is affine, not multiplicative; factors here are placeholders so
  // unit enumeration works, while to/fromBaseUnit special-case the conversion.
  temperature: { C: 1, K: 1, F: 1 },
  // Per-degree coefficients (e.g. thermal expansion). Intervals: 1 K = 1 °C,
  // 1 °F = 5/9 °C, so a 1/°F coefficient is 1.8× larger when expressed per °C.
  inverseTemperature: { "1/C": 1, "1/K": 1, "1/F": 1.8 },
};

// Affine temperature conversion relative to the base unit (°C)
const temperatureToCelsius: Record<string, (value: number) => number> = {
  C: (v) => v,
  K: (v) => v - 273.15,
  F: (v) => ((v - 32) * 5) / 9,
};

const temperatureFromCelsius: Record<string, (value: number) => number> = {
  C: (v) => v,
  K: (v) => v + 273.15,
  F: (v) => (v * 9) / 5 + 32,
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
  time: dimensions.time,
  lengthPerTime: { mass: 0, length: 1, time: -1, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  frequency: { mass: 0, length: 0, time: -1, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  dimensionless: dimensions.scalar,
  mass: { mass: 1, length: 0, time: 0, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  velocity: { mass: 0, length: 1, time: -1, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  energy: { mass: 1, length: 2, time: -2, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  volumeFlow: { mass: 0, length: 3, time: -1, current: 0, temperature: 0, amount: 0, luminousIntensity: 0 },
  temperature: dimensions.temperature,
  inverseTemperature: dimensions.inverseTemperature,
};

export function toBaseUnit(value: number, dimension: PhysicsDimension, unit: string): number {
  if (dimension === "temperature") {
    const convert = temperatureToCelsius[unit];
    if (!convert) {
      throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
    }
    return convert(value);
  }
  const factor = unitFactors[dimension]?.[unit];
  if (typeof factor !== "number") {
    throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
  }
  return value * factor;
}

export function fromBaseUnit(value: number, dimension: PhysicsDimension, unit: string): number {
  if (dimension === "temperature") {
    const convert = temperatureFromCelsius[unit];
    if (!convert) {
      throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
    }
    return convert(value);
  }
  const factor = unitFactors[dimension]?.[unit];
  if (typeof factor !== "number") {
    throw new Error(`Unsupported unit "${unit}" for dimension "${dimension}"`);
  }
  return value / factor;
}

export function getUnitsForDimension(
  dimension: PhysicsDimension,
  allowedUnits?: string[]
): string[] {
  const all = Object.keys(unitFactors[dimension] ?? {});
  if (!allowedUnits?.length) return all;
  return allowedUnits.filter((unit) => unit in (unitFactors[dimension] ?? {}));
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
