/**
 * DIN 743-2 surface roughness KF and surface conditioning KV factors.
 */

import type { Din743SurfaceProcess } from "./types";

/**
 * Surface roughness factor KFσ (tension/bending) per DIN 743-2 form:
 *   KFσ = 1 − 0.22·log10(Rz)·(log10(σB/20) − 1)   with σB in N/mm², Rz in µm
 * KFτ = 0.575 + 0.425·KFσ
 */
export function surfaceRoughnessFactorKF(params: {
  Rz_um: number;
  sigmaB_MPa: number;
}): { KFsigma: number; KFtau: number } {
  const Rz = Math.max(params.Rz_um, 0.4);
  const sigmaB = Math.min(Math.max(params.sigmaB_MPa, 200), 2000);
  const KFsigma = Math.min(
    1,
    Math.max(0.4, 1 - 0.22 * Math.log10(Rz) * (Math.log10(sigmaB / 20) - 1))
  );
  const KFtau = 0.575 + 0.425 * KFsigma;
  return { KFsigma, KFtau };
}

/** Map PhyCalcPro surface finish labels to typical Rz (µm). */
export function rzFromSurfaceFinish(
  finish: "ground" | "machined" | "hot-rolled" | "as-forged" | string
): number {
  switch (finish) {
    case "ground":
      return 1.6;
    case "machined":
      return 6.3;
    case "hot-rolled":
      return 25;
    case "as-forged":
      return 50;
    default:
      return 6.3;
  }
}

/**
 * Surface conditioning / residual stress factor KV (DIN 743-2 Table 4 guidance).
 * Values > 1 improve fatigue capacity (compressive residual stress).
 */
export function surfaceConditioningKV(process: Din743SurfaceProcess): number {
  switch (process) {
    case "rolled":
      return 1.15;
    case "shot_peened":
      return 1.2;
    case "nitrided_surface":
      return 1.25;
    case "induction_surface":
      return 1.2;
    default:
      return 1;
  }
}
