/**
 * Grease / oil relubrication interval screening (SKF-style).
 * tf based on speed factor A = n·dm, temperature, load ratio, contamination.
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType, ContaminationLevel, LubricantType } from "./types";

export type RelubricationInput = {
  speedRpm: number;
  meanDiameterMm: number;
  operatingTempC: number;
  /** P/C dynamic utilization. */
  dynamicUtilization: number;
  bearingType: BearingType;
  lubricantType?: LubricantType;
  contamination?: ContaminationLevel;
  sealed?: boolean;
};

export type RelubricationResult = {
  /** Recommended relubrication / grease life interval (hours). */
  intervalHours: number;
  /** Speed factor A = n · dm (mm·rpm). */
  speedFactorNdm: number;
  temperatureFactor: number;
  loadFactor: number;
  contaminationFactor: number;
  status: "ok" | "frequent" | "critical";
  note: string;
};

function baseIntervalHours(ndm: number, roller: boolean): number {
  // SKF grease life diagram screening (hours)
  const scale = roller ? 0.7 : 1;
  if (ndm <= 20000) return 45000 * scale;
  if (ndm <= 100000) return 45000 * scale * Math.pow(20000 / ndm, 1.4);
  if (ndm <= 300000) return 8000 * scale * Math.pow(100000 / ndm, 1.2);
  return Math.max(500 * scale * Math.pow(300000 / ndm, 1.1), 50);
}

function temperatureFactor(tempC: number): number {
  if (tempC <= 70) return 1;
  // Halve interval every +15 °C above 70 °C (SKF rule of thumb)
  return Math.pow(0.5, (tempC - 70) / 15);
}

function loadFactor(pOverC: number): number {
  if (pOverC <= 0.05) return 1;
  if (pOverC <= 0.1) return 0.7;
  if (pOverC <= 0.15) return 0.45;
  return 0.25;
}

function contaminationFactor(level?: ContaminationLevel): number {
  switch (level) {
    case "extreme_clean":
    case "high_clean":
      return 1.2;
    case "normal_clean":
      return 1;
    case "slight_contamination":
      return 0.7;
    case "typical_contamination":
      return 0.4;
    case "heavy_contamination":
      return 0.2;
    default:
      return 1;
  }
}

/**
 * Relubrication interval tf (hours). For oil bath / circulating oil returns a large
 * “check / change” interval rather than grease replenishment.
 */
export function calculateRelubricationInterval(input: RelubricationInput): RelubricationResult {
  const n = Math.max(input.speedRpm, 1);
  const dm = Math.max(input.meanDiameterMm, 1);
  const ndm = n * dm;
  const roller = isRollerBearingType(input.bearingType);
  const sealed = input.sealed === true;
  const isGrease = input.lubricantType === "grease" || input.lubricantType == null || sealed;

  let tf = baseIntervalHours(ndm, roller);
  const fT = temperatureFactor(input.operatingTempC);
  const fL = loadFactor(input.dynamicUtilization);
  const fC = contaminationFactor(input.contamination);
  tf *= fT * fL * fC;

  if (sealed && isGrease) {
    // Sealed-for-life: treat as grease life, not replenishment
    tf *= 1.5;
  }
  if (input.lubricantType === "oil") {
    // Oil change / filter service interval (much longer than grease)
    tf = Math.max(tf * 4, 8000);
  }
  if (input.lubricantType === "none") {
    tf = 0;
  }

  tf = Math.round(tf);

  let status: RelubricationResult["status"] = "ok";
  if (tf > 0 && tf < 500) status = "critical";
  else if (tf > 0 && tf < 2000) status = "frequent";

  const note =
    input.lubricantType === "none"
      ? "No lubricant model — set oil/grease to estimate relubrication."
      : input.lubricantType === "oil"
        ? `Oil service interval ≈ ${tf.toLocaleString()} h (screening). Verify filtration and oil analysis.`
        : sealed
          ? `Sealed grease life ≈ ${tf.toLocaleString()} h — typically non-relubricatable; replace bearing at end of life.`
          : `Relubricate every ≈ ${tf.toLocaleString()} h (SKF-style screening from n·dm, temp, P/C, cleanliness).`;

  return {
    intervalHours: tf,
    speedFactorNdm: ndm,
    temperatureFactor: fT,
    loadFactor: fL,
    contaminationFactor: fC,
    status,
    note,
  };
}
