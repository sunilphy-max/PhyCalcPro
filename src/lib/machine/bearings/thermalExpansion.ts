/**
 * Thermal expansion compensation for locating + floating shaft supports.
 * ΔL = (α_shaft − α_housing) · L · ΔT — floating bearing must accommodate this float.
 */

export type ThermalExpansionInput = {
  /** Bearing span / support distance (mm). */
  spanMm: number;
  /** Operating temperature (°C). */
  operatingTempC: number;
  /** Assembly / ambient reference (°C). */
  ambientTempC?: number;
  /** Linear expansion coefficient shaft (1/K). Default steel 12e-6. */
  alphaShaftPerK?: number;
  /** Linear expansion coefficient housing (1/K). Default cast iron 10.5e-6 / steel 12e-6. */
  alphaHousingPerK?: number;
  /**
   * Available axial float at the floating bearing (mm).
   * Typical NU roller free float ≈ 0.5–2 mm depending on series; default screening 1.0 mm.
   */
  availableFloatMm?: number;
};

export type ThermalExpansionResult = {
  deltaTempK: number;
  requiredFloatMm: number;
  availableFloatMm: number;
  floatMarginMm: number;
  /** required / available — >1 means insufficient float. */
  floatUtilization: number;
  status: "ok" | "marginal" | "insufficient";
  note: string;
};

const STEEL_ALPHA = 12e-6;
const CAST_IRON_ALPHA = 10.5e-6;

export function calculateThermalExpansion(input: ThermalExpansionInput): ThermalExpansionResult {
  const ambient = input.ambientTempC ?? 20;
  const deltaTempK = input.operatingTempC - ambient;
  const alphaShaft = input.alphaShaftPerK ?? STEEL_ALPHA;
  const alphaHousing = input.alphaHousingPerK ?? CAST_IRON_ALPHA;
  const L = Math.max(input.spanMm, 0) / 1000; // m
  const requiredFloatMm = Math.abs((alphaShaft - alphaHousing) * L * deltaTempK) * 1000;
  const availableFloatMm = input.availableFloatMm ?? 1.0;
  const floatMarginMm = availableFloatMm - requiredFloatMm;
  const floatUtilization = requiredFloatMm / Math.max(availableFloatMm, 1e-9);

  let status: ThermalExpansionResult["status"] = "ok";
  if (floatUtilization > 1) status = "insufficient";
  else if (floatUtilization > 0.75) status = "marginal";

  const note =
    status === "insufficient"
      ? "Required thermal float exceeds available end-play — increase span clearance, use NU/N float, or reduce ΔT."
      : status === "marginal"
        ? "Thermal float uses most of available end-play — verify housing fit and NU series float capacity."
        : "Floating bearing can accommodate differential expansion between shaft and housing.";

  return {
    deltaTempK,
    requiredFloatMm,
    availableFloatMm,
    floatMarginMm,
    floatUtilization,
    status,
    note,
  };
}
