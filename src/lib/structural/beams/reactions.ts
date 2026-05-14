import type { Load, SupportType } from "./types";

export type ReactionResult = {
  RA: number;
  RB: number;
};

export function solveReactions(
  length: number,
  loads: Load[],
  support: SupportType
): ReactionResult {

  // cantilever
  if (support === "cantilever") {
    let total = 0;

    for (const load of loads) {
      if (load.type === "point") {
        total += load.value;
      }

      if (load.type === "udl") {
        total += load.value * (load.end - load.start);
      }
    }

    return {
      RA: total,
      RB: 0,
    };
  }

  // simply supported + fixed-fixed approximation
  let totalForce = 0;
  let totalMoment = 0;

  for (const load of loads) {

    if (load.type === "point") {
      totalForce += load.value;
      totalMoment += load.value * load.position;
    }

    if (load.type === "udl") {

      const L = load.end - load.start;
      const W = load.value * L;

      const centroid = load.start + L / 2;

      totalForce += W;
      totalMoment += W * centroid;
    }
  }

  const RB = totalMoment / length;
  const RA = totalForce - RB;

  return {
    RA,
    RB,
  };
}