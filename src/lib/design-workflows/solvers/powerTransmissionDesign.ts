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

/** Standard metric timing pitches (mm) and tooth / width grids. */
const TIMING_PITCHES_MM = [5, 8, 10, 14, 20];
const TIMING_TEETH = [18, 20, 22, 24, 28, 32, 36, 40];
const TIMING_WIDTHS_MM = [15, 20, 25, 30, 40, 50];

/**
 * Timing belt pitch × teeth × width sweep.
 * Apply fields pitch / beltWidth are in **mm** (timing-belts page).
 */
export function designTimingBelt(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 5000;
  const speed = userInputs.speedDriver ?? 1450;
  const ratio = userInputs.ratio ?? 2;
  const serviceFactor = userInputs.serviceFactor ?? 1.2;
  const items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail: string;
  }> = [];

  for (const pitchMm of TIMING_PITCHES_MM) {
    for (const teeth of TIMING_TEETH) {
      for (const widthMm of TIMING_WIDTHS_MM) {
        const teethDriven = Math.max(teeth + 1, Math.round(teeth * ratio));
        try {
          const res = solveTimingBeltDrive({
            power,
            speedDriver: speed,
            teethDriver: teeth,
            teethDriven,
            pitch: pitchMm / 1000,
            beltWidth: widthMm / 1000,
            serviceFactor,
          });
          items.push({
            label: `${pitchMm} mm / ${teeth}T / ${widthMm} mm`,
            utilization: res.powerUtilization,
            fields: {
              pitch: pitchMm,
              teethDriver: teeth,
              teethDriven,
              beltWidth: widthMm,
            },
            detail: `util ${(res.powerUtilization * 100).toFixed(0)}% · ratio ${res.ratio.toFixed(2)}`,
          });
        } catch {
          /* skip invalid */
        }
      }
    }
  }

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Timing belt pitch × tooth-count × width sweep for power capacity."
  );
}

export function designRollerChain(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const power = userInputs.power ?? 8000;
  const speed = userInputs.speedDriver ?? 720;
  const ratio = userInputs.ratio ?? 2.5;
  const pitches = ["08B", "10B", "12B", "16B", "20B"];
  const pitchMm: Record<string, number> = {
    "08B": 12.7,
    "10B": 15.875,
    "12B": 19.05,
    "16B": 25.4,
    "20B": 31.75,
  };
  const strandsOptions = [1, 2];

  const items: Array<{
    label: string;
    utilization: number;
    fields: Record<string, unknown>;
    detail: string;
  }> = [];

  for (const chain of pitches) {
    for (const strands of strandsOptions) {
      try {
        const res = solveRollerChainDrive({
          power,
          speedDriver: speed,
          teethDriver: 19,
          teethDriven: Math.round(19 * ratio),
          pitch: pitchMm[chain]! / 1000,
          serviceFactor: userInputs.serviceFactor ?? 1.3,
          strands,
        });
        items.push({
          label: `${chain}${strands > 1 ? ` ×${strands}` : ""}`,
          utilization: res.powerUtilization,
          fields: { chainSize: chain, chainPitch: pitchMm[chain], strands },
          detail: `life ${res.estimatedLifeHours.toFixed(0)} h · util ${(res.powerUtilization * 100).toFixed(0)}%`,
        });
      } catch {
        /* skip */
      }
    }
  }

  return fromSweep(sweepCatalogForUtilization(items), "Roller chain size/strand sweep for power and life.");
}

export function designMultiPulley(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const diameters = [80, 100, 120, 150, 180, 200, 250];
  const items = diameters.map((dMm) => {
    try {
      const d1 = dMm / 1000;
      const d2 = (dMm * 1.5) / 1000;
      const res = solveMultiPulley({
        diameters: [d1, d2],
        centerDistances: [0.5],
        driveType: "open",
      });
      const wrap = res.minWrapAngle ?? 0;
      const util = wrap < 120 ? 120 / Math.max(wrap, 1) : 0.85;
      return {
        label: `D1=${dMm} mm`,
        utilization: util,
        fields: { diameter1: dMm, diameter2: dMm * 1.5 },
        detail: `wrap ${wrap.toFixed(0)}°`,
      };
    } catch {
      return { label: `D=${dMm}`, utilization: 99, fields: { diameter1: dMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Driver pulley diameter sweep for wrap angle margin.");
}

export function designVBeltFromInputs(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const powerKw =
    userInputs.powerUnit === "W"
      ? (userInputs.power ?? 15000) / 1000
      : userInputs.powerUnit === "hp"
        ? (userInputs.power ?? 15) * 0.7457
        : (userInputs.power ?? 15);
  const speedDriver = userInputs.speedDriver ?? 1450;
  const speedDriven =
    userInputs.speedDriven ??
    (userInputs.ratio ? speedDriver / userInputs.ratio : speedDriver / 2);
  const centerDistance =
    userInputs.centerDistance != null ? userInputs.centerDistance / 1000 : undefined;

  const design = designVBeltDrive({
    powerKw,
    speedDriver,
    speedDriven,
    serviceFactor: userInputs.serviceFactor ?? 1.2,
    beltSection: userInputs.beltSection != null ? String(userInputs.beltSection) : "auto",
    centerDistance,
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
