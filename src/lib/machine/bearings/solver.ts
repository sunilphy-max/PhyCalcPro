import type { BearingConfig, BearingResult, BearingType, BearingReliability, LubricationClass } from "./types";
import { calculateStaticEquivalentLoad, staticSafetyFactor } from "./staticLoad";

const bearingCoefficients: Record<BearingType, { X: number; Y: number; e: number }> = {
  deep_groove: { X: 0.56, Y: 1.6, e: 0.3 },
  angular_contact: { X: 0.35, Y: 0.57, e: 1.14 },
  cylindrical_roller: { X: 1.0, Y: 0.0, e: Infinity },
};

const A1_FACTORS: Record<BearingReliability, number> = {
  90: 1.0,
  95: 0.64,
  96: 0.55,
  97: 0.47,
  98: 0.37,
  99: 0.25,
};

/** Simplified a_ISO screening — full ISO 281 uses κ, ηc, eC, etc. */
const A_ISO: Record<LubricationClass, number> = {
  poor: 0.15,
  average: 0.5,
  good: 1.0,
};

export function lifeExponentFor(type: BearingType): number {
  return type === "cylindrical_roller" ? 10 / 3 : 3;
}

export function calculateBearingEquivalentLoad(config: BearingConfig): number {
  const Fr = Math.abs(config.radialLoad);
  let Fa = Math.abs(config.axialLoad);
  const arrangement = config.arrangement ?? "single";
  if (arrangement === "back_to_back" || arrangement === "face_to_face") {
    Fa = Fa / 2;
  } else if (arrangement === "tandem") {
    Fa = Fa * 0.5;
  }
  const { X, Y, e } = bearingCoefficients[config.bearingType];
  const FaOverFr = Fr > 0 ? Fa / Fr : Number.POSITIVE_INFINITY;

  if (!(FaOverFr > e)) return Fr;
  return Math.max(X * Fr + Y * Fa, Fr);
}

function determineGoverningMode(params: {
  lifeUtil: number;
  dynamicUtil: number;
  staticSf: number;
  targetStaticSf: number;
  speedMargin: number | null;
  targetSpeedMargin: number;
}): string {
  const issues: { label: string; severity: number }[] = [];

  if (params.lifeUtil > 1) {
    issues.push({ label: "Rating life L10", severity: params.lifeUtil });
  }
  if (params.dynamicUtil > 1) {
    issues.push({ label: "Dynamic load P/C", severity: params.dynamicUtil });
  }
  if (params.staticSf < params.targetStaticSf) {
    issues.push({ label: "Static load C₀/P₀", severity: params.targetStaticSf / params.staticSf });
  }
  if (params.speedMargin != null && params.speedMargin < params.targetSpeedMargin) {
    issues.push({ label: "Speed limit", severity: params.targetSpeedMargin / params.speedMargin });
  }

  if (issues.length === 0) return "All checks pass";
  issues.sort((a, b) => b.severity - a.severity);
  return issues[0]!.label;
}

export function solveBearingDesign(config: BearingConfig): BearingResult {
  const equivalentLoad = calculateBearingEquivalentLoad(config);
  const staticEquivalentLoad = calculateStaticEquivalentLoad(
    config.radialLoad,
    config.axialLoad,
    config.bearingType
  );
  const p = lifeExponentFor(config.bearingType);
  const reliability = config.reliabilityPercent ?? 90;
  const a1 = A1_FACTORS[reliability] ?? 1.0;
  const lubrication = config.lubricationClass;
  const aIso = lubrication ? A_ISO[lubrication] : 1;

  const speed = Math.max(config.speed, 1e-9);
  const targetStaticSf = config.targetStaticSafetyFactor ?? 1.0;
  const targetSpeedMargin = config.targetSpeedMargin ?? 1.0;

  const requiredRevolutions = config.lifeHours * speed * 60;
  // Required C sized on basic rating life (a1 only); modified life reported separately.
  const requiredDynamicRating =
    equivalentLoad *
    Math.pow(requiredRevolutions / (a1 * 1e6), 1 / p) *
    config.safetyFactor;

  const requiredStaticRating = staticEquivalentLoad * targetStaticSf * config.safetyFactor;

  const dynamicLoadRatingN =
    config.dynamicLoadRatingN ?? config.material.dynamicRatingFactor;
  const staticLoadRatingN =
    config.staticLoadRatingN ?? config.material.staticRatingFactor;

  const expectedLifeRevolutions =
    equivalentLoad > 0 && dynamicLoadRatingN > 0
      ? a1 * Math.pow(dynamicLoadRatingN / equivalentLoad, p) * 1e6
      : 0;

  const expectedLife =
    expectedLifeRevolutions > 0 ? expectedLifeRevolutions / (60 * speed) : 0;

  const modifiedLifeRevolutions =
    equivalentLoad > 0 && dynamicLoadRatingN > 0
      ? a1 * aIso * Math.pow(dynamicLoadRatingN / equivalentLoad, p) * 1e6
      : 0;

  const modifiedLife =
    modifiedLifeRevolutions > 0 ? modifiedLifeRevolutions / (60 * speed) : 0;

  const dynamicUtilization = equivalentLoad / Math.max(dynamicLoadRatingN, 1);
  const staticSf = staticSafetyFactor(staticLoadRatingN, staticEquivalentLoad);
  const limitingSpeedRpm = config.limitingSpeedRpm ?? null;
  const speedMargin =
    limitingSpeedRpm != null && limitingSpeedRpm > 0
      ? limitingSpeedRpm / speed
      : null;

  const lifeUtilization = expectedLife > 0 ? config.lifeHours / expectedLife : Infinity;

  let designStatus: BearingResult["designStatus"] = "safe";
  if (
    lifeUtilization > 1 ||
    dynamicUtilization > 1 / Math.max(config.safetyFactor, 1) ||
    staticSf < targetStaticSf ||
    (speedMargin != null && speedMargin < targetSpeedMargin)
  ) {
    designStatus = "critical";
  } else if (
    lifeUtilization > 0.85 ||
    dynamicUtilization > 0.85 ||
    staticSf < targetStaticSf * 1.2 ||
    (speedMargin != null && speedMargin < targetSpeedMargin * 1.2)
  ) {
    designStatus = "warning";
  }

  const governingFailureMode = determineGoverningMode({
    lifeUtil: lifeUtilization,
    dynamicUtil: dynamicUtilization,
    staticSf,
    targetStaticSf,
    speedMargin,
    targetSpeedMargin,
  });

  return {
    radialLoad: config.radialLoad,
    axialLoad: config.axialLoad,
    equivalentLoad,
    staticEquivalentLoad,
    requiredDynamicRating,
    requiredStaticRating,
    expectedLife,
    modifiedLife,
    expectedLifeRevolutions,
    dynamicLoadRatingN,
    staticLoadRatingN,
    limitingSpeedRpm,
    lifeExponent: p,
    a1,
    aIso,
    dynamicUtilization,
    staticSafetyFactor: staticSf,
    speedMargin,
    lifeUtilization,
    safetyFactor: config.safetyFactor,
    bearingType: config.bearingType,
    designation: config.designation,
    geometry: null,
    designStatus,
    isSafe: designStatus === "safe",
    governingFailureMode,
    material: config.material,
  };
}
