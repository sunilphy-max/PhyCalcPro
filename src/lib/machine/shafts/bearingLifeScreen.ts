/**
 * In-worksheet bearing life screening from shaft FEM reactions (ISO 281 basic L10).
 */

import type { BearingReaction, ShaftBearingLifeScreen } from "./types";

/** Rough deep-groove dynamic capacity estimate vs bore (N) — catalog-order screening only. */
export function estimateDeepGrooveC(shaftDiameterM: number): number {
  const dMm = Math.max(shaftDiameterM * 1000, 5);
  // Empirical power fit spanning ~6201–6410 class ratings
  return 1200 * Math.pow(dMm / 12, 1.85);
}

/** Required dynamic rating C for target L10h at speed n (ball bearing p=3). */
export function requiredDynamicRating(params: {
  radialForceN: number;
  speedRpm: number;
  lifeHours: number;
  lifeExponent?: number;
}): number {
  const P = Math.max(params.radialForceN, 1);
  const n = Math.max(params.speedRpm, 1);
  const Lh = Math.max(params.lifeHours, 1);
  const p = params.lifeExponent ?? 3;
  const L10rev = (Lh * 60 * n) / 1e6;
  return P * Math.pow(L10rev, 1 / p);
}

export function basicL10Hours(params: {
  dynamicRatingN: number;
  radialForceN: number;
  speedRpm: number;
  lifeExponent?: number;
}): number {
  const P = Math.max(params.radialForceN, 1);
  const C = Math.max(params.dynamicRatingN, 1);
  const n = Math.max(params.speedRpm, 1);
  const p = params.lifeExponent ?? 3;
  const L10million = Math.pow(C / P, p);
  return (L10million * 1e6) / (60 * n);
}

export function screenBearingLifeFromReactions(params: {
  reactions: BearingReaction[];
  slopes: { position: number; slopeRad: number }[];
  shaftDiameter: number;
  operatingRpm: number;
  targetLifeHours?: number;
}): ShaftBearingLifeScreen[] {
  const targetLifeHours = params.targetLifeHours ?? 20_000;
  const rpm = params.operatingRpm;

  return params.reactions.map((r) => {
    const radialForce = Math.hypot(r.forceY, r.forceZ);
    const slope =
      params.slopes.find((s) => Math.abs(s.position - r.position) < 1e-9)?.slopeRad ??
      params.slopes.reduce(
        (best, s) =>
          Math.abs(s.position - r.position) < Math.abs(best.position - r.position) ? s : best,
        params.slopes[0] ?? { position: r.position, slopeRad: 0 }
      ).slopeRad;

    if (radialForce < 1 || rpm <= 0) {
      return {
        position: r.position,
        radialForce,
        slopeRad: slope,
        requiredDynamicRating: 0,
        estimatedDynamicRating: estimateDeepGrooveC(params.shaftDiameter),
        estimatedL10Hours: null,
        targetLifeHours,
        status: "n/a" as const,
      };
    }

    const required = requiredDynamicRating({
      radialForceN: radialForce,
      speedRpm: rpm,
      lifeHours: targetLifeHours,
    });
    const estimatedC = estimateDeepGrooveC(params.shaftDiameter);
    const L10 = basicL10Hours({
      dynamicRatingN: estimatedC,
      radialForceN: radialForce,
      speedRpm: rpm,
    });
    const status: ShaftBearingLifeScreen["status"] =
      L10 >= targetLifeHours ? "safe" : L10 >= targetLifeHours * 0.5 ? "warning" : "critical";

    return {
      position: r.position,
      radialForce,
      slopeRad: slope,
      requiredDynamicRating: required,
      estimatedDynamicRating: estimatedC,
      estimatedL10Hours: L10,
      targetLifeHours,
      status,
    };
  });
}
