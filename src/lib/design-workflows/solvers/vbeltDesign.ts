import {
  VBELT_SECTION_CATALOG,
  resolveBeltSections,
  type VBeltSection,
} from "@/lib/powerTransmission/v-belts/catalog";
import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";

export { VBELT_SECTION_CATALOG };

export type VBeltDesignCandidate = {
  section: string;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  powerUtilization: number;
  wrapAngleDriver: number;
  numberOfBelts: number;
  beltLength: number;
  standardBeltLengthMm: number;
};

export type VBeltDesignResult = {
  best: VBeltDesignCandidate | null;
  ranked: VBeltDesignCandidate[];
};

function candidateFromSolve(
  belt: VBeltSection,
  diameterDriver: number,
  ratio: number,
  centerDistance: number,
  params: {
    powerKw: number;
    speedDriver: number;
    speedDriven: number;
    serviceFactor: number;
    frictionCoeff: number;
  }
): VBeltDesignCandidate {
  const diameterDriven = diameterDriver * ratio;
  const result = solveVBeltDrive({
    power: params.powerKw,
    speedDriver: params.speedDriver,
    speedDriven: params.speedDriven,
    diameterDriver,
    diameterDriven,
    centerDistance,
    serviceFactor: params.serviceFactor,
    beltFactor: belt.beltFactor,
    frictionCoeff: params.frictionCoeff,
    beltSection: belt.section,
  });

  return {
    section: belt.section,
    diameterDriver,
    diameterDriven,
    centerDistance,
    powerUtilization: result.powerUtilization,
    wrapAngleDriver: result.wrapAngleDriver,
    numberOfBelts: result.numberOfBelts,
    beltLength: result.beltLength,
    standardBeltLengthMm: result.standardBeltLengthMm,
  };
}

export function designVBeltDrive(params: {
  powerKw: number;
  speedDriver: number;
  speedDriven: number;
  serviceFactor: number;
  frictionCoeff?: number;
  beltSection?: string;
  centerDistance?: number;
  maxPulleyDiameter?: number;
}): VBeltDesignResult {
  const frictionCoeff = params.frictionCoeff ?? 0.5;
  const ratio = params.speedDriver / Math.max(params.speedDriven, 1e-6);
  const sections = resolveBeltSections(params.beltSection ?? "auto");
  const ranked: VBeltDesignCandidate[] = [];

  const driverDiameters = [0.08, 0.1, 0.125, 0.15, 0.18, 0.2, 0.25, 0.3, 0.355, 0.4, 0.45, 0.5];

  for (const belt of sections) {
    const minD = belt.minPulleyMm / 1000;
    for (const diameterDriver of driverDiameters) {
      if (diameterDriver < minD) continue;
      const diameterDriven = diameterDriver * ratio;
      if (params.maxPulleyDiameter != null && diameterDriven > params.maxPulleyDiameter) continue;

      const centerDistance =
        params.centerDistance ??
        Math.max((diameterDriver + diameterDriven) * 0.75, (diameterDriver + diameterDriven) / 2 + 0.05);

      ranked.push(
        candidateFromSolve(belt, diameterDriver, ratio, centerDistance, {
          powerKw: params.powerKw,
          speedDriver: params.speedDriver,
          speedDriven: params.speedDriven,
          serviceFactor: params.serviceFactor,
          frictionCoeff,
        })
      );
    }
  }

  ranked.sort((a, b) => {
    const aPass = a.powerUtilization <= 1 && a.wrapAngleDriver >= 120;
    const bPass = b.powerUtilization <= 1 && b.wrapAngleDriver >= 120;
    if (aPass !== bPass) return aPass ? -1 : 1;
    if (a.numberOfBelts !== b.numberOfBelts) return a.numberOfBelts - b.numberOfBelts;
    return a.powerUtilization - b.powerUtilization;
  });

  const passing = ranked.filter((item) => item.powerUtilization <= 1 && item.wrapAngleDriver >= 120);
  return {
    best: passing[0] ?? ranked[0] ?? null,
    ranked: ranked.slice(0, 12),
  };
}
