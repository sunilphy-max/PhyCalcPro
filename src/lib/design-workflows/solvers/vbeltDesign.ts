import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";

export const VBELT_SECTION_CATALOG = [
  { section: "A", beltFactor: 0.12 },
  { section: "B", beltFactor: 0.18 },
  { section: "SPA", beltFactor: 0.22 },
  { section: "SPB", beltFactor: 0.32 },
] as const;

export type VBeltDesignCandidate = {
  section: string;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  powerUtilization: number;
  wrapAngleDriver: number;
};

export type VBeltDesignResult = {
  best: VBeltDesignCandidate | null;
  ranked: VBeltDesignCandidate[];
};

export function designVBeltDrive(params: {
  powerKw: number;
  speedDriver: number;
  ratio: number;
  serviceFactor: number;
  frictionCoeff?: number;
}): VBeltDesignResult {
  const frictionCoeff = params.frictionCoeff ?? 0.5;
  const ranked: VBeltDesignCandidate[] = [];
  const driverDiameters = [0.1, 0.125, 0.15, 0.18, 0.2, 0.25, 0.3, 0.355];

  for (const belt of VBELT_SECTION_CATALOG) {
    for (const diameterDriver of driverDiameters) {
      const diameterDriven = diameterDriver * params.ratio;
      const centerDistance = Math.max(
        (diameterDriver + diameterDriven) * 0.75,
        (diameterDriver + diameterDriven) / 2 + 0.05
      );

      const result = solveVBeltDrive({
        power: params.powerKw,
        speedDriver: params.speedDriver,
        diameterDriver,
        diameterDriven,
        centerDistance,
        serviceFactor: params.serviceFactor,
        beltFactor: belt.beltFactor,
        frictionCoeff,
      });

      ranked.push({
        section: belt.section,
        diameterDriver,
        diameterDriven,
        centerDistance,
        powerUtilization: result.powerUtilization,
        wrapAngleDriver: result.wrapAngleDriver,
      });
    }
  }

  ranked.sort((a, b) => {
    const aPass = a.powerUtilization <= 1 && a.wrapAngleDriver >= 120;
    const bPass = b.powerUtilization <= 1 && b.wrapAngleDriver >= 120;
    if (aPass !== bPass) return aPass ? -1 : 1;
    return a.powerUtilization - b.powerUtilization;
  });

  const passing = ranked.filter((item) => item.powerUtilization <= 1 && item.wrapAngleDriver >= 120);
  return {
    best: passing[0] ?? ranked[0] ?? null,
    ranked: ranked.slice(0, 12),
  };
}
