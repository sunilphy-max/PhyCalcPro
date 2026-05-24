/**
 * Screw Design Validators
 * Input validation for screw calculations
 */

import type { ScrewConfig, PowerScrewConfig, BallScrewConfig } from "./types";

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
    const screw = config as PowerScrewConfig;

    if (!screw.threadType || !["square", "acme", "buttress"].includes(screw.threadType)) {
      errors.push("Invalid thread type for power screw");
    }

    if (screw.starts && screw.starts < 1) {
      errors.push("Number of starts must be at least 1");
    }

    if (screw.efficiency && (screw.efficiency < 0 || screw.efficiency > 100)) {
      errors.push("Efficiency must be between 0 and 100");
    }

    if (screw.material) {
      if (screw.material.E && screw.material.E <= 0) {
        errors.push("Material elastic modulus must be positive");
      }
      if (screw.material.yieldStrength && screw.material.yieldStrength <= 0) {
        errors.push("Material yield strength must be positive");
      }
      if (screw.material.shearStrength && screw.material.shearStrength <= 0) {
        errors.push("Material shear strength must be positive");
      }
    }
  }

  // Ball screw specific validations
  if (config.screwType === "ball_screw") {
    const screw = config as BallScrewConfig;

    if (!screw.ballDiameter || screw.ballDiameter <= 0) {
      errors.push("Ball diameter must be positive");
    }

    if (screw.contactAngle && (screw.contactAngle < 0 || screw.contactAngle > 90)) {
      errors.push("Contact angle must be between 0 and 90 degrees");
    }

    if (screw.speed && screw.speed < 0) {
      errors.push("Speed cannot be negative");
    }

    if (screw.preload && screw.preload < 0) {
      errors.push("Preload cannot be negative");
    }

    if (screw.dynamicViscosity && screw.dynamicViscosity < 0) {
      errors.push("Dynamic viscosity cannot be negative");
    }

    if (screw.temperature && (screw.temperature < -273 || screw.temperature > 1000)) {
      errors.push("Temperature out of reasonable range");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
