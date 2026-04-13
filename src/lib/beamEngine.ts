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
  loads: Load[];
};

export type BeamResult = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
};

export function solveBeam(config: BeamConfig): BeamResult {
  const { length, loads, E, I } = config;

  const n = 60;

  const x: number[] = [];
  const shear: number[] = [];
  const moment: number[] = [];
  const deflection: number[] = [];

  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * length;
    x.push(xi);

    let V = 0;
    let M = 0;

    for (const load of loads) {
      if (load.type === "point") {
        const P = load.value;
        const a = load.position;

        if (xi < a) {
          V += P / 2;
          M += (P * xi) / 2;
        } else {
          V -= P / 2;
          M += (P * (length - xi)) / 2;
        }
      }

      if (load.type === "udl") {
        const w = load.value;
        const a = load.start;
        const b = load.end;

        if (xi >= a && xi <= b) {
          const Lseg = b - a;
          const xRel = xi - a;

          V += w * (Lseg / 2 - xRel);
          M += (w * xRel * (Lseg - xRel)) / 2;
        }
      }
    }

    shear.push(V);
    moment.push(M);
    deflection.push(M / (E * I));
  }

  return { x, shear, moment, deflection };
}