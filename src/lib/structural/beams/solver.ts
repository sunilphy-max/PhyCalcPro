import { BeamConfig, BeamResult, Load, UDL } from "./types";
import { solveBeamFEM } from "./femSolver";
import { postProcessFEM } from "./femPost";
import { maxAbs } from "../../shared/math";
import {
  inferSupportPreset,
  resolveSupports,
  validateSupports,
} from "./supports";

const G = 9.80665;

export function synthesizeSelfWeightLoad(config: BeamConfig): UDL | null {
  if (!config.includeSelfWeight) return null;
  const area = config.area;
  const density = config.density;
  if (area == null || area <= 0 || density == null || density <= 0) return null;
  return {
    id: "self-weight",
    type: "udl",
    value: area * density * G,
    start: 0,
    end: config.length,
  };
}

export function effectiveLoads(config: BeamConfig): Load[] {
  const selfWeight = synthesizeSelfWeightLoad(config);
  if (!selfWeight) return config.loads;
  if (config.loads.some((l) => l.id === "self-weight")) return config.loads;
  return [...config.loads, selfWeight];
}

export function solveBeam(config: BeamConfig): BeamResult {
  const { length, E, I, c } = config;
  const supports = resolveSupports(config);
  const loads = effectiveLoads(config);

  const fem = solveBeamFEM({
    length,
    loads,
    supports,
    E,
    I,
    meshSegments: config.meshSegments,
  });

  const results = postProcessFEM(
    fem.model,
    fem.displacements,
    I,
    c,
    E,
    loads,
    fem.supportReactions,
    fem.reactions
  );

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
    supportReactions: fem.supportReactions,
  };
}

export function supportValidationWarnings(config: BeamConfig): string[] {
  return validateSupports(resolveSupports(config), config.length);
}

export function supportPresetLabel(config: BeamConfig) {
  return inferSupportPreset(resolveSupports(config), config.length);
}
