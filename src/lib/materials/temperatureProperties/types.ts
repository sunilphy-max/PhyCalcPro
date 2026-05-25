export type TemperaturePropertiesConfig = {
  baseYield: number;
  baseModulus: number;
  coefficientThermalExpansion: number;
  temperature: number;
};

export type TemperaturePropertiesResult = {
  adjustedYield: number;
  adjustedModulus: number;
  expansionPerMeter: number;
  designStatus: "nominal" | "reduced";
};
