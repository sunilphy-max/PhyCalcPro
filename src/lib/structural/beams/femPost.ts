import { FEMModel } from "./femTypes";
import type { Load, SupportReaction } from "./types";

export type FEMPostResult = {
  x: number[];
  deflection: number[];
  rotation: number[];
  moment: number[];
  shear: number[];
  stress: number[];
  reactions?: number[];
};

function shearAtPosition(
  x: number,
  loads: Load[],
  supportReactions: SupportReaction[]
) {
  let shear = 0;
  const eps = 1e-12;

  for (const r of supportReactions) {
    if (r.x <= x + eps) shear += r.Fy;
  }

  for (const load of loads) {
    if (load.type === "point" && load.position <= x + eps) {
      shear -= load.value;
    }

    if (load.type === "udl") {
      const overlap = Math.max(0, Math.min(load.end, x) - load.start);
      if (overlap > 0) shear -= load.value * overlap;
    }

    if (load.type === "triangular") {
      const a = load.start;
      const b = load.end;
      const overlapEnd = Math.min(b, x);
      if (overlapEnd > a) {
        const wa = load.wStart;
        const wb = load.wEnd;
        const L = b - a;
        if (L > 0) {
          const wAt = (t: number) => wa + (wb - wa) * ((t - a) / L);
          const x1 = a;
          const x2 = overlapEnd;
          shear -= 0.5 * (wAt(x1) + wAt(x2)) * (x2 - x1);
        }
      }
    }
  }

  return shear;
}

export function postProcessFEM(
  model: FEMModel,
  displacements: number[],
  I: number,
  c: number,
  _E: number,
  loads: Load[],
  supportReactions: SupportReaction[],
  reactions: number[]
): FEMPostResult {
  const x: number[] = [];
  const deflection: number[] = [];
  const rotation: number[] = [];
  const moment: number[] = [];
  const shear: number[] = [];
  const stress: number[] = [];

  for (const node of model.nodes) {
    x.push(node.x);
    const v = displacements[node.id * 2];
    const theta = displacements[node.id * 2 + 1];
    deflection.push(Number.isFinite(v) ? v! : 0);
    rotation.push(Number.isFinite(theta) ? theta! : 0);
  }

  for (let i = 0; i < x.length; i++) {
    const shearValue = shearAtPosition(x[i]!, loads, supportReactions);
    shear.push(Number.isFinite(shearValue) ? shearValue : 0);
  }

  // Start moment from left-end fixed support (continuous beam → M continuous thereafter)
  let M0 = 0;
  for (const r of supportReactions) {
    if (r.kind === "fixed" && r.Mz != null && Math.abs(r.x - (x[0] ?? 0)) <= 1e-12) {
      M0 -= r.Mz;
    }
  }
  moment.push(Number.isFinite(M0) ? M0 : 0);

  for (let i = 1; i < x.length; i++) {
    const dx = x[i]! - x[i - 1]!;
    const midShear = shearAtPosition(
      0.5 * (x[i - 1]! + x[i]!),
      loads,
      supportReactions
    );
    const Mi = moment[i - 1]! + (Number.isFinite(midShear) ? midShear : 0) * dx;
    moment.push(Number.isFinite(Mi) ? Mi : 0);
  }

  for (const M of moment) {
    const sigma = I !== 0 ? (M * c) / I : 0;
    stress.push(Number.isFinite(sigma) ? sigma : 0);
  }

  return {
    x,
    deflection,
    rotation,
    moment,
    shear,
    stress,
    reactions,
  };
}
