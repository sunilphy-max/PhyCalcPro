import type { TrussConfig, TrussResult } from "./types";
import { solveTrussFEM } from "./solver";

export function solveTrussEngine(config: TrussConfig): TrussResult {
  if (config.span <= 0) {
    throw new Error("Span must be positive");
  }
  if (config.height <= 0) {
    throw new Error("Truss height must be positive");
  }
  if (config.panels < 2) {
    throw new Error("The truss must have at least two panels");
  }
  if (config.E <= 0) {
    throw new Error("Young's modulus must be positive");
  }
  if (config.A <= 0) {
    throw new Error("Cross-sectional area must be positive");
  }
  if (config.load === 0) {
    throw new Error("Applied load must be non-zero");
  }

  return solveTrussFEM(config);
}
