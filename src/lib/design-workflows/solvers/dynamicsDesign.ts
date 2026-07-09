import { solveVibrationEngine } from "@/lib/dynamics/vibrations/engine";
import { solveRotationEngine } from "@/lib/dynamics/rotation/engine";
import { designMotorPoles } from "@/lib/dynamics/motor/engine";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import { solveSuspensionEngine } from "@/lib/dynamics/suspension/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import { STEEL_DENSITY, STEEL_E, STEEL_YIELD } from "@/lib/materials/materialDefaults";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designVibrationMargin(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const excitation = userInputs.excitationHz ?? 50;
  const inertias = [1e-6, 2e-6, 5e-6, 1e-5, 2e-5, 5e-5];

  const items = inertias.map((I) => {
    try {
      const res = solveVibrationEngine({
        length: userInputs.length ?? 1,
        E: userInputs.E ?? STEEL_E,
        I,
        A: 0.001,
        rho: STEEL_DENSITY,
        segments: 20,
        support: "simply_supported",
        dampingRatio: userInputs.dampingRatio ?? 0.05,
      });
      const fn = res.frequencies[0] ?? 0;
      const margin = Math.abs(fn - excitation) / Math.max(excitation, 1e-9);
      const util = 0.15 / Math.max(margin, 1e-9);
      return {
        label: `I ${I.toExponential(1)} m⁴`,
        utilization: util,
        fields: { inertia: I },
        detail: `f1 ${fn.toFixed(1)} Hz · ${res.resonanceNote.slice(0, 40)}`,
      };
    } catch {
      return { label: `I=${I}`, utilization: 99, fields: { inertia: I }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Section inertia sweep for modal separation margin.");
}

export function designRotationSystem(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const radiiMm = [100, 150, 200, 250, 300];
  const items = radiiMm.map((rMm) => {
    const r = rMm / 1000;
    try {
      const res = solveRotationEngine({
        mass: userInputs.mass ?? 50,
        radius: r,
        speedRPM: userInputs.speedDriver ?? userInputs.rpm ?? 1500,
        power: userInputs.power ?? 10000,
      });
      const util = (userInputs.targetSafetyFactor ?? 1.5) / Math.max(
        (userInputs.yieldStress ?? STEEL_YIELD) / Math.max(res.centripetalForce / (Math.PI * r * r), 1),
        1e-9
      );
      return {
        label: `R ${rMm} mm`,
        utilization: util,
        fields: { radius: rMm },
        detail: `Fc ${(res.centripetalForce / 1000).toFixed(1)} kN`,
      };
    } catch {
      return { label: `R${rMm}`, utilization: 99, fields: { radius: rMm }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Rotating mass radius sweep for centripetal load.");
}

export function designImpactAbsorber(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const areas = [0.0005, 0.001, 0.002, 0.003, 0.005];
  const items = areas.map((a) => {
    try {
      const res = solveImpactEngine({
        mass: userInputs.mass ?? 500,
        velocityChange: userInputs.velocity ?? 2,
        impactDuration: userInputs.impactDuration ?? 0.01,
        crossSectionArea: a,
        yieldStrength: userInputs.yieldStress ?? STEEL_YIELD,
      });
      const util = (userInputs.targetSafetyFactor ?? 1.5) / Math.max(res.safetyFactor, 1e-9);
      return {
        label: `A ${(a * 1e4).toFixed(1)} cm²`,
        utilization: util,
        fields: { crossSectionArea: a },
        detail: `SF ${res.safetyFactor.toFixed(2)}`,
      };
    } catch {
      return { label: `${a}`, utilization: 99, fields: { crossSectionArea: a }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Cross-section sweep for impact dynamic stress SF.");
}

export function designSuspensionSpring(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const stiffnesses = [20000, 30000, 40000, 50000, 60000];
  const items = stiffnesses.map((k) => {
    try {
      const res = solveSuspensionEngine({
        sprungMass: userInputs.mass ?? 400,
        trackWidth: userInputs.trackWidth ?? 1.5,
        rollStiffness: k,
        wheelbase: userInputs.wheelbase ?? 2.7,
        lateralAcceleration: userInputs.lateralAcceleration ?? 0.4 * 9.81,
        cgHeight: userInputs.cgHeight ?? 0.5,
      });
      const util = res.designStatus === "stable" ? 0.7 : res.designStatus === "moderate" ? 1.0 : 1.4;
      return {
        label: `${(k / 1000).toFixed(0)} kN·m/rad`,
        utilization: util,
        fields: { rollStiffness: k },
        detail: `roll ${res.rollAngleDegrees.toFixed(2)}°`,
      };
    } catch {
      return { label: `${k}`, utilization: 99, fields: { rollStiffness: k }, detail: "invalid" };
    }
  });
  return fromSweep(sweepCatalogForUtilization(items), "Roll stiffness sweep for lateral stability.");
}

export function designMotorSelection(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 7500;
  const { best, ranked } = designMotorPoles(
    power,
    (userInputs.lineFrequencyHz as 50 | 60) ?? 60,
    (userInputs.serviceClass as "continuous" | "intermittent" | "short_time") ?? "continuous",
    userInputs.serviceFactor ?? 2,
    userInputs.efficiency ?? 0.9,
    userInputs.powerFactor ?? 0.85
  );
  return {
    method: "Pole-count sweep for rated torque and frame class at required power.",
    best: best
      ? {
          label: `${best.poles}-pole · ${best.frameClass}`,
          utilization: best.designStatus === "safe" ? 0.7 : 1.1,
          fields: { poles: best.poles },
          detail: `${best.ratedSpeedRpm.toFixed(0)} rpm · ${(best.ratedTorque).toFixed(1)} N·m`,
        }
      : null,
    ranked: ranked.map((r) => ({
      label: `${r.poles}-pole · ${r.frameClass}`,
      utilization: r.designStatus === "safe" ? 0.7 : 1.1,
      fields: { poles: r.poles },
      detail: `${r.ratedSpeedRpm.toFixed(0)} rpm`,
    })),
  };
}

export function designDynamicsModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "motor") return designMotorSelection(userInputs);
  if (moduleId === "vibrations") return designVibrationMargin(userInputs);
  if (moduleId === "rotation") return designRotationSystem(userInputs);
  if (moduleId === "impact") return designImpactAbsorber(userInputs);
  if (moduleId === "suspension") return designSuspensionSpring(userInputs);
  return designVibrationMargin(userInputs);
}
