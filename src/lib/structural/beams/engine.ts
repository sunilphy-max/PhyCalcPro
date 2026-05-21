import type { Load, BeamConfig } from "./types";
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
  const raw = solveBeam(input) as SolverOutput;

  const maxMoment = Math.max(...raw.moment.map(Math.abs));
  const maxShear = Math.max(...raw.shear.map(Math.abs));
  const maxDeflection = Math.max(...raw.deflection.map(Math.abs));

  const clean = (arr: number[]) => arr.map((v) => (Number.isFinite(v) ? v : 0));

  const stress = clean(raw.stress);
  const maxStress = Math.max(...stress.map((v) => Math.abs(v || 0)));

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
  };

}