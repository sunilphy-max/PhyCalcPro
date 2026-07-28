/**
 * DIN 743-3 material strength at component diameter.
 */

import type { Din743MaterialEntry } from "@/data/catalogs/din743/materials";
import type { Din743HeatTreatment } from "@/data/catalogs/din743/types";
import { technologicalSizeFactorK1 } from "./sizeFactors";

export type Din743StrengthAtDiameter = {
  sigmaB_Pa: number;
  sigmaS_Pa: number;
  /** Reversed tension/compression fatigue of smooth bar at d */
  sigmaZDW_Pa: number;
  /** Reversed bending fatigue of smooth bar at d */
  sigmaBW_Pa: number;
  /** Reversed torsion fatigue of smooth bar at d */
  tauTW_Pa: number;
  K1_strength: number;
  K1_yield: number;
  dB_mm: number;
  materialId: string;
  designation: string;
  heatTreatment: Din743HeatTreatment;
};

export function din743StrengthAtDiameter(
  material: Din743MaterialEntry,
  deff_mm: number
): Din743StrengthAtDiameter {
  const K1s = technologicalSizeFactorK1(deff_mm, material.heatTreatment, false);
  const K1y = technologicalSizeFactorK1(deff_mm, material.heatTreatment, true);

  const sigmaB0 = material.sigmaB_MPa * 1e6;
  const sigmaS0 = material.sigmaS_MPa * 1e6;
  const sigmaB = sigmaB0 * K1s;
  const sigmaS = sigmaS0 * K1y;

  // DIN 743-3 defaults at dB≤7.5 mm: σzdW=0.45·σB (modern), σbW≈0.40·σB, τtW≈0.30·σB
  // Prefer tabulated when present, then scale with K1
  const sigmaBW0 = (material.sigmaBW_MPa ?? 0.4 * material.sigmaB_MPa) * 1e6;
  const tauTW0 = (material.tauTW_MPa ?? 0.3 * material.sigmaB_MPa) * 1e6;
  const sigmaZDW0 = 0.45 * sigmaB0;

  return {
    sigmaB_Pa: sigmaB,
    sigmaS_Pa: sigmaS,
    sigmaZDW_Pa: sigmaZDW0 * K1s,
    sigmaBW_Pa: sigmaBW0 * K1s,
    tauTW_Pa: tauTW0 * K1s,
    K1_strength: K1s,
    K1_yield: K1y,
    dB_mm: material.dB_mm,
    materialId: material.id,
    designation: material.designation,
    heatTreatment: material.heatTreatment,
  };
}
