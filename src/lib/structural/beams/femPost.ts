import { FEMModel } from "./femTypes";
import { Load, SupportType } from "./types";

export type FEMPostResult = {
  x: number[];
  deflection: number[];
  rotation: number[];
  moment: number[];
  shear: number[];
  stress: number[];
  reactions?: number[];
};

function getSupportMoments(reactions: number[], support: SupportType, nodeCount: number) {
  if (support === "cantilever") {
    return {
      leftMoment: reactions[1] || 0,
      rightMoment: 0,
    };
  }

  if (support === "fixed_fixed") {
    return {
      leftMoment: reactions[1] || 0,
      rightMoment: reactions[nodeCount * 2 - 1] || 0,
    };
  }

  return {
    leftMoment: 0,
    rightMoment: 0,
  };
}

function shearAtPosition(
  x: number,
  loads: Load[],
  reactions: number[],
  support: SupportType,
  endX: number
) {
  let shear = 0;

  if (x >= 0) {
    shear += reactions[0] || 0;
  }

  if ((support === "simply_supported" || support === "fixed_fixed") && x >= endX) {
    shear += reactions[reactions.length - 2] || 0;
  }

  for (const load of loads) {
    if (load.type === "point" && load.position <= x) {
      shear -= load.value;
    }

    if (load.type === "udl") {
      const overlap = Math.max(0, Math.min(load.end, x) - load.start);
      if (overlap > 0) {
        shear -= load.value * overlap;
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
  E: number,
  loads: Load[],
  support: SupportType,
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
    deflection.push(Number.isFinite(v) ? v : 0);
    rotation.push(Number.isFinite(theta) ? theta : 0);
  }

  const endX = x[x.length - 1] ?? 0;
  const { leftMoment } = getSupportMoments(reactions, support, model.nodes.length);

  for (let i = 0; i < x.length; i++) {
    const shearValue = shearAtPosition(x[i], loads, reactions, support, endX);
    shear.push(Number.isFinite(shearValue) ? shearValue : 0);
  }

  moment.push(Number.isFinite(leftMoment) ? leftMoment : 0);
  for (let i = 1; i < x.length; i++) {
    const dx = x[i] - x[i - 1];
    const averageShear = 0.5 * (shear[i - 1] + shear[i]);
    moment.push(moment[i - 1] + averageShear * dx);
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
