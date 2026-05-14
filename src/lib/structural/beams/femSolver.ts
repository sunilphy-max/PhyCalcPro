import { generateBeamMesh } from "./mesh";
import { assembleGlobalStiffness } from "./globalStiffness";
import { createLoadVector } from "./loadVector";
import { constrainedDOF } from "./constraints";
import { solveLinearSystem } from "./linearSolver";
import { computeReactions } from "./femReactions";
import type { FEMModel } from "./femTypes";

import { Load, SupportType } from "./types";

export function solveBeamFEM({
  length,
  loads,
  support,
  E,
  I,
  meshSegments,
}: {
  length: number;
  loads: Load[];
  support: SupportType;
  E: number;
  I: number;
  meshSegments?: number;
}): { model: FEMModel; displacements: number[]; reactions: number[] } {

  // ----------------------------------
  // MODEL
  // ----------------------------------

  const model =
    generateBeamMesh(
      length,
      E,
      I,
      meshSegments ?? 40
    );

  // ----------------------------------
  // GLOBAL STIFFNESS
  // ----------------------------------

  const K =
    assembleGlobalStiffness(model);

  // ----------------------------------
  // LOAD VECTOR
  // ----------------------------------

  const F =
    createLoadVector(model, loads);

  // ----------------------------------
  // CONSTRAINTS
  // ----------------------------------

  const fixed =
    constrainedDOF(
      model.nodes.length,
      support
    );

  // ----------------------------------
  // REDUCED SYSTEM
  // ----------------------------------

  const free: number[] = [];

  for (let i = 0; i < F.length; i++) {
    if (!fixed.includes(i)) {
      free.push(i);
    }
  }

  const Kred =
    free.map(i =>
      free.map(j => K[i][j])
    );

  const Fred =
    free.map(i => F[i]);

  // ----------------------------------
  // SOLVE
  // ----------------------------------

  const dred =
    solveLinearSystem(
      Kred,
      Fred
    );

  // ----------------------------------
  // FULL DISPLACEMENT VECTOR
  // ----------------------------------

  const d =
    Array(F.length).fill(0);

  free.forEach((dof, i) => {
    d[dof] = dred[i];
  });

 const reactions =
  computeReactions(
    K,
    d,
    F
  );

return {
  model,
  displacements: d,
  reactions,
};
}