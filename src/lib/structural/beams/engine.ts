import type { BeamConfig } from "./types";
import { solveBeam } from "./solver";

export type BeamEngineInput = BeamConfig;

export type BeamEngineResult = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
  stress: number[];
  slope: number[];
  reactions?: number[];

  maxMoment: number;
  maxShear: number;
  maxStress: number;
  maxDeflection: number;
  physicsChecks?: {
    staticEquilibriumResidual: number;
    finiteValues: boolean;
  };
  solverMeta?: {
    meshSegments: number;
    support: BeamConfig["support"];
    solver: "beam-fem";
    warnings: string[];
  };
};
type SolverOutput = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
  stress: number[];
  slope: number[];
  reactions?: number[];
};

export function solveBeamEngine(input: BeamEngineInput): BeamEngineResult {
  if (input.length <= 0) {
    throw new Error("Beam length must be positive.");
  }
  if (input.E <= 0 || input.I <= 0) {
    throw new Error("Elastic modulus and inertia must be positive.");
  }
  if (input.c <= 0) {
    throw new Error("Distance c must be positive.");
  }
  if (!input.loads.length) {
    throw new Error("At least one load is required.");
  }

  const raw = solveBeam(input) as SolverOutput;

  const maxMoment = Math.max(...raw.moment.map(Math.abs));
  const maxShear = Math.max(...raw.shear.map(Math.abs));
  const maxDeflection = Math.max(...raw.deflection.map(Math.abs));

  const clean = (arr: number[]) => arr.map((v) => (Number.isFinite(v) ? v : 0));

  const stress = clean(raw.stress);
  const maxStress = Math.max(...stress.map((v) => Math.abs(v || 0)));
  const warnings: string[] = [];
  if ((input.meshSegments ?? 0) < 20) {
    warnings.push("Low mesh density may underpredict peak stress.");
  }

  const totalPointAndUdl = input.loads.reduce((acc, load) => {
    if (load.type === "point") return acc + load.value;
    if (load.type === "udl") return acc + load.value * Math.max(load.end - load.start, 0);
    return acc;
  }, 0);
  const totalReaction = (raw.reactions ?? []).reduce((acc, reaction, index) => {
    return index % 2 === 0 ? acc + reaction : acc;
  }, 0);
  const staticEquilibriumResidual = Math.abs(totalReaction + totalPointAndUdl);

  return {
    x: clean(raw.x),
    shear: clean(raw.shear),
    moment: clean(raw.moment),
    deflection: clean(raw.deflection),
    stress,
    slope: clean(raw.slope),
    reactions: raw.reactions,

    maxMoment,
    maxShear,
    maxStress,
    maxDeflection,
    physicsChecks: {
      staticEquilibriumResidual,
      finiteValues: [
        ...raw.x,
        ...raw.shear,
        ...raw.moment,
        ...raw.deflection,
        ...stress,
      ].every(Number.isFinite),
    },
    solverMeta: {
      meshSegments: input.meshSegments ?? 0,
      support: input.support,
      solver: "beam-fem",
      warnings,
    },
  };

}