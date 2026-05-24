export type CostEstimatorConfig = {
  materialVolume: number; // m³
  materialDensity: number; // kg/m³
  materialCostPerKg: number; // currency/kg
  machiningTime: number; // hours
  machineRate: number; // currency/hour
  laborTime: number; // hours
  laborRate: number; // currency/hour
  finishPercent: number; // %
  overheadPercent: number; // %
  scrapPercent: number; // %
};

export type CostEstimatorResult = {
  materialVolume: number;
  materialDensity: number;
  materialMass: number;
  scrapMass: number;
  materialCost: number;
  machiningCost: number;
  laborCost: number;
  processCost: number;
  finishCost: number;
  overheadCost: number;
  totalCost: number;
  costPerVolume: number;
  costPerMass: number;
  effectiveMaterialCost: number;
  scrapPercent: number;
};