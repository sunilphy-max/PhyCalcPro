import type { CompressionSpringConfig, CompressionSpringResult } from "./types";

export function solveCompressionSpringEngine(c: CompressionSpringConfig): CompressionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const G = c.modulus / 2.6;
  const springRate = (G * d ** 4) / (8 * D ** 3 * n);
  const solidHeight = n * d + 2 * d;
  const maxLoad = springRate * c.deflection;
  const C = D / d;
  const Ks = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
  const shearStress = (8 * maxLoad * D * Ks) / (Math.PI * d ** 3);
  const safetyFactor = c.ultimateStrength / Math.max(shearStress, 1e-9);
  const massEstimate = Math.PI * (D ** 2) * n * d * 7850 / 4;
  const naturalFrequency = Math.sqrt(springRate / Math.max(massEstimate, 1e-6)) / (2 * Math.PI);
  return { springRate, solidHeight, maxLoad, shearStress, safetyFactor, naturalFrequency };
}
