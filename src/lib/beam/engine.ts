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
};

export function solveBeamEngine(input: BeamEngineInput): BeamEngineResult {
  const raw = solveBeam(input) as SolverOutput;

  const maxMoment = Math.max(...raw.moment.map(Math.abs));
const maxShear = Math.max(...raw.shear.map(Math.abs));
const maxDeflection = Math.max(...raw.deflection.map(Math.abs));

const stress = raw.moment.map((m: number) => m);
const maxStress = Math.max(...stress.map(Math.abs));

  return {
    x: raw.x,
    shear: raw.shear,
    moment: raw.moment,
    deflection: raw.deflection,

    stress: raw.moment.map((m: number) => m), // placeholder (improve later)
    slope: raw.deflection.map(() => 0),       // placeholder (improve later)

    maxMoment,
    maxShear,
    maxStress,
    maxDeflection,
  };
}