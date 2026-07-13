/**
 * Friction power → annual energy + CO₂ screening (not full LCA).
 */

/** Default grid intensity — global average-ish screening (kg CO₂e / kWh). */
export const DEFAULT_GRID_KG_CO2_PER_KWH = 0.45;

export type EnergyCo2Input = {
  powerLossW: number;
  /** Operating hours per year (default 6000 ≈ continuous industrial). */
  operatingHoursPerYear?: number;
  /** Grid emission factor kg CO₂e / kWh. */
  gridKgCo2PerKwh?: number;
};

export type EnergyCo2Result = {
  powerLossW: number;
  annualEnergyKwh: number;
  annualCo2Kg: number;
  operatingHoursPerYear: number;
  gridKgCo2PerKwh: number;
  note: string;
};

export function calculateEnergyCo2(input: EnergyCo2Input): EnergyCo2Result {
  const hours = input.operatingHoursPerYear ?? 6000;
  const grid = input.gridKgCo2PerKwh ?? DEFAULT_GRID_KG_CO2_PER_KWH;
  const P = Math.max(input.powerLossW, 0);
  const annualEnergyKwh = (P * hours) / 1000;
  const annualCo2Kg = annualEnergyKwh * grid;

  return {
    powerLossW: P,
    annualEnergyKwh,
    annualCo2Kg,
    operatingHoursPerYear: hours,
    gridKgCo2PerKwh: grid,
    note: `Screening CO₂ from friction power only (grid ${grid} kg/kWh × ${hours} h/y). Not a product LCA.`,
  };
}
