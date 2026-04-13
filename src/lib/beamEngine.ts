// ==============================
// BEAM ENGINE — STEP 1
// ==============================

export type Load =
  | { type: "point"; value: number; position: number }
  | { type: "udl"; value: number; start: number; end: number };

export type BeamConfig = {
  length: number;
  E: number;
  I: number;
  c: number; // distance to outer fiber
  support: "simply_supported" | "cantilever" | "fixed_fixed";
  loads: Load[];
};

export type BeamResult = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
  stress: number[];
  maxStress: number;
  maxDeflection: number;
};

export function solveBeam(config: BeamConfig): BeamResult {
  const { length, loads, E, I } = config;

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
    // =====================
    // POINT LOAD
    // =====================
    if (load.type === "point") {
      const P = load.value;
      const a = load.position;

      if (config.support === "simply_supported") {
        if (xi < a) {
          V += P / 2;
          M += (P * xi) / 2;
        } else {
          V -= P / 2;
          M += (P * (length - xi)) / 2;
        }
      }

      if (config.support === "cantilever") {
        if (xi <= a) {
          V += P;
          M += P * (a - xi);
        }
      }

      if (config.support === "fixed_fixed") {
        if (xi < a) {
          V += P / 2;
          M += (P * xi) / 2;
        } else {
          V -= P / 2;
          M += (P * (length - xi)) / 2;
        }
      }
    }

    // =====================
    // UDL LOAD
    // =====================
    if (load.type === "udl") {
      const w = load.value;
      const a = load.start;
      const b = load.end;

      if (xi >= a && xi <= b) {
        const Lseg = b - a;
        const xRel = xi - a;

        if (config.support === "simply_supported") {
          V += w * (Lseg / 2 - xRel);
          M += (w * xRel * (Lseg - xRel)) / 2;
        }

        if (config.support === "cantilever") {
          V += w * (b - xi);
          M += (w * (b - xi) * (b - xi)) / 2;
        }

        if (config.support === "fixed_fixed") {
          V += w * (Lseg / 2 - xRel);
          M += (w * xRel * (Lseg - xRel)) / 2;
        }
      }
    }
  }

  shear.push(V);
  moment.push(M);
  const d = M / (E * I);
  deflection.push(d);

// stress calculation
const sigma = (M * config.c) / config.I;
stress.push(sigma);
}
const maxStress = Math.max(...stress.map(Math.abs));
const maxDeflection = Math.max(...deflection.map(Math.abs));
return {
  x,
  shear,
  moment,
  deflection,
  stress,
  maxStress,
  maxDeflection,
};
}