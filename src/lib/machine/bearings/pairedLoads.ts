/**
 * Paired / duplex bearing load distribution and system life (ISO 281 / MITCalc-style).
 */

import type { BearingArrangement, BearingConfig, BearingType } from "./types";
import { calculateBearingEquivalentLoad, lifeExponentFor } from "./equivalentLoad";
import { calculateStaticEquivalentLoad } from "./staticLoad";

export type BearingStationLoad = {
  index: number;
  radialLoad: number;
  axialLoad: number;
  /** Effective dynamic rating — tandem axial pairs use 2×C for axial-dominated checks. */
  dynamicRatingMultiplier: number;
};

const PAIR_ARRANGEMENTS: BearingArrangement[] = ["back_to_back", "face_to_face", "tandem"];

export function isPairedArrangement(arrangement: BearingArrangement | undefined): boolean {
  return arrangement != null && PAIR_ARRANGEMENTS.includes(arrangement);
}

/** Split shaft loads across bearings in a matched pair. */
export function splitPairedLoads(
  radialLoad: number,
  axialLoad: number,
  arrangement: BearingArrangement
): BearingStationLoad[] {
  const Fr = Math.abs(radialLoad);
  const Fa = Math.abs(axialLoad);

  if (arrangement === "single") {
    return [{ index: 0, radialLoad: Fr, axialLoad: Fa, dynamicRatingMultiplier: 1 }];
  }

  if (arrangement === "tandem") {
    return [
      { index: 0, radialLoad: Fr / 2, axialLoad: Fa / 2, dynamicRatingMultiplier: 1 },
      { index: 1, radialLoad: Fr / 2, axialLoad: Fa / 2, dynamicRatingMultiplier: 1 },
    ];
  }

  // Back-to-back (O): moment-stiff — each carries Fr/2, Fa/2 (symmetric pair screening).
  // Face-to-face (X): same load split for life screening; stiffness differs in practice.
  return [
    { index: 0, radialLoad: Fr / 2, axialLoad: Fa / 2, dynamicRatingMultiplier: 1 },
    { index: 1, radialLoad: Fr / 2, axialLoad: Fa / 2, dynamicRatingMultiplier: 1 },
  ];
}

/**
 * Locating + floating shaft support (MITCalc / SKF step 2).
 * Locating takes all axial + half radial; floating takes half radial only.
 */
export function splitLocatingFloatingLoads(
  radialLoad: number,
  axialLoad: number
): BearingStationLoad[] {
  const Fr = Math.abs(radialLoad);
  const Fa = Math.abs(axialLoad);
  return [
    { index: 0, radialLoad: Fr / 2, axialLoad: Fa, dynamicRatingMultiplier: 1 },
    { index: 1, radialLoad: Fr / 2, axialLoad: 0, dynamicRatingMultiplier: 1 },
  ];
}

/** Tandem pair dynamic rating for predominantly axial load (ISO / manufacturer convention). */
export function tandemAxialRatingMultiplier(bearingType: BearingType, FaOverFr: number): number {
  if (FaOverFr < 0.5) return 1;
  const axialTypes: BearingType[] = ["angular_contact", "tapered_roller", "thrust_ball"];
  if (!axialTypes.includes(bearingType)) return 1;
  return 2;
}

export type StationLife = {
  station: BearingStationLoad;
  equivalentLoad: number;
  staticEquivalentLoad: number;
  basicLifeHours: number;
  modifiedLifeHours: number;
};

export function calculateStationLives(params: {
  config: BearingConfig;
  stations: BearingStationLoad[];
  dynamicRatingN: number;
  a1: number;
  aIso: number;
}): StationLife[] {
  const { config, stations, dynamicRatingN, a1, aIso } = params;
  const p = lifeExponentFor(config.bearingType);
  const speed = Math.max(config.speed, 1e-9);

  return stations.map((station) => {
    const stationConfig: BearingConfig = {
      ...config,
      radialLoad: station.radialLoad,
      axialLoad: station.axialLoad,
      arrangement: "single",
    };
    const P = calculateBearingEquivalentLoad(stationConfig);
    const P0 = calculateStaticEquivalentLoad(
      station.radialLoad,
      station.axialLoad,
      config.bearingType
    );
    const Ceff = dynamicRatingN * station.dynamicRatingMultiplier;
    const revs = a1 * Math.pow(Ceff / Math.max(P, 1e-9), p) * 1e6;
    const modRevs = a1 * aIso * Math.pow(Ceff / Math.max(P, 1e-9), p) * 1e6;
    return {
      station,
      equivalentLoad: P,
      staticEquivalentLoad: P0,
      basicLifeHours: revs / (60 * speed),
      modifiedLifeHours: modRevs / (60 * speed),
    };
  });
}

/** System life = minimum station life (first failure governs). */
export function systemLifeFromStations(stations: StationLife[]): {
  basicLifeHours: number;
  modifiedLifeHours: number;
  governingStationIndex: number;
} {
  let minBasic = Infinity;
  let minModified = Infinity;
  let governing = 0;
  stations.forEach((s, i) => {
    if (s.basicLifeHours < minBasic) {
      minBasic = s.basicLifeHours;
      governing = i;
    }
    if (s.modifiedLifeHours < minModified) minModified = s.modifiedLifeHours;
  });
  return {
    basicLifeHours: minBasic,
    modifiedLifeHours: minModified,
    governingStationIndex: governing,
  };
}
