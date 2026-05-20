import type { FrameConfig, FrameResult } from "./types";
import { solveFrameFEM } from "./solver";

export function solveFrameEngine(config: FrameConfig): FrameResult {
  if (config.span <= 0) {
    throw new Error("Frame span must be positive");
  }
  if (config.height <= 0) {
    throw new Error("Frame height must be positive");
  }
  if (config.segments < 1) {
    throw new Error("Frame must have at least one beam segment");
  }
  if (config.A <= 0) {
    throw new Error("Cross-sectional area must be positive");
  }
  if (config.I <= 0) {
    throw new Error("Second moment of inertia must be positive");
  }
  if (config.E <= 0) {
    throw new Error("Young's modulus must be positive");
  }
  if (config.load === 0) {
    throw new Error("Applied load must be nonzero");
  }

  return solveFrameFEM(config);
}
