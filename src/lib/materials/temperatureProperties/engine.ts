import type { TemperaturePropertiesConfig, TemperaturePropertiesResult } from "./types";

export function solveTemperaturePropertiesEngine(
  config: TemperaturePropertiesConfig
): TemperaturePropertiesResult {
  const referenceTemperature = 20;
  const deltaT = config.temperature - referenceTemperature;
  const yieldDerate = Math.max(0.2, 1 - 0.002 * deltaT);
  const modulusDerate = Math.max(0.2, 1 - 0.0015 * deltaT);
  const adjustedYield = config.baseYield * yieldDerate;
  const adjustedModulus = config.baseModulus * modulusDerate;
  const expansionPerMeter = config.coefficientThermalExpansion * deltaT;

  return {
    adjustedYield,
    adjustedModulus,
    expansionPerMeter,
    designStatus: adjustedYield >= config.baseYield * 0.8 ? "nominal" : "reduced",
  };
}
