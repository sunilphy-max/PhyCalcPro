/**
 * ASTM spring wire ultimate strength — Shigley Table 10-4 (d in mm).
 */

export type SpringWireType =
  | "music"
  | "hard-drawn"
  | "oil-tempered"
  | "chrome-vanadium"
  | "chrome-silicon"
  | "custom";

const WIRE_STRENGTH_FIT: Record<Exclude<SpringWireType, "custom">, { A: number; m: number }> = {
  music: { A: 2211e6, m: 0.145 },
  "hard-drawn": { A: 1783e6, m: 0.19 },
  "oil-tempered": { A: 1855e6, m: 0.187 },
  "chrome-vanadium": { A: 2005e6, m: 0.168 },
  "chrome-silicon": { A: 1974e6, m: 0.108 },
};

export function wireUltimateStrengthPa(
  wireType: SpringWireType | undefined,
  wireDiameterM: number,
  fallbackPa: number
): number {
  if (!wireType || wireType === "custom") return fallbackPa;
  const { A, m } = WIRE_STRENGTH_FIT[wireType];
  const dMm = Math.max(wireDiameterM * 1000, 0.1);
  return A / Math.pow(dMm, m);
}

/** Max manufacturable initial tension estimate (Shigley screening). */
export function maxInitialTensionEstimate(
  allowableShearPa: number,
  wireDiameterM: number,
  meanDiameterM: number,
  wahl: number
): number {
  return (allowableShearPa * Math.PI * wireDiameterM ** 3) / (8 * meanDiameterM * Math.max(wahl, 1));
}

export type HookType = "none" | "machine" | "crossover" | "extended";

export const HOOK_STRESS_FACTOR: Record<HookType, number> = {
  none: 1.0,
  machine: 1.25,
  crossover: 1.4,
  extended: 1.15,
};
