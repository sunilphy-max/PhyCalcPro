import type { DimensionVector } from "./dimensions";
import { dimensions } from "./dimensions";

export type PhysicalConstant = {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  dimension: DimensionVector;
};

export const physicalConstants = {
  gravitationalAcceleration: {
    symbol: "g",
    name: "Standard gravity",
    value: 9.80665,
    unit: "m/s2",
    dimension: dimensions.acceleration,
  },
  speedOfLight: {
    symbol: "c",
    name: "Speed of light in vacuum",
    value: 299_792_458,
    unit: "m/s",
    dimension: dimensions.velocity,
  },
  planckConstant: {
    symbol: "h",
    name: "Planck constant",
    value: 6.62607015e-34,
    unit: "J*s",
    dimension: {
      mass: 1,
      length: 2,
      time: -1,
      current: 0,
      temperature: 0,
      amount: 0,
      luminousIntensity: 0,
    },
  },
  gasConstant: {
    symbol: "R",
    name: "Universal gas constant",
    value: 8.314462618,
    unit: "J/(mol*K)",
    dimension: {
      mass: 1,
      length: 2,
      time: -2,
      current: 0,
      temperature: -1,
      amount: -1,
      luminousIntensity: 0,
    },
  },
} as const satisfies Record<string, PhysicalConstant>;
