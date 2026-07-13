/**
 * ISO 20056-inspired hybrid / full ceramic rolling-element modifiers (screening).
 *
 * Hybrid = ceramic rolling elements on steel rings.
 * Full ceramic = ceramic rings + elements (different fatigue / speed behavior).
 */

import type { RollingElementMaterial } from "./types";

export type HybridCeramicFactors = {
  material: RollingElementMaterial;
  /** Multiplier on dynamic load rating C used in life. */
  dynamicRatingFactor: number;
  /** Multiplier on limiting / reference speed. */
  speedFactor: number;
  /** Extra life modification (often >1 for hybrid under good lubrication). */
  lifeFactor: number;
  /** Friction torque scale (lighter ceramic → lower). */
  frictionFactor: number;
  note: string;
};

export function hybridCeramicFactors(
  material: RollingElementMaterial | undefined
): HybridCeramicFactors {
  const m = material ?? "steel";
  if (m === "hybrid_ceramic") {
    return {
      material: m,
      // Hybrid Si₃N₄ balls: higher speed capability, modest C benefit for fatigue
      dynamicRatingFactor: 1.08,
      speedFactor: 1.25,
      lifeFactor: 1.35,
      frictionFactor: 0.85,
      note: "Hybrid ceramic (ISO 20056-inspired screening): Si₃N₄ elements on steel rings.",
    };
  }
  if (m === "full_ceramic") {
    return {
      material: m,
      // Full ceramic: corrosion/high-temp niche; fatigue life model differs — conservative C, high speed
      dynamicRatingFactor: 0.92,
      speedFactor: 1.4,
      lifeFactor: 0.95,
      frictionFactor: 0.7,
      note: "Full ceramic screening: different fatigue path — verify per ISO 20056 / manufacturer data.",
    };
  }
  return {
    material: "steel",
    dynamicRatingFactor: 1,
    speedFactor: 1,
    lifeFactor: 1,
    frictionFactor: 1,
    note: "Through-hardened steel rolling elements.",
  };
}
