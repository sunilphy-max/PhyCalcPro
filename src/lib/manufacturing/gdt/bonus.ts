import type { FeatureOfSize, MaterialCondition } from "./types";

/** MMC / LMC absolute sizes for a feature of size. */
export function materialBoundaries(feature: FeatureOfSize): { mmc: number; lmc: number } {
  if (feature.isInternal) {
    return { mmc: feature.lowerLimit, lmc: feature.upperLimit };
  }
  return { mmc: feature.upperLimit, lmc: feature.lowerLimit };
}

/** Full size tolerance width |USL − LSL|. */
export function sizeToleranceWidth(feature: FeatureOfSize): number {
  return Math.abs(feature.upperLimit - feature.lowerLimit);
}

/**
 * Bonus tolerance for a geometric callout at MMC or LMC.
 * RFS → 0. For worst-case stack analysis, pass the size that maximizes bonus
 * (LMC when MMC is specified, MMC when LMC is specified).
 */
export function geometricBonus(
  feature: FeatureOfSize,
  materialCondition: MaterialCondition,
  actualSize: number
): number {
  if (materialCondition === "RFS") return 0;
  const { mmc, lmc } = materialBoundaries(feature);
  if (materialCondition === "MMC") {
    return Math.max(0, Math.abs(actualSize - mmc));
  }
  // LMC: bonus as feature departs from LMC toward MMC
  return Math.max(0, Math.abs(actualSize - lmc));
}

/**
 * Size to use for bonus when analyzing worst-case geometric allowance.
 * MMC callout → evaluate at LMC (max bonus). LMC callout → evaluate at MMC.
 */
export function worstCaseBonusSize(
  feature: FeatureOfSize,
  materialCondition: MaterialCondition
): number {
  const { mmc, lmc } = materialBoundaries(feature);
  if (materialCondition === "MMC") return lmc;
  if (materialCondition === "LMC") return mmc;
  return feature.nominal;
}

/**
 * Datum feature shift available when a datum is referenced at MMC/LMC.
 * Max shift equals the size tolerance (full departure from material boundary).
 */
export function datumShiftBonus(
  datumFeature: FeatureOfSize,
  materialCondition: MaterialCondition | undefined,
  actualSize: number | undefined,
  useWorstCase: boolean
): number {
  if (!materialCondition || materialCondition === "RFS") return 0;
  const size =
    actualSize ??
    (useWorstCase ? worstCaseBonusSize(datumFeature, materialCondition) : datumFeature.nominal);
  return geometricBonus(datumFeature, materialCondition, size);
}
