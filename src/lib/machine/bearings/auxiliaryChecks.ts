/**
 * Minimum load and friction torque screening (SKF-inspired Mrr / Msl).
 * Transparent screening — not the full SKF four-component model.
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType } from "./types";

/** Minimum radial load to avoid skidding (N) — SKF indicative for ball bearings. */
export function minimumRadialLoadN(params: {
  dynamicRatingN: number;
  speedRpm: number;
  bearingType: BearingType;
}): number {
  const { dynamicRatingN, speedRpm, bearingType } = params;
  const n = Math.max(speedRpm, 1);
  if (isRollerBearingType(bearingType)) {
    return 0.01 * dynamicRatingN;
  }
  if (bearingType === "angular_contact") {
    return 0.02 * dynamicRatingN * Math.pow(n / 1000, 0.5);
  }
  return 0.0045 * dynamicRatingN * Math.pow(n / 1000, 1.5);
}

export type FrictionEstimate = {
  frictionTorqueNm: number;
  powerLossW: number;
  frictionCoefficient: number;
  /** Rolling friction torque (N·m). */
  rollingTorqueNm: number;
  /** Sliding / seal drag torque (N·m). */
  slidingTorqueNm: number;
  /** Grease churning factor applied (1 = none). */
  greaseChurnFactor: number;
  model: "skf_mrr_msl_screening";
};

/**
 * SKF-inspired screening: M ≈ Mrr + Msl
 * Mrr ≈ f1 · (P)^β · dm · G  (load-dependent rolling)
 * Msl ≈ seal drag + (optional) grease fill churning at low n·dm
 */
export function estimateFriction(params: {
  equivalentLoadN: number;
  meanDiameterMm: number;
  speedRpm: number;
  bearingType: BearingType;
  sealed?: boolean;
  dynamicRatingN?: number;
  lubricantType?: "oil" | "grease" | "none";
}): FrictionEstimate {
  const dmMm = Math.max(params.meanDiameterMm, 1);
  const dm = dmMm / 1000;
  const P = Math.max(params.equivalentLoadN, 1);
  const C = Math.max(params.dynamicRatingN ?? P * 3, P);
  const roller = isRollerBearingType(params.bearingType);

  // Rolling term — f1 · (P)^β · dm (N·mm → N·m)
  const f1 = roller ? 0.00045 : 0.0003;
  const beta = roller ? 0.55 : 0.6;
  const loadRatio = Math.min(Math.max(P / C, 0.02), 1.5);
  const Mrr = f1 * Math.pow(P, beta) * Math.pow(loadRatio, 0.15) * dm;

  // Sliding / seal drag
  const muSl = roller ? 0.0008 : 0.0005;
  let Msl = 0.5 * muSl * P * dm;
  if (params.sealed) {
    // Contact seal drag scales lightly with dm and speed
    const sealDrag = 0.00012 * dmMm * (1 + params.speedRpm / 10000);
    Msl += sealDrag;
  }

  // Grease churning at low n·dm (SKF-inspired fill factor)
  let greaseChurnFactor = 1;
  if (params.lubricantType === "grease") {
    const ndm = params.speedRpm * dmMm;
    if (ndm < 20000) {
      greaseChurnFactor = 1.35;
    } else if (ndm < 50000) {
      greaseChurnFactor = 1.15;
    } else {
      greaseChurnFactor = 1.05;
    }
  }

  const M = (Mrr + Msl) * greaseChurnFactor;
  const omega = (2 * Math.PI * params.speedRpm) / 60;
  const powerLoss = M * omega;
  const muEff = (2 * M) / Math.max(P * dm, 1e-12);

  return {
    frictionTorqueNm: M,
    powerLossW: powerLoss,
    frictionCoefficient: muEff,
    rollingTorqueNm: Mrr * greaseChurnFactor,
    slidingTorqueNm: Msl * greaseChurnFactor,
    greaseChurnFactor,
    model: "skf_mrr_msl_screening",
  };
}
