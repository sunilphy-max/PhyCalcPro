import type { CostEstimatorConfig, CostEstimatorResult } from "./types";

export function solveCostEstimatorEngine(config: CostEstimatorConfig): CostEstimatorResult {
  const volume = Math.max(config.materialVolume, 0);
  const density = Math.max(config.materialDensity, 0);
  const materialMass = volume * density;
  const scrapFraction = Math.min(Math.max(config.scrapPercent / 100, 0), 0.9);
  const scrapMass = materialMass * scrapFraction;
  const materialCost = materialMass * config.materialCostPerKg;
  const machiningCost = Math.max(config.machiningTime, 0) * Math.max(config.machineRate, 0);
  const laborCost = Math.max(config.laborTime, 0) * Math.max(config.laborRate, 0);
  const processCost = machiningCost + laborCost;
  const finishCost = (Math.max(config.finishPercent, 0) / 100) * (materialCost + processCost);
  const overheadCost = (Math.max(config.overheadPercent, 0) / 100) * (materialCost + processCost + finishCost);
  const totalCost = materialCost + processCost + finishCost + overheadCost;
  const costPerVolume = volume > 0 ? totalCost / volume : 0;
  const costPerMass = materialMass > 0 ? totalCost / materialMass : 0;
  const effectiveMaterialCost = materialMass > 0 ? materialCost / (1 - scrapFraction) : materialCost;

  return {
    materialVolume: volume,
    materialDensity: density,
    materialMass,
    scrapMass,
    materialCost,
    machiningCost,
    laborCost,
    processCost,
    finishCost,
    overheadCost,
    totalCost,
    costPerVolume,
    costPerMass,
    effectiveMaterialCost,
    scrapPercent: config.scrapPercent,
  };
}
