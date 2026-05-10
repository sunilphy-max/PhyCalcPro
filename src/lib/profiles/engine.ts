/**
 * Area Properties Engine
 * High-level wrapper for area properties solver with validation
 */

import type { AreaPropertiesConfig, AreaPropertiesResult } from "./types";
import { solveAreaProperties } from "./solver";

/**
 * Solve area properties with validation
 */
export function solveAreaPropertiesEngine(
  config: AreaPropertiesConfig
): AreaPropertiesResult {
  // Validate shape configuration
  if (!config.shape) {
    throw new Error("Shape configuration is required");
  }

  const { shape } = config.shape;

  // Validate shape-specific parameters
  switch (shape) {
    case "rectangle":
      if (!config.shape.rectangle) {
        throw new Error("Rectangle properties are required");
      }
      if (config.shape.rectangle.width <= 0 || config.shape.rectangle.height <= 0) {
        throw new Error("Rectangle dimensions must be positive");
      }
      break;

    case "circle":
      if (!config.shape.circle) {
        throw new Error("Circle properties are required");
      }
      if (config.shape.circle.diameter <= 0) {
        throw new Error("Circle diameter must be positive");
      }
      break;

    case "hollow_circle":
      if (!config.shape.hollowCircle) {
        throw new Error("Hollow circle properties are required");
      }
      if (config.shape.hollowCircle.outerDiameter <= 0) {
        throw new Error("Outer diameter must be positive");
      }
      if (config.shape.hollowCircle.innerDiameter >= config.shape.hollowCircle.outerDiameter) {
        throw new Error("Inner diameter must be less than outer diameter");
      }
      break;

    case "i_beam":
    case "t_beam":
    case "c_channel":
      const beamProps = config.shape.iBeam || config.shape.tBeam || config.shape.cChannel;
      if (!beamProps) {
        throw new Error("Beam properties are required");
      }
      if (beamProps.height <= 0 || beamProps.width <= 0 || beamProps.webThickness <= 0 || beamProps.flangeThickness <= 0) {
        throw new Error("All beam dimensions must be positive");
      }
      break;

    case "angle":
      if (!config.shape.angle) {
        throw new Error("Angle properties are required");
      }
      if (config.shape.angle.leg1 <= 0 || config.shape.angle.leg2 <= 0 || config.shape.angle.thickness <= 0) {
        throw new Error("All angle dimensions must be positive");
      }
      break;

    case "custom":
      if (!config.shape.custom) {
        throw new Error("Custom properties are required");
      }
      if (config.shape.custom.area <= 0) {
        throw new Error("Area must be positive");
      }
      break;

    default:
      throw new Error(`Unsupported shape type: ${shape}`);
  }

  // Solve
  return solveAreaProperties(config);
}
