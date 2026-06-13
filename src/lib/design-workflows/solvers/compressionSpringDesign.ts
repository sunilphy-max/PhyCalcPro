import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import { SPRING_WIRE_DIAMETERS_MM } from "@/data/catalogs/standardSeries";

const WIRE_SIZES_MM = SPRING_WIRE_DIAMETERS_MM.filter((d) => d >= 0.5);

export type CompressionSpringCandidate = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  springRate: number;
  maxLoad: number;
  outerDiameter: number;
  safetyFactor: number;
  utilization: number;
};

export type CompressionSpringDesignResult = {
  best: CompressionSpringCandidate | null;
  ranked: CompressionSpringCandidate[];
};

export function designCompressionSpring(params: {
  targetRate: number;
  maxForce: number;
  maxOD: number;
  modulus: number;
  ultimateStrength: number;
  freeLength: number;
  minSafetyFactor?: number;
}): CompressionSpringDesignResult {
  const minSafetyFactor = params.minSafetyFactor ?? 1.2;
  const ranked: CompressionSpringCandidate[] = [];

  for (const wireMm of WIRE_SIZES_MM) {
    const wireDiameter = wireMm / 1000;
    for (let activeCoils = 4; activeCoils <= 18; activeCoils += 1) {
      for (let meanDiameter = wireDiameter * 4; meanDiameter <= params.maxOD - wireDiameter; meanDiameter += wireDiameter * 0.25) {
        const outerDiameter = meanDiameter + wireDiameter;
        if (outerDiameter > params.maxOD + 1e-9) continue;

        const springRate = solveCompressionSpringEngine({
          wireDiameter,
          meanDiameter,
          activeCoils,
          freeLength: params.freeLength,
          deflection: 0.001,
          modulus: params.modulus,
          ultimateStrength: params.ultimateStrength,
        }).springRate;

        const rateUtil = Math.abs(springRate - params.targetRate) / Math.max(params.targetRate, 1e-9);
        const deflectionAtMaxForce = params.maxForce / Math.max(springRate, 1e-9);
        const check = solveCompressionSpringEngine({
          wireDiameter,
          meanDiameter,
          activeCoils,
          freeLength: params.freeLength,
          deflection: deflectionAtMaxForce,
          modulus: params.modulus,
          ultimateStrength: params.ultimateStrength,
        });

        const forceUtil = check.maxLoad / Math.max(params.maxForce, 1e-9);
        const index = meanDiameter / wireDiameter;
        if (index < 4 || index > 12) continue;

        const utilization = Math.max(rateUtil, forceUtil > 1 ? forceUtil : 0, minSafetyFactor / Math.max(check.safetyFactor, 1e-9));
        ranked.push({
          wireDiameter,
          meanDiameter,
          activeCoils,
          springRate,
          maxLoad: check.maxLoad,
          outerDiameter,
          safetyFactor: check.safetyFactor,
          utilization,
        });
      }
    }
  }

  ranked.sort((a, b) => {
    const aPass =
      a.utilization <= 1 &&
      a.maxLoad >= params.maxForce * 0.99 &&
      a.safetyFactor >= minSafetyFactor &&
      a.outerDiameter <= params.maxOD + 1e-9;
    const bPass =
      b.utilization <= 1 &&
      b.maxLoad >= params.maxForce * 0.99 &&
      b.safetyFactor >= minSafetyFactor &&
      b.outerDiameter <= params.maxOD + 1e-9;
    if (aPass !== bPass) return aPass ? -1 : 1;
    return a.utilization - b.utilization;
  });

  const passing = ranked.filter(
    (item) =>
      item.utilization <= 1 &&
      item.maxLoad >= params.maxForce * 0.99 &&
      item.safetyFactor >= minSafetyFactor &&
      item.outerDiameter <= params.maxOD + 1e-9
  );

  return {
    best: passing[0] ?? null,
    ranked: ranked.slice(0, 12),
  };
}
