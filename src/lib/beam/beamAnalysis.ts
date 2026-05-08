import type { Load, SupportType } from "./types";
import { solveReactions } from "./reactions";

export type BeamAnalysisResult = {
  x: number[];
  shear: number[];
  moment: number[];
};

export function analyzeBeam(
  length: number,
  loads: Load[],
  support: SupportType
): BeamAnalysisResult {

  const n = 300;

  const x: number[] = [];
  const shear: number[] = [];
  const moment: number[] = [];

  const { RA, RB } = solveReactions(length, loads, support);

  for (let i = 0; i < n; i++) {

    const xi = (i / (n - 1)) * length;

    let V = 0;
    let M = 0;

    // LEFT REACTION
    V += RA;
    M += RA * xi;

    // LOAD EFFECTS
    for (const load of loads) {

      // POINT LOAD
      if (load.type === "point") {

        if (xi >= load.position) {

          V -= load.value;

          M -= load.value * (xi - load.position);
        }
      }

      // UDL
      if (load.type === "udl") {

        if (xi >= load.start) {

          const active =
            Math.min(xi, load.end) - load.start;

          if (active > 0) {

            const W = load.value * active;

            V -= W;

            M -= W * (xi - (load.start + active / 2));
          }
        }
      }
    }

    // RIGHT REACTION
    if (support !== "cantilever" && xi >= length) {
      V += RB;
    }

    x.push(xi);
    shear.push(V);
    moment.push(M);
  }

  return {
    x,
    shear,
    moment,
  };
}