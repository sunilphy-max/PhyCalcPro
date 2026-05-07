import { BeamConfig, BeamResult } from "./types";
import { maxAbs } from "../shared/math";

export function solveBeam(config: BeamConfig): BeamResult {
  const { length, loads, E, I, c, support } = config;

  const n = 80;

  const x: number[] = [];
  const shear: number[] = [];
  const moment: number[] = [];
  const deflection: number[] = [];
  const stress: number[] = [];

  // -----------------------------
  // SIMPLE SUPPORT REACTION MODEL
  // (still simplified but consistent)
  // -----------------------------
  let totalLoad = 0;

  for (const load of loads) {
    if (load.type === "point") totalLoad += load.value;
    if (load.type === "udl") totalLoad += load.value * (load.end - load.start);
  }

  const R = support === "simply_supported" ? totalLoad / 2 : totalLoad;

  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * length;
    x.push(xi);

    let V = 0;
    let M = 0;

    // -----------------------------
    // REACTION FORCE EFFECT
    // -----------------------------
    if (support !== "cantilever") {
      V += R;
      M += R * xi;
    }

    // -----------------------------
    // LOAD CONTRIBUTIONS
    // -----------------------------
    for (const load of loads) {
      // POINT LOAD
      if (load.type === "point") {
        const P = load.value;
        const a = load.position;

        if (xi >= a) {
          V -= P;
          M -= P * (xi - a);
        }
      }

      // UDL
      if (load.type === "udl") {
        const w = load.value;
        const a = load.start;
        const b = load.end;

        const L = b - a;

        if (xi >= a) {
          const effectiveLength = Math.min(xi, b) - a;

          V -= w * effectiveLength;
          M -= w * effectiveLength * (xi - (a + effectiveLength / 2));
        }
      }
    }

    shear.push(V);
    moment.push(M);

    // -----------------------------
    // DEFLECTION (SIMPLIFIED ENGINEERING APPROX)
    // -----------------------------
    const EI = E * I;
    const d = EI !== 0 ? M / EI : 0;

    deflection.push(d);

    // -----------------------------
    // STRESS
    // -----------------------------
    stress.push((M * c) / I);
  }

  return {
    x,
    shear,
    moment,
    deflection,
    stress,

    maxStress: maxAbs(stress),
    maxDeflection: maxAbs(deflection),
  };
}