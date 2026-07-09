import type { HousingConfig, HousingResult } from "./types";
import { recommendBearingFits } from "@/lib/machine/bearings/fitsClearance";

const BOLT_SIZES = [
  { label: "M6", area: 20.1e-6, tensileArea: 14.2e-6 },
  { label: "M8", area: 36.6e-6, tensileArea: 26.8e-6 },
  { label: "M10", area: 58e-6, tensileArea: 42.4e-6 },
  { label: "M12", area: 84.3e-6, tensileArea: 61.2e-6 },
  { label: "M16", area: 157e-6, tensileArea: 115e-6 },
  { label: "M20", area: 245e-6, tensileArea: 179e-6 },
];

function mountArmFactor(style: HousingConfig["mountStyle"]): number {
  if (style === "flange") return 0.35;
  if (style === "foot") return 0.55;
  return 0.45;
}

export function solveHousingEngine(config: HousingConfig): HousingResult {
  const n = Math.max(2, Math.round(config.boltCount));
  const dBolt = Math.max(config.boltCircleDiameter, 1e-6);
  const arm = mountArmFactor(config.mountStyle) * dBolt;
  const radial = Math.max(0, config.radialLoad);
  const axial = Math.abs(config.axialLoad);
  const moment = radial * arm + axial * config.boreDiameter * 0.5;
  const sectionHeight = Math.max(config.boreDiameter * 1.6, 0.04);
  const sectionWidth = Math.max(config.boreDiameter * 1.2, 0.03);
  const I = (sectionWidth * sectionHeight ** 3) / 12;
  const c = sectionHeight / 2;
  const bodyStress = (moment * c) / Math.max(I, 1e-12);
  const bodySf = config.yieldStress / Math.max(bodyStress, 1e-6);
  const boltTensionPerBolt = moment / (n * dBolt * 0.5);
  const boltShearPerBolt = Math.hypot(radial, axial) / n;
  const E = 210e9;
  const housingDeflection = (moment * arm ** 2) / (2 * E * Math.max(I, 1e-12));
  const stiffnessEstimate = radial / Math.max(housingDeflection, 1e-9);

  let recommendedBoltSize = "M12";
  for (const bolt of BOLT_SIZES) {
    const tensileStress = boltTensionPerBolt / bolt.tensileArea;
    const shearStress = boltShearPerBolt / bolt.area;
    const vonMises = Math.sqrt(tensileStress ** 2 + 3 * shearStress ** 2);
    if (vonMises <= 0.7 * config.yieldStress) {
      recommendedBoltSize = bolt.label;
      break;
    }
    recommendedBoltSize = bolt.label;
  }

  const boreMm = config.boreDiameter * 1000;
  const fitRecommendation = recommendBearingFits({
    boreMm,
    radialLoadN: radial,
    speedRpm: config.speed,
    mountingRole: config.mountStyle === "foot" ? "locating" : "either",
    clearance: config.bearingClearance ?? "CN",
    operatingTempDeltaC: config.operatingTempDeltaC ?? 35,
  });

  const isSafe = bodySf >= 1.5 && boltTensionPerBolt > 0;
  const designStatus: HousingResult["designStatus"] =
    bodySf >= 2 ? "safe" : bodySf >= 1.5 ? "warning" : "critical";

  return {
    bodyStress,
    bodySafetyFactor: bodySf,
    boltTensionPerBolt,
    boltShearPerBolt,
    housingDeflection,
    stiffnessEstimate,
    recommendedBoltSize,
    isSafe,
    designStatus,
    governingFailureMode:
      bodySf < 1.5 ? "Housing body bending stress" : "Bolt combined tension and shear",
    fitRecommendation,
    recommendedShaftFit: fitRecommendation.shaftFit,
    recommendedHousingFit: fitRecommendation.housingFit,
    estimatedOperatingClearanceUm: fitRecommendation.estimatedOperatingClearanceUm,
  };
}

export function designHousingBolts(
  config: Omit<HousingConfig, "boltCount" | "boltCircleDiameter">,
  boltCounts = [4, 6, 8]
): { best: (HousingResult & { boltCount: number; boltCircleDiameter: number }) | null } {
  const diameters = [config.boreDiameter * 2.2, config.boreDiameter * 2.6, config.boreDiameter * 3];
  let best: (HousingResult & { boltCount: number; boltCircleDiameter: number }) | null = null;
  let bestUtil = Infinity;
  for (const boltCount of boltCounts) {
    for (const boltCircleDiameter of diameters) {
      const res = solveHousingEngine({ ...config, boltCount, boltCircleDiameter });
      const util = res.designStatus === "safe" ? 0.7 : res.designStatus === "warning" ? 1 : 1.4;
      if (util < bestUtil) {
        bestUtil = util;
        best = { ...res, boltCount, boltCircleDiameter };
      }
    }
  }
  return { best };
}
