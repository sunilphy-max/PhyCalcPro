/**
 * Dual-station catalog sizing for locating + floating systems.
 */

import type { BearingCatalogEntry, CatalogBearingType } from "@/data/catalogs/bearingCatalog";
import { findBearing } from "@/data/catalogs/bearingCatalog";
import {
  bestCatalogBearing,
  type BearingSelectionCriteria,
  type RankedBearing,
} from "./catalogSelection";
import { lifeExponentFor } from "./equivalentLoad";
import { calculateBearingEquivalentLoad } from "./equivalentLoad";
import { calculateStaticEquivalentLoad } from "./staticLoad";
import type { BearingConfig, BearingType } from "./types";

export type StationRole = "locating" | "floating" | "duplex_a" | "duplex_b";

export type SizedStation = {
  role: StationRole;
  label: string;
  bearingType: BearingType;
  designation?: string;
  entry?: BearingCatalogEntry;
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  staticEquivalentLoad: number;
  dynamicRatingN: number;
  staticRatingN: number;
  basicLifeHours: number;
  modifiedLifeHours: number;
  dynamicUtilization: number;
  staticSafetyFactor: number;
  recommendation?: RankedBearing | null;
};

function stationLifeHours(params: {
  C: number;
  P: number;
  a1: number;
  aIso: number;
  p: number;
  speed: number;
}): { basic: number; modified: number } {
  const { C, P, a1, aIso, p, speed } = params;
  const revs = a1 * Math.pow(C / Math.max(P, 1e-9), p) * 1e6;
  const modRevs = a1 * aIso * Math.pow(C / Math.max(P, 1e-9), p) * 1e6;
  return {
    basic: revs / (60 * Math.max(speed, 1)),
    modified: modRevs / (60 * Math.max(speed, 1)),
  };
}

export function sizeLocatingFloatingStations(params: {
  config: BearingConfig;
  locatingType: BearingType;
  floatingType: BearingType;
  locatingDesignation?: string;
  floatingDesignation?: string;
  a1: number;
  aIso: number;
  tempFactor: number;
  criteriaBase: Omit<BearingSelectionCriteria, "bearingType" | "requiredDynamicRatingN">;
}): SizedStation[] {
  const {
    config,
    locatingType,
    floatingType,
    locatingDesignation,
    floatingDesignation,
    a1,
    aIso,
    tempFactor,
    criteriaBase,
  } = params;

  const Fr = Math.abs(config.radialLoad);
  const Fa = Math.abs(config.axialLoad);
  const speed = config.speed;
  const lifeHours = config.lifeHours;
  const sf = config.safetyFactor;

  const stationFr = config.stationRadialLoadsN;
  const locatingLoad =
    stationFr && stationFr.length >= 2
      ? { Fr: Math.abs(stationFr[0]!), Fa }
      : { Fr: Fr / 2, Fa };
  const floatingLoad =
    stationFr && stationFr.length >= 2
      ? { Fr: Math.abs(stationFr[1]!), Fa: 0 }
      : { Fr: Fr / 2, Fa: 0 };

  const buildStation = (
    role: StationRole,
    label: string,
    type: BearingType,
    loads: { Fr: number; Fa: number },
    designation?: string
  ): SizedStation => {
    const entry = designation ? findBearing(designation) : undefined;
    const C =
      (entry?.dynamicRatingN ?? config.dynamicLoadRatingN ?? config.material.dynamicRatingFactor) *
      tempFactor;
    const C0 =
      (entry?.staticRatingN ?? config.staticLoadRatingN ?? config.material.staticRatingFactor) *
      tempFactor;
    const stationConfig: BearingConfig = {
      ...config,
      radialLoad: loads.Fr,
      axialLoad: loads.Fa,
      bearingType: (entry?.type ?? type) as BearingType,
      arrangement: "single",
      catalogFactors: entry?.catalogFactors ?? config.catalogFactors,
    };
    const P = calculateBearingEquivalentLoad(stationConfig);
    const P0 = calculateStaticEquivalentLoad(loads.Fr, loads.Fa, stationConfig.bearingType);
    const p = lifeExponentFor(stationConfig.bearingType);
    const lives = stationLifeHours({ C, P, a1, aIso, p, speed });

    const requiredC =
      P * Math.pow((lifeHours * speed * 60) / (a1 * Math.max(aIso, 1e-6) * 1e6), 1 / p) * sf;

    const recommendation = bestCatalogBearing({
      ...criteriaBase,
      bearingType: type as CatalogBearingType,
      requiredDynamicRatingN: requiredC,
      requiredStaticRatingN: P0 * sf,
      speedRpm: speed,
      mountingRole: role === "floating" ? "non_locating" : "locating",
    });

    return {
      role,
      label,
      bearingType: stationConfig.bearingType,
      designation: entry?.designation ?? recommendation?.entry.designation,
      entry: entry ?? recommendation?.entry,
      radialLoad: loads.Fr,
      axialLoad: loads.Fa,
      equivalentLoad: P,
      staticEquivalentLoad: P0,
      dynamicRatingN: C,
      staticRatingN: C0,
      basicLifeHours: lives.basic,
      modifiedLifeHours: lives.modified,
      dynamicUtilization: P / Math.max(C, 1),
      staticSafetyFactor: C0 / Math.max(P0, 1e-9),
      recommendation,
    };
  };

  return [
    buildStation("locating", "Locating", locatingType, locatingLoad, locatingDesignation),
    buildStation("floating", "Floating", floatingType, floatingLoad, floatingDesignation),
  ];
}
