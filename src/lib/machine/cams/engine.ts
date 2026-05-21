import type { CamConfig, CamResult } from "./types";
import { solveCamDesign } from "./solver";

export function solveCamEngine(config: CamConfig): CamResult {
  if (config.lift <= 0) {
    throw new Error("Cam lift must be positive");
  }
  if (config.baseCircle <= 0) {
    throw new Error("Base circle radius must be positive");
  }
  if (config.radius <= 0) {
    throw new Error("Follower radius must be positive");
  }
  if (config.speed <= 0) {
    throw new Error("Cam speed must be positive");
  }
  if (config.dwellAngle < 0 || config.dwellAngle >= 360) {
    throw new Error("Dwell angle must be between 0 and 360 degrees");
  }
  return solveCamDesign(config);
}
