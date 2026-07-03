/**
 * Shaft Engine — validation wrapper
 */

import { resolveSegments } from "./mesh";
import type { ShaftConfig, ShaftResult } from "./types";
import { solveShaftFEM } from "./femSolver";

export function solveShaftEngine(config: ShaftConfig): ShaftResult {
  const segments = resolveSegments(
    config.geometry.length,
    config.geometry.diameter,
    config.geometry.segments
  );

  for (const seg of segments) {
    if (seg.length <= 0) throw new Error("Each shaft segment length must be positive");
    if (seg.outerDiameter <= 0) throw new Error("Shaft outer diameter must be positive");
    const id = seg.innerDiameter ?? 0;
    if (id < 0 || id >= seg.outerDiameter) {
      throw new Error("Inner diameter must be between 0 and outer diameter");
    }
  }

  if (config.geometry.diameter <= 0 && segments.every((s) => s.outerDiameter <= 0)) {
    throw new Error("Shaft diameter must be positive");
  }
  if (config.geometry.length <= 0) {
    throw new Error("Shaft length must be positive");
  }
  if (config.material.E <= 0) throw new Error("Elastic modulus must be positive");
  if (config.material.G <= 0) throw new Error("Shear modulus must be positive");

  const material = {
    ...config.material,
    ultimateStrength:
      config.material.ultimateStrength > 0
        ? config.material.ultimateStrength
        : config.material.yieldStress * 1.5,
  };

  return solveShaftFEM({ ...config, material });
}
