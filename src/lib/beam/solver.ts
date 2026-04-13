import { BeamConfig, BeamResult } from "./types";
import { maxAbs } from "../shared/math";

export function solveBeam(config: BeamConfig): BeamResult {
  const { length, loads, E, I, c, support } = config;

  const n = 60;

  const x: number[] = [];
  const shear: number[] = [];
  const moment: number[] = [];
  const deflection: number[] = [];
  const stress: number[] = [];

  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * length;
    x.push(xi);

    let V = 0;
    let M = 0;

    for (const load of loads) {
      // POINT LOAD
      if (load.type === "point") {
        const P = load.value;
        const a = load.position;

        if (support === "cantilever") {
          if (xi <= a) {
            V += P;
            M += P * (a - xi);
          }
        } else {
          if (xi < a) {
            V += P / 2;
            M += (P * xi) / 2;
          } else {
            V -= P / 2;
            M += (P * (length - xi)) / 2;
          }
        }
      }

      // UDL
      if (load.type === "udl") {
        const w = load.value;
        const a = load.start;
        const b = load.end;

        if (xi >= a && xi <= b) {
          const L = b - a;
          const xRel = xi - a;

          if (support === "cantilever") {
            V += w * (b - xi);
            M += (w * (b - xi) * (b - xi)) / 2;
          } else {
            V += w * (L / 2 - xRel);
            M += (w * xRel * (L - xRel)) / 2;
          }
        }
      }
    }

    shear.push(V);
    moment.push(M);

    const d = M / (E * I);
    deflection.push(d);

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