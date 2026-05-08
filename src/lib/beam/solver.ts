import { BeamConfig, BeamResult } from "./types";

import { solveBeamFEM } from "./femSolver";
import { postProcessFEM } from "./femPost";

import { maxAbs } from "../shared/math";

export function solveBeam(
  config: BeamConfig
): BeamResult {

  const {
    length,
    loads,
    support,

    E,
    I,
    c,
  } = config;

  // -----------------------------------
  // FEM SOLUTION
  // -----------------------------------

  const fem =
    solveBeamFEM({
      length,
      loads,
      support,
      E,
      I,
      meshSegments: config.meshSegments,
    });

  // -----------------------------------
  // POST PROCESS
  // -----------------------------------

  const results =
  postProcessFEM(
    fem.model,
    fem.displacements,
    I,
    c,
    E
  );

results.reactions =
  fem.reactions;

  return {
    x: results.x,
    shear: results.shear,
    moment: results.moment,
    slope: results.rotation,
    deflection: results.deflection,
    stress: results.stress,
    maxStress: maxAbs(results.stress),
    maxDeflection: maxAbs(results.deflection),
    maxMoment: maxAbs(results.moment),
    maxShear: maxAbs(results.shear),
    reactions: fem.reactions,
  };
}