export type BaseDimension = "mass" | "length" | "time" | "current" | "temperature" | "amount" | "luminousIntensity";

export type DimensionVector = {
  mass: number;
  length: number;
  time: number;
  current: number;
  temperature: number;
  amount: number;
  luminousIntensity: number;
};

export function defineDimension(partial: Partial<DimensionVector>): DimensionVector {
  return {
    mass: partial.mass ?? 0,
    length: partial.length ?? 0,
    time: partial.time ?? 0,
    current: partial.current ?? 0,
    temperature: partial.temperature ?? 0,
    amount: partial.amount ?? 0,
    luminousIntensity: partial.luminousIntensity ?? 0,
  };
}

export const dimensions = {
  scalar: defineDimension({}),
  length: defineDimension({ length: 1 }),
  area: defineDimension({ length: 2 }),
  volume: defineDimension({ length: 3 }),
  mass: defineDimension({ mass: 1 }),
  time: defineDimension({ time: 1 }),
  velocity: defineDimension({ length: 1, time: -1 }),
  acceleration: defineDimension({ length: 1, time: -2 }),
  force: defineDimension({ mass: 1, length: 1, time: -2 }),
  pressure: defineDimension({ mass: 1, length: -1, time: -2 }),
  stress: defineDimension({ mass: 1, length: -1, time: -2 }),
  energy: defineDimension({ mass: 1, length: 2, time: -2 }),
  power: defineDimension({ mass: 1, length: 2, time: -3 }),
  density: defineDimension({ mass: 1, length: -3 }),
  moment: defineDimension({ mass: 1, length: 2, time: -2 }),
  torque: defineDimension({ mass: 1, length: 2, time: -2 }),
  inertia: defineDimension({ length: 4 }),
  forcePerLength: defineDimension({ mass: 1, time: -2 }),
  temperature: defineDimension({ temperature: 1 }),
  inverseTemperature: defineDimension({ temperature: -1 }),
} as const;

export function sameDimension(a: DimensionVector, b: DimensionVector): boolean {
  return (
    a.mass === b.mass &&
    a.length === b.length &&
    a.time === b.time &&
    a.current === b.current &&
    a.temperature === b.temperature &&
    a.amount === b.amount &&
    a.luminousIntensity === b.luminousIntensity
  );
}
