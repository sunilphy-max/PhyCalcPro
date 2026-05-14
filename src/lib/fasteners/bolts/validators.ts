/**
 * Screw Design Validators
 * Input validation for screw calculations
 */

import type { ScrewConfig } from "./types";

export function validateScrewConfig(config: ScrewConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Common validations
  if (config.screwType !== "power_screw" && config.screwType !== "ball_screw") {
    errors.push("Invalid screw type");
  }

  // Dimension validations
  if (!config.majorDiameter || config.majorDiameter <= 0) {
    errors.push("Major diameter must be positive");
  }

  if (!config.pitch || config.pitch <= 0) {
    errors.push("Pitch must be positive");
  }

  if (config.lead && config.lead <= 0) {
    errors.push("Lead must be positive");
  }

  if (config.axialForce && config.axialForce < 0) {
    errors.push("Axial force cannot be negative");
  }

  if (config.frictionCoefficient && (config.frictionCoefficient < 0 || config.frictionCoefficient > 1)) {
    errors.push("Friction coefficient must be between 0 and 1");
  }

  // Power screw specific validations
  if (config.screwType === "power_screw") {
    const c = config as any;

    if (!c.threadType || !["square", "acme", "buttress"].includes(c.threadType)) {
      errors.push("Invalid thread type for power screw");
    }

    if (c.starts && c.starts < 1) {
      errors.push("Number of starts must be at least 1");
    }

    if (c.efficiency && (c.efficiency < 0 || c.efficiency > 100)) {
      errors.push("Efficiency must be between 0 and 100");
    }
  }

  // Ball screw specific validations
  if (config.screwType === "ball_screw") {
    const c = config as any;

    if (!c.ballDiameter || c.ballDiameter <= 0) {
      errors.push("Ball diameter must be positive");
    }

    if (c.contactAngle && (c.contactAngle < 0 || c.contactAngle > 90)) {
      errors.push("Contact angle must be between 0 and 90 degrees");
    }

    if (c.speed && c.speed < 0) {
      errors.push("Speed cannot be negative");
    }

    if (c.preload && c.preload < 0) {
      errors.push("Preload cannot be negative");
    }

    if (c.dynamicViscosity && c.dynamicViscosity < 0) {
      errors.push("Dynamic viscosity cannot be negative");
    }

    if (c.temperature && (c.temperature < -273 || c.temperature > 1000)) {
      errors.push("Temperature out of reasonable range");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
