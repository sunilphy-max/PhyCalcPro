import { designCompressionSpring } from "@/lib/design-workflows/solvers/compressionSpringDesign";
import { designSweepWireDiametersMm } from "@/data/catalogs/springWireCatalog";
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
    const targetRate = userInputs.targetRate ?? 40;
    const maxForce = userInputs.maxForce ?? 200;
    const modulus = userInputs.modulus ?? 81e9;
    const ultimateStrength = userInputs.ultimateStrength ?? 1400e6;
    const freeLength = userInputs.freeLength ?? 0.06;
    const deflection = userInputs.deflection ?? 0.015;
    const initialTension = userInputs.initialTension ?? 5;
    const wires = designSweepWireDiametersMm();
    const coilCounts = [6, 8, 10, 12, 14];

    const items = wires.flatMap((wMm) =>
      coilCounts.map((n) => {
        const d = wMm / 1000;
        const D = 0.02;
        try {
          const res = solveExtensionSpringEngine({
            wireDiameter: d,
            meanDiameter: D,
            activeCoils: n,
            freeLength,
            deflection,
            modulus,
            ultimateStrength,
            initialTension,
            hookType: "machine",
          });
          const rateUtil = targetRate / Math.max(res.springRate, 1e-9);
          const loadUtil = res.forceAtExtension / Math.max(maxForce, 1e-9);
          const sfUtil = 1.5 / Math.max(res.hookSafetyFactor, 0.1);
          const fatigueUtil =
            res.fatigueSafetyFactor != null ? 1.5 / Math.max(res.fatigueSafetyFactor, 0.1) : 0;
          const utilization = Math.max(rateUtil, loadUtil, sfUtil, fatigueUtil);
          return {
            label: `${wMm} mm / ${n} coils`,
            utilization,
            fields: { wireDiameter: wMm, meanDiameter: D * 1000, activeCoils: n },
            detail: `k ${res.springRate.toFixed(1)} N/m, hook SF ${res.hookSafetyFactor.toFixed(2)}`,
          };
        } catch {
          return { label: `${wMm} mm / ${n}`, utilization: 99, fields: { wireDiameter: wMm }, detail: "invalid" };
        }
      })
    );
    return fromSweep(sweepCatalogForUtilization(items), "Extension spring wire/coil sweep for target rate and hook SF.");
  }

  const targetRate = userInputs.targetRate ?? 0.5;
  const modulus = userInputs.modulus ?? 210e9;
  const ultimateStrength = userInputs.ultimateStrength ?? 1400e6;
  const deflectionAngleDeg = userInputs.deflectionAngleDeg ?? 90;
  const wires = designSweepWireDiametersMm().filter((d) => d >= 1 && d <= 5);
  const coilCounts = [6, 8, 10, 12];
  const legLengths = [20, 25, 30, 35, 40, 50];

  const items = wires.flatMap((wMm) =>
    coilCounts.flatMap((n) =>
      legLengths.map((legMm) => {
        const d = wMm / 1000;
        const D = 0.02;
        const leg = legMm / 1000;
        try {
          const res = solveTorsionSpringEngine({
            wireDiameter: d,
            meanDiameter: D,
            activeCoils: n,
            legLength: leg,
            deflectionAngleDeg,
            modulus,
            ultimateStrength,
          });
          const rateUtil = targetRate / Math.max(res.springRate, 1e-9);
          const sfUtil = 1.5 / Math.max(res.safetyFactor, 0.1);
          const fatigueUtil =
            res.fatigueSafetyFactor != null ? 1.5 / Math.max(res.fatigueSafetyFactor, 0.1) : 0;
          const utilization = Math.max(rateUtil, sfUtil, fatigueUtil);
          return {
            label: `${wMm} mm / ${n} coils / leg ${legMm} mm`,
            utilization,
            fields: { wireDiameter: wMm, meanDiameter: D * 1000, activeCoils: n, legLength: legMm },
            detail: `k ${res.springRate.toFixed(3)} N·m/rad, SF ${res.safetyFactor.toFixed(2)}`,
          };
        } catch {
          return {
            label: `${wMm} mm / leg ${legMm} mm`,
            utilization: 99,
            fields: { legLength: legMm },
            detail: "invalid",
          };
        }
      })
    )
  );
  return fromSweep(
    sweepCatalogForUtilization(items),
    "Torsion spring wire/coil/leg sweep for target rate and bending SF."
  );
}
