export type ReferenceCase = {
  id: string;
  moduleId: string;
  description: string;
  expected: Record<string, number>;
  tolerancePercent: number;
};

export const referenceCases: ReferenceCase[] = [
  {
    id: "beam-cantilever-tip-load",
    moduleId: "beams",
    description: "Cantilever beam with tip load: delta = PL^3/(3EI)",
    expected: {
      maxDeflection: 0.001,
    },
    tolerancePercent: 8,
  },
  {
    id: "vibration-simply-supported-first-mode",
    moduleId: "vibrations",
    description: "First natural frequency against Euler-Bernoulli analytical estimate",
    expected: {
      firstFrequencyHz: 12,
    },
    tolerancePercent: 10,
  },
];

export function withinTolerance(actual: number, expected: number, tolerancePercent: number): boolean {
  const denominator = Math.max(Math.abs(expected), 1e-12);
  const errorPercent = (Math.abs(actual - expected) / denominator) * 100;
  return errorPercent <= tolerancePercent;
}
