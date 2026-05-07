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
  // SAFETY CHECKS (IMPORTANT)
  // -----------------------------
  const safeLength = Number.isFinite(length) && length > 0 ? length : 1;
  const safeE = Number.isFinite(E) ? E : 1;
  const safeI = Number.isFinite(I) && I !== 0 ? I : 1e-9;
  const safeC = Number.isFinite(c) ? c : 0;

  // -----------------------------
  // TOTAL LOAD
  // -----------------------------
  let totalLoad = 0;

  for (const load of loads) {
    if (load.type === "point") {
      totalLoad += Number.isFinite(load.value) ? load.value : 0;
    }

    if (load.type === "udl") {
      const w = Number.isFinite(load.value) ? load.value : 0;
      const a = Number.isFinite(load.start) ? load.start : 0;
      const b = Number.isFinite(load.end) ? load.end : 0;

      totalLoad += w * Math.max(0, b - a);
    }
  }

  const R = support === "simply_supported" ? totalLoad / 2 : totalLoad;

  // -----------------------------
  // MAIN LOOP
  // -----------------------------
  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * safeLength;

    x.push(xi);

    let V = 0;
    let M = 0;

    // -----------------------------
    // REACTION EFFECT
    // -----------------------------
    if (support !== "cantilever") {
      V += R;
      M += R * xi;
    }

    // -----------------------------
    // LOADS
    // -----------------------------
    for (const load of loads) {

      // POINT LOAD
      if (load.type === "point") {
        const P = Number.isFinite(load.value) ? load.value : 0;
        const a = Number.isFinite(load.position) ? load.position : 0;

        if (xi >= a) {
          V -= P;
          M -= P * (xi - a);
        }
      }

      // UDL
      if (load.type === "udl") {
        const w = Number.isFinite(load.value) ? load.value : 0;
        const a = Number.isFinite(load.start) ? load.start : 0;
        const b = Number.isFinite(load.end) ? load.end : 0;

        const start = Math.max(a, 0);
        const end = Math.min(b, safeLength);

        if (xi >= start) {
          const effLen = Math.min(xi, end) - start;

          if (effLen > 0) {
            V -= w * effLen;
            M -= w * effLen * (xi - (start + effLen / 2));
          }
        }
      }
    }

    // -----------------------------
    // SAFETY CLEANUP
    // -----------------------------
    V = Number.isFinite(V) ? V : 0;
    M = Number.isFinite(M) ? M : 0;

    shear.push(V);
    moment.push(M);

    // -----------------------------
    // DEFLECTION (SIMPLIFIED MODEL)
    // -----------------------------
    const EI = safeE * safeI;
    const d = EI !== 0 ? M / EI : 0;

    deflection.push(Number.isFinite(d) ? d : 0);

    // -----------------------------
    // STRESS (BENDING)
    // σ = M*c/I
    // -----------------------------
    const sigma = (M * safeC) / safeI;
    stress.push(Number.isFinite(sigma) ? sigma : 0);
  }

  // -----------------------------
  // OUTPUT
  // -----------------------------
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