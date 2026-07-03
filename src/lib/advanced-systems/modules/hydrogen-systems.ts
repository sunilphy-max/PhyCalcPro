import {
  GAS_R,
  HYDROGEN_MOLAR_MASS,
  metric,
  positive,
  result,
  type AdvancedCalculatorDefinition,
} from "../shared";

export const definition: AdvancedCalculatorDefinition = {
  id: "hydrogen-systems",
  title: "Hydrogen Systems",
  eyebrow: "Hydrogen systems",
  description:
    "Screen hydrogen storage mass, energy content, hoop stress, leak rate, and vent area.",
  standards: ["ISO 19880", "ASME B31.12", "NFPA 2", "SAE J2579"],
  fields: [
    { key: "pressure", label: "Storage pressure", unit: "Pa", defaultValue: 35e6, min: 0 },
    { key: "volume", label: "Storage volume", unit: "m^3", defaultValue: 0.12, min: 0 },
    { key: "temperature", label: "Gas temperature", unit: "K", defaultValue: 288, min: 0 },
    { key: "vesselRadius", label: "Vessel radius", unit: "m", defaultValue: 0.25, min: 0 },
    { key: "wallThickness", label: "Wall thickness", unit: "m", defaultValue: 0.012, min: 0 },
    { key: "dischargeCoefficient", label: "Discharge coefficient", unit: "-", defaultValue: 0.8, min: 0 },
    { key: "orificeArea", label: "Leak/orifice area", unit: "m^2", defaultValue: 1e-6, min: 0 },
    { key: "ventDeltaP", label: "Vent pressure differential", unit: "Pa", defaultValue: 1e6, min: 0 },
  ],
  solve: (input) => {
    const pressure = Math.max(input.pressure ?? 0, 0);
    const volume = Math.max(input.volume ?? 0, 0);
    const temperature = positive(input.temperature, 1e-9);
    const storedMass = (pressure * volume * HYDROGEN_MOLAR_MASS) / (GAS_R * temperature);
    const energyContent = storedMass * 120e6;
    const hoopStress = (pressure * Math.max(input.vesselRadius ?? 0, 0)) / positive(input.wallThickness, 1e-9);
    const density = storedMass / positive(volume, 1e-9);
    const leakMassFlow =
      Math.max(input.dischargeCoefficient ?? 0, 0) *
      Math.max(input.orificeArea ?? 0, 0) *
      Math.sqrt(2 * density * Math.max(input.ventDeltaP ?? 0, 0));
    const ventArea =
      leakMassFlow /
      (positive(input.dischargeCoefficient, 1e-9) * Math.sqrt(2 * density * Math.max(input.ventDeltaP ?? 0, 0)));

    return result(
      [
        metric("storedMass", "Stored hydrogen mass", storedMass, "kg", "green"),
        metric("energyContent", "Lower heating energy", energyContent, "J", "purple"),
        metric("hoopStress", "Thin-wall hoop stress", hoopStress, "Pa", "orange"),
        metric("gasDensity", "Ideal gas density", density, "kg/m^3", "blue"),
        metric("leakMassFlow", "Estimated leak mass flow", leakMassFlow, "kg/s", "red"),
        metric("ventArea", "Equivalent vent area", ventArea, "m^2", "amber"),
      ],
      [
        "Storage mass uses ideal gas law; high-pressure hydrogen may require compressibility factors.",
        "Hoop stress uses thin-wall approximation and does not include composite vessel rules.",
      ],
      pressure > 10e6 ? ["High-pressure hydrogen should be checked with real-gas properties and applicable vessel codes."] : []
    );
  },
};
