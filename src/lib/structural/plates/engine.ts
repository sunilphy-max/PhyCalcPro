import type { PlateConfig, PlateResult } from "./types";
import { solvePlateFEM } from "./femSolver";

export function solvePlateEngine(config: PlateConfig): PlateResult {
  if (config.length <= 0) {
    throw new Error("Plate length must be positive");
  }
  if (config.width <= 0) {
    throw new Error("Plate width must be positive");
  }
  if (config.thickness <= 0) {
    throw new Error("Plate thickness must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Young's modulus must be positive");
  }
  if (config.nu <= 0 || config.nu >= 0.5) {
    throw new Error("Poisson's ratio must be between 0 and 0.5");
  }
  if (config.q === 0) {
    throw new Error("Pressure load must be non-zero");
  }
  if (config.elementsX < 2 || config.elementsY < 2) {
    throw new Error("Mesh must contain at least two elements in each direction");
  }

  return solvePlateFEM(config);
}
