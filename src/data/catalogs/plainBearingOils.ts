/**
 * Screening mineral / synthetic oil table for plain bearings (ISO VG).
 * ν40 / ν100 in mm²/s (cSt); density kg/m³.
 */

export type PlainBearingOil = {
  id: string;
  label: string;
  isoVg: number;
  base: "mineral" | "synthetic" | "ester";
  nu40Cst: number;
  nu100Cst: number;
  densityKgM3: number;
  maxTempC: number;
};

export const PLAIN_BEARING_OILS: PlainBearingOil[] = [
  { id: "vg22", label: "ISO VG 22 mineral", isoVg: 22, base: "mineral", nu40Cst: 22, nu100Cst: 4.3, densityKgM3: 870, maxTempC: 90 },
  { id: "vg32", label: "ISO VG 32 mineral", isoVg: 32, base: "mineral", nu40Cst: 32, nu100Cst: 5.4, densityKgM3: 875, maxTempC: 95 },
  { id: "vg46", label: "ISO VG 46 mineral", isoVg: 46, base: "mineral", nu40Cst: 46, nu100Cst: 6.8, densityKgM3: 880, maxTempC: 100 },
  { id: "vg68", label: "ISO VG 68 mineral", isoVg: 68, base: "mineral", nu40Cst: 68, nu100Cst: 8.7, densityKgM3: 885, maxTempC: 105 },
  { id: "vg100", label: "ISO VG 100 mineral", isoVg: 100, base: "mineral", nu40Cst: 100, nu100Cst: 11.2, densityKgM3: 890, maxTempC: 110 },
  { id: "vg150", label: "ISO VG 150 mineral", isoVg: 150, base: "mineral", nu40Cst: 150, nu100Cst: 14.5, densityKgM3: 895, maxTempC: 115 },
  { id: "vg220", label: "ISO VG 220 mineral", isoVg: 220, base: "mineral", nu40Cst: 220, nu100Cst: 18.5, densityKgM3: 900, maxTempC: 120 },
  { id: "vg320", label: "ISO VG 320 mineral", isoVg: 320, base: "mineral", nu40Cst: 320, nu100Cst: 24, densityKgM3: 905, maxTempC: 120 },
  { id: "vg460", label: "ISO VG 460 mineral", isoVg: 460, base: "mineral", nu40Cst: 460, nu100Cst: 30, densityKgM3: 910, maxTempC: 120 },
  { id: "pao32", label: "PAO ISO VG 32", isoVg: 32, base: "synthetic", nu40Cst: 32, nu100Cst: 5.9, densityKgM3: 840, maxTempC: 130 },
  { id: "pao46", label: "PAO ISO VG 46", isoVg: 46, base: "synthetic", nu40Cst: 46, nu100Cst: 7.5, densityKgM3: 845, maxTempC: 135 },
  { id: "pao68", label: "PAO ISO VG 68", isoVg: 68, base: "synthetic", nu40Cst: 68, nu100Cst: 9.8, densityKgM3: 850, maxTempC: 140 },
  { id: "pao100", label: "PAO ISO VG 100", isoVg: 100, base: "synthetic", nu40Cst: 100, nu100Cst: 13, densityKgM3: 855, maxTempC: 145 },
  { id: "pao150", label: "PAO ISO VG 150", isoVg: 150, base: "synthetic", nu40Cst: 150, nu100Cst: 17, densityKgM3: 860, maxTempC: 150 },
  { id: "ester46", label: "Ester ISO VG 46", isoVg: 46, base: "ester", nu40Cst: 46, nu100Cst: 7.8, densityKgM3: 930, maxTempC: 150 },
  { id: "ester68", label: "Ester ISO VG 68", isoVg: 68, base: "ester", nu40Cst: 68, nu100Cst: 10.2, densityKgM3: 935, maxTempC: 155 },
  { id: "turbine32", label: "Turbine oil VG 32", isoVg: 32, base: "mineral", nu40Cst: 32, nu100Cst: 5.5, densityKgM3: 870, maxTempC: 100 },
  { id: "turbine46", label: "Turbine oil VG 46", isoVg: 46, base: "mineral", nu40Cst: 46, nu100Cst: 6.9, densityKgM3: 875, maxTempC: 105 },
  { id: "circulating68", label: "Circulating VG 68", isoVg: 68, base: "mineral", nu40Cst: 68, nu100Cst: 8.8, densityKgM3: 885, maxTempC: 110 },
  { id: "circulating100", label: "Circulating VG 100", isoVg: 100, base: "mineral", nu40Cst: 100, nu100Cst: 11.4, densityKgM3: 890, maxTempC: 115 },
  { id: "gear220", label: "Gear oil VG 220", isoVg: 220, base: "mineral", nu40Cst: 220, nu100Cst: 19, densityKgM3: 905, maxTempC: 110 },
  { id: "gear320", label: "Gear oil VG 320", isoVg: 320, base: "mineral", nu40Cst: 320, nu100Cst: 25, densityKgM3: 910, maxTempC: 110 },
  { id: "food68", label: "Food-grade VG 68", isoVg: 68, base: "synthetic", nu40Cst: 68, nu100Cst: 9.5, densityKgM3: 850, maxTempC: 120 },
  { id: "hydraulic46", label: "Hydraulic VG 46", isoVg: 46, base: "mineral", nu40Cst: 46, nu100Cst: 6.8, densityKgM3: 875, maxTempC: 90 },
  { id: "hydraulic68", label: "Hydraulic VG 68", isoVg: 68, base: "mineral", nu40Cst: 68, nu100Cst: 8.6, densityKgM3: 880, maxTempC: 95 },
];

export function findPlainBearingOil(id: string): PlainBearingOil | undefined {
  return PLAIN_BEARING_OILS.find((o) => o.id === id);
}

/** Dynamic viscosity (Pa·s) at temperature using Walther log-log between 40/100 °C. */
export function oilDynamicViscosityPas(oil: PlainBearingOil, tempC: number): number {
  const t = Math.max(tempC, 10);
  const logNu40 = Math.log10(oil.nu40Cst + 0.8);
  const logNu100 = Math.log10(oil.nu100Cst + 0.8);
  const slope = (logNu100 - logNu40) / (100 - 40);
  const logNu = logNu40 + slope * (t - 40);
  const nuCst = Math.max(Math.pow(10, logNu) - 0.8, 0.5);
  const density = oil.densityKgM3 * (1 - 0.00065 * (t - 15));
  return (nuCst * 1e-6) * density;
}
