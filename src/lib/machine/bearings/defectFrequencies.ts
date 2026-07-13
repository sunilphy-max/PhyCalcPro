/**
 * Bearing defect / fault frequencies (BPFO, BPFI, BSF, FTF).
 * Standard kinematic formulas; geometry from catalog or family screening defaults.
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType } from "./types";

export type DefectFrequenciesInput = {
  speedRpm: number;
  bearingType: BearingType;
  boreMm: number;
  outerDiameterMm: number;
  /** Number of rolling elements. */
  rollingElementCount?: number;
  /** Ball/roller diameter (mm). */
  rollingElementDiameterMm?: number;
  /** Contact angle (deg). */
  contactAngleDeg?: number;
};

export type DefectFrequenciesResult = {
  shaftHz: number;
  /** Ball pass frequency outer race (Hz). */
  bpfoHz: number;
  /** Ball pass frequency inner race (Hz). */
  bpfiHz: number;
  /** Ball spin frequency (Hz). */
  bsfHz: number;
  /** Fundamental train frequency / cage (Hz). */
  ftfHz: number;
  /** Orders relative to shaft frequency. */
  bpfoOrder: number;
  bpfiOrder: number;
  bsfOrder: number;
  ftfOrder: number;
  rollingElementCount: number;
  pitchDiameterMm: number;
  ballDiameterMm: number;
  contactAngleDeg: number;
  note: string;
};

/** Family screening defaults for Z and Bd/Pd when catalog geometry absent. */
export function defaultDefectGeometry(bearingType: BearingType, boreMm: number, odMm: number): {
  Z: number;
  bdOverPd: number;
  contactAngleDeg: number;
} {
  const pd = (boreMm + odMm) / 2;
  // Rough size class from pitch diameter
  const sizeClass = pd < 40 ? 0 : pd < 80 ? 1 : 2;

  if (
    bearingType === "thrust_cylindrical_roller" ||
    bearingType === "thrust_spherical_roller" ||
    bearingType === "thrust_ball"
  ) {
    return {
      Z: 12 + sizeClass * 4,
      bdOverPd: bearingType === "thrust_ball" ? 0.25 : 0.18,
      contactAngleDeg: 90,
    };
  }

  if (isRollerBearingType(bearingType)) {
    if (bearingType === "tapered_roller") {
      return { Z: 14 + sizeClass * 3, bdOverPd: 0.2, contactAngleDeg: 15 };
    }
    if (bearingType === "spherical_roller") {
      return { Z: 16 + sizeClass * 4, bdOverPd: 0.16, contactAngleDeg: 10 };
    }
    if (bearingType === "needle_roller") {
      return { Z: 20 + sizeClass * 6, bdOverPd: 0.08, contactAngleDeg: 0 };
    }
    return { Z: 12 + sizeClass * 4, bdOverPd: 0.18, contactAngleDeg: 0 };
  }

  if (bearingType === "angular_contact") {
    return { Z: 11 + sizeClass * 3, bdOverPd: 0.22, contactAngleDeg: 40 };
  }
  if (bearingType === "self_aligning_ball") {
    return { Z: 12 + sizeClass * 2, bdOverPd: 0.2, contactAngleDeg: 0 };
  }
  return { Z: 8 + sizeClass * 2, bdOverPd: 0.25, contactAngleDeg: 0 };
}

/**
 * Classic formulas (inner ring rotating):
 * FTF = (fr/2)·(1 − (Bd/Pd)·cosα)
 * BPFO = (n/2)·fr·(1 − (Bd/Pd)·cosα)
 * BPFI = (n/2)·fr·(1 + (Bd/Pd)·cosα)
 * BSF  = (Pd/(2·Bd))·fr·(1 − ((Bd/Pd)·cosα)²)
 */
export function calculateDefectFrequencies(
  input: DefectFrequenciesInput
): DefectFrequenciesResult {
  const fr = Math.max(input.speedRpm, 0) / 60; // shaft Hz
  const d = Math.max(input.boreMm, 1);
  const D = Math.max(input.outerDiameterMm, d + 1);
  const pd = (d + D) / 2;
  const defaults = defaultDefectGeometry(input.bearingType, d, D);
  const Z = Math.max(3, Math.round(input.rollingElementCount ?? defaults.Z));
  const bdOverPd = input.rollingElementDiameterMm
    ? input.rollingElementDiameterMm / pd
    : defaults.bdOverPd;
  const Bd = bdOverPd * pd;
  const alphaDeg = input.contactAngleDeg ?? defaults.contactAngleDeg;
  const cosA = Math.cos((alphaDeg * Math.PI) / 180);
  const ratio = Math.min(0.5, Math.max(0.02, bdOverPd * cosA));

  const ftfOrder = 0.5 * (1 - ratio);
  const bpfoOrder = (Z / 2) * (1 - ratio);
  const bpfiOrder = (Z / 2) * (1 + ratio);
  const bsfOrder = (pd / (2 * Bd)) * (1 - ratio * ratio);

  return {
    shaftHz: fr,
    bpfoHz: bpfoOrder * fr,
    bpfiHz: bpfiOrder * fr,
    bsfHz: bsfOrder * fr,
    ftfHz: ftfOrder * fr,
    bpfoOrder,
    bpfiOrder,
    bsfOrder,
    ftfOrder,
    rollingElementCount: Z,
    pitchDiameterMm: pd,
    ballDiameterMm: Bd,
    contactAngleDeg: alphaDeg,
    note: "Kinematic defect frequencies from screening geometry (Z, Bd/Pd). Verify against OEM datasheet for condition monitoring.",
  };
}
