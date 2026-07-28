import type { BeamConfig } from "./types";
import {
  effectiveLoads,
  solveBeam,
  supportPresetLabel,
  supportValidationWarnings,
} from "./solver";

export type BeamEngineInput = BeamConfig;

export type BeamEngineResult = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
  stress: number[];
  slope: number[];
  reactions?: number[];
  supportReactions?: import("./types").SupportReaction[];

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
    support: ReturnType<typeof supportPresetLabel>;
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
  supportReactions?: import("./types").SupportReaction[];
};

function totalVerticalLoad(loads: ReturnType<typeof effectiveLoads>): number {
  return loads.reduce((acc, load) => {
    if (load.type === "point") return acc + load.value;
    if (load.type === "udl") {
      return acc + load.value * Math.max(load.end - load.start, 0);
    }
    if (load.type === "triangular") {
      const L = Math.max(load.end - load.start, 0);
      return acc + 0.5 * (load.wStart + load.wEnd) * L;
    }
    return acc;
  }, 0);
}

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

  const loads = effectiveLoads(input);
  if (!loads.length) {
    throw new Error("At least one load is required.");
  }

  const supportWarnings = supportValidationWarnings(input);
  if (supportWarnings.some((w) => w.includes("At least one support"))) {
    throw new Error(supportWarnings[0]);
  }

  const raw = solveBeam(input) as SolverOutput;

  const maxMoment = Math.max(...raw.moment.map(Math.abs));
  const maxShear = Math.max(...raw.shear.map(Math.abs));
  const maxDeflection = Math.max(...raw.deflection.map(Math.abs));

  const clean = (arr: number[]) => arr.map((v) => (Number.isFinite(v) ? v : 0));

  const stress = clean(raw.stress);
  const maxStress = Math.max(...stress.map((v) => Math.abs(v || 0)));
  const warnings: string[] = [...supportWarnings];
  if ((input.meshSegments ?? 0) < 20) {
    warnings.push("Low mesh density may underpredict peak stress.");
  }

  const totalApplied = totalVerticalLoad(loads);
  const totalReaction = (raw.supportReactions ?? []).reduce(
    (acc, r) => acc + r.Fy,
    0
  );
  // Reactions positive upward, applied loads positive downward
  const staticEquilibriumResidual = Math.abs(totalReaction - totalApplied);

  return {
    x: clean(raw.x),
    shear: clean(raw.shear),
    moment: clean(raw.moment),
    deflection: clean(raw.deflection),
    stress,
    slope: clean(raw.slope),
    reactions: raw.reactions,
    supportReactions: raw.supportReactions,

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
      support: supportPresetLabel(input),
      solver: "beam-fem",
      warnings,
    },
  };
}
