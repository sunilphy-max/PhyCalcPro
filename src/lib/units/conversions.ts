// src/lib/units/conversions.ts

export const conversionFactors = {
  length: {
    m: 1,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254,
  },

  force: {
    N: 1,
    lbf: 4.44822,
  },

  stress: {
    Pa: 1,
    psi: 6894.76,
  },

  inertia: {
    m4: 1,
    in4: 4.16231e-7,
  },

  forcePerLength: {
    "N/m": 1,
    "lbf/ft": 14.5939,
  },

  moment: {
    "N·m": 1,
    "lbf·ft": 1.35582,
  },

  pressure: {
    Pa: 1,
    psi: 6894.76,
  },

  density: {
    "kg/m3": 1,
    "lb/ft3": 16.0185,
  },

  area: {
    m2: 1,
    mm2: 1e-6,
    in2: 0.00064516,
    ft2: 0.092903,
  }
} as const;

export function toBase(
  value: number,
  dimension: keyof typeof conversionFactors,
  unit: string
): number {
  return value * conversionFactors[dimension][unit as never];
}

export function fromBase(
  value: number,
  dimension: keyof typeof conversionFactors,
  unit: string
): number {
  return value / conversionFactors[dimension][unit as never];
}