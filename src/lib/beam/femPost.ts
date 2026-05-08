import { FEMModel } from "./femTypes";

export type FEMPostResult = {
  x: number[];
  deflection: number[];
  rotation: number[];
  moment: number[];
  shear: number[];
  stress: number[];
  reactions?: number[];
};

export function postProcessFEM(
  model: FEMModel,
  displacements: number[],
  I: number,
  c: number,
  E: number
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

  for (let i = 0; i < x.length; i++) {
    const dx = i > 0 ? x[i] - x[i - 1] : x[1] - x[0];
    const dTheta = i > 0 ? rotation[i] - rotation[i - 1] : 0;
    const M = dx !== 0 ? E * I * (dTheta / dx) : 0;
    moment.push(Number.isFinite(M) ? M : 0);
  }

  for (let i = 0; i < x.length; i++) {
    const dx = i > 0 ? x[i] - x[i - 1] : x[1] - x[0];
    const dM = i > 0 ? moment[i] - moment[i - 1] : 0;
    const V = dx !== 0 ? dM / dx : 0;
    shear.push(Number.isFinite(V) ? V : 0);
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
  };
}
