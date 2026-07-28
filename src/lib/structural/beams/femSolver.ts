import { generateBeamMesh } from "./mesh";
import { assembleGlobalStiffness } from "./globalStiffness";
import { createLoadVector, loadKeyAbscissae } from "./loadVector";
import { constrainedDOFFromSupports } from "./constraints";
import { solveLinearSystem } from "./linearSolver";
import { computeReactions, mapSupportReactions } from "./femReactions";
import type { FEMModel } from "./femTypes";
import type { BeamSupport, Load, SupportReaction } from "./types";

export function solveBeamFEM({
  length,
  loads,
  supports,
  E,
  I,
  meshSegments,
}: {
  length: number;
  loads: Load[];
  supports: BeamSupport[];
  E: number;
  I: number;
  meshSegments?: number;
}): {
  model: FEMModel;
  displacements: number[];
  reactions: number[];
  supportReactions: SupportReaction[];
} {
  const keyXs = [
    ...supports.map((s) => s.x),
    ...loadKeyAbscissae(loads),
  ];

  const model = generateBeamMesh(
    length,
    E,
    I,
    meshSegments ?? 40,
    keyXs
  );

  const K = assembleGlobalStiffness(model);
  const F = createLoadVector(model, loads);
  const fixed = constrainedDOFFromSupports(model.nodes, supports);

  const free: number[] = [];
  for (let i = 0; i < F.length; i++) {
    if (!fixed.includes(i)) free.push(i);
  }

  if (free.length === 0) {
    throw new Error("Beam is fully constrained with no free DOFs.");
  }

  const Kred = free.map((i) => free.map((j) => K[i]![j]!));
  const Fred = free.map((i) => F[i]!);
  const dred = solveLinearSystem(Kred, Fred);

  const d = Array(F.length).fill(0);
  free.forEach((dof, i) => {
    d[dof] = dred[i];
  });

  const reactions = computeReactions(K, d, F);
  const supportReactions = mapSupportReactions(model.nodes, supports, reactions);

  return {
    model,
    displacements: d,
    reactions,
    supportReactions,
  };
}
