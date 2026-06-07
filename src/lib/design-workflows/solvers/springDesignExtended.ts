import { designCompressionSpring } from "@/lib/design-workflows/solvers/compressionSpringDesign";
import { solveExtensionSpringEngine } from "@/lib/springs/extension-springs/engine";
import { solveTorsionSpringEngine } from "@/lib/springs/torsion-springs/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designSpringModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "compression-springs") {
    const design = designCompressionSpring({
      targetRate: userInputs.targetRate ?? 50,
      maxForce: userInputs.maxForce ?? 450,
      maxOD: userInputs.maxOD ?? 0.04,
      modulus: userInputs.modulus ?? 81e9,
      ultimateStrength: userInputs.ultimateStrength ?? 1400e6,
      freeLength: userInputs.freeLength ?? 0.05,
      minSafetyFactor: userInputs.targetSafetyFactor ?? 1.2,
    });
    return {
      method: "Compression spring wire/coil sweep for target rate and stress.",
      best: design.best
        ? {
            label: `${(design.best.wireDiameter * 1000).toFixed(1)} mm wire`,
            utilization: design.best.utilization,
            fields: {
              wireDiameter: design.best.wireDiameter * 1000,
              meanDiameter: design.best.meanDiameter * 1000,
              activeCoils: design.best.activeCoils,
            },
            detail: `k ${design.best.springRate.toFixed(1)} N/m`,
          }
        : null,
      ranked: design.ranked.map((item) => ({
        label: `${(item.wireDiameter * 1000).toFixed(1)} mm / ${item.activeCoils} coils`,
        utilization: item.utilization,
        fields: {
          wireDiameter: item.wireDiameter * 1000,
          meanDiameter: item.meanDiameter * 1000,
          activeCoils: item.activeCoils,
        },
        detail: `SF ${item.safetyFactor.toFixed(2)}`,
      })),
    };
  }

  if (moduleId === "extension-springs") {
    const wires = [1, 1.2, 1.6, 2, 2.5, 3, 4];
    const items = wires.map((wMm) => {
      const d = wMm / 1000;
      const D = 0.02;
      const n = 8;
      try {
        const res = solveExtensionSpringEngine({
          wireDiameter: d,
          meanDiameter: D,
          activeCoils: n,
          freeLength: 0.06,
          deflection: 0.015,
          modulus: userInputs.modulus ?? 81e9,
          ultimateStrength: userInputs.ultimateStrength ?? 1400e6,
        });
        const util = (userInputs.targetRate ?? 40) / Math.max(res.springRate, 1e-9);
        return {
          label: `${wMm} mm wire`,
          utilization: util,
          fields: { wireDiameter: wMm, meanDiameter: D * 1000, activeCoils: n },
          detail: `k ${res.springRate.toFixed(1)} N/m`,
        };
      } catch {
        return { label: `${wMm} mm`, utilization: 99, fields: { wireDiameter: wMm }, detail: "invalid" };
      }
    });
    return fromSweep(sweepCatalogForUtilization(items), "Extension spring wire sweep for target rate.");
  }

  const legLengths = [20, 25, 30, 35, 40, 50];
  const items = legLengths.map((legMm) => {
    const leg = legMm / 1000;
    try {
      const res = solveTorsionSpringEngine({
        wireDiameter: 0.003,
        meanDiameter: 0.02,
        activeCoils: 8,
        legLength: leg,
        deflectionAngleDeg: 90,
        modulus: userInputs.modulus ?? 81e9,
        ultimateStrength: userInputs.ultimateStrength ?? 1400e6,
      });
      const util = (userInputs.targetRate ?? 0.5) / Math.max(res.springRate, 1e-9);
      return {
        label: `Leg ${legMm} mm`,
        utilization: util,
        fields: { legLength: legMm },
        detail: `rate ${res.springRate.toFixed(3)} N·m/rad`,
      };
    } catch {
      return { label: `${legMm} mm`, utilization: 99, fields: { legLength: legMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Torsion spring leg-length sweep for target rate.");
}
