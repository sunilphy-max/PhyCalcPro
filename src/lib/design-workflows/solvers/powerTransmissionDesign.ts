import { solveTimingBeltDrive } from "@/lib/powerTransmission/timing-belts/engine";
import { solveRollerChainDrive } from "@/lib/powerTransmission/roller-chains/engine";
import { solveMultiPulley } from "@/lib/powerTransmission/multi-pulley/engine";
import { designVBeltDrive } from "@/lib/design-workflows/solvers/vbeltDesign";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designTimingBelt(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 5000;
  const speed = userInputs.speedDriver ?? 1450;
  const ratio = userInputs.ratio ?? 2;
  const pitches = [0.005, 0.008, 0.01, 0.014];

  const items = pitches.map((pitch) => {
    for (const teeth of [20, 24, 28, 32]) {
      try {
        const res = solveTimingBeltDrive({
          power,
          speedDriver: speed,
          teethDriver: teeth,
          teethDriven: Math.round(teeth * ratio),
          pitch,
          beltWidth: 0.025,
          serviceFactor: userInputs.serviceFactor ?? 1.2,
        });
        return {
          label: `${(pitch * 1000).toFixed(0)} mm / ${teeth}T`,
          utilization: res.powerUtilization,
          fields: { pitch: pitch * 1000, teethDriver: teeth, teethDriven: Math.round(teeth * ratio) },
          detail: `ratio ${res.ratio.toFixed(2)}`,
        };
      } catch {
        continue;
      }
    }
    return { label: `${pitch}`, utilization: 99, fields: { pitch: pitch * 1000 }, detail: "invalid" };
  });

  return fromSweep(sweepCatalogForUtilization(items), "Timing belt pitch and tooth-count sweep for power capacity.");
}

export function designRollerChain(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 8000;
  const speed = userInputs.speedDriver ?? 720;
  const ratio = userInputs.ratio ?? 2.5;
  const pitches = ["08B", "10B", "12B", "16B"];
  const pitchMm: Record<string, number> = { "08B": 12.7, "10B": 15.875, "12B": 19.05, "16B": 25.4 };

  const items = pitches.map((chain) => {
    try {
      const res = solveRollerChainDrive({
        power,
        speedDriver: speed,
        teethDriver: 19,
        teethDriven: Math.round(19 * ratio),
        pitch: pitchMm[chain]! / 1000,
        serviceFactor: userInputs.serviceFactor ?? 1.3,
        strands: 1,
      });
      return {
        label: chain,
        utilization: res.powerUtilization,
        fields: { chainSize: chain, chainPitch: pitchMm[chain] },
        detail: `life ${res.estimatedLifeHours.toFixed(0)} h`,
      };
    } catch {
      return { label: chain, utilization: 99, fields: { chainSize: chain }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Roller chain size sweep for power and life.");
}

export function designMultiPulley(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const diameters = [100, 120, 150, 180, 200];
  const items = diameters.map((dMm) => {
    try {
      const d1 = dMm / 1000;
      const d2 = (dMm * 1.5) / 1000;
      const res = solveMultiPulley({
        diameters: [d1, d2],
        centerDistances: [0.5],
        driveType: "open",
      });
      const util = res.minWrapAngle < 120 ? 1.3 : 0.85;
      return {
        label: `D1=${dMm} mm`,
        utilization: util,
        fields: { diameter1: dMm, diameter2: dMm * 1.5 },
        detail: `wrap ${res.minWrapAngle?.toFixed(0) ?? "—"}°`,
      };
    } catch {
      return { label: `D=${dMm}`, utilization: 99, fields: { diameter1: dMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Driver pulley diameter sweep for wrap angle margin.");
}

export function designVBeltFromInputs(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const powerKw =
    userInputs.powerUnit === "W" ? (userInputs.power ?? 15000) / 1000 : (userInputs.power ?? 15);
  const design = designVBeltDrive({
    powerKw,
    speedDriver: userInputs.speedDriver ?? 1450,
    ratio: userInputs.ratio ?? 2,
    serviceFactor: userInputs.serviceFactor ?? 1.2,
  });
  return {
    method: "V-belt section and pulley sizing from power and ratio.",
    best: design.best
      ? {
          label: `Section ${design.best.section}`,
          utilization: design.best.powerUtilization,
          fields: {
            beltSection: design.best.section,
            diameterDriver: design.best.diameterDriver * 1000,
            diameterDriven: design.best.diameterDriven * 1000,
            centerDistance: design.best.centerDistance * 1000,
          },
          detail: `wrap ${design.best.wrapAngleDriver.toFixed(0)}°`,
        }
      : null,
    ranked: design.ranked.map((item) => ({
      label: `Section ${item.section}`,
      utilization: item.powerUtilization,
      fields: {
        beltSection: item.section,
        diameterDriver: item.diameterDriver * 1000,
        diameterDriven: item.diameterDriven * 1000,
        centerDistance: item.centerDistance * 1000,
      },
      detail: `wrap ${item.wrapAngleDriver.toFixed(0)}°`,
    })),
  };
}

export function designPowerTransmissionModule(
  moduleId: string,
  userInputs: ModuleUserInputs
): ModuleDesignModeResult {
  if (moduleId === "v-belts") return designVBeltFromInputs(userInputs);
  if (moduleId === "timing-belts") return designTimingBelt(userInputs);
  if (moduleId === "roller-chains") return designRollerChain(userInputs);
  if (moduleId === "multi-pulley") return designMultiPulley(userInputs);
  return designVBeltFromInputs(userInputs);
}
