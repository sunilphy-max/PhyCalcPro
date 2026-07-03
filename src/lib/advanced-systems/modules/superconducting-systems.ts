import { metric, positive, result, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
  id: "superconducting-systems",
  title: "Superconducting Systems",
  eyebrow: "Superconducting coils",
  description:
    "Screen current margin, temperature margin, stored energy, dump voltage, and cooldown heat-load margin.",
  standards: ["IEC superconductivity terminology", "Cryogenic magnet practice", "MMPDS where structural support applies"],
  fields: [
    { key: "inductance", label: "Magnet inductance", unit: "H", defaultValue: 2.5, min: 0 },
    { key: "operatingCurrent", label: "Operating current", unit: "A", defaultValue: 500, min: 0 },
    { key: "criticalCurrent", label: "Critical current", unit: "A", defaultValue: 850, min: 0 },
    { key: "operatingTemperature", label: "Operating temperature", unit: "K", defaultValue: 4.2, min: 0 },
    { key: "criticalTemperature", label: "Critical temperature", unit: "K", defaultValue: 9.2, min: 0 },
    { key: "dumpResistance", label: "Dump resistance", unit: "ohm", defaultValue: 0.1, min: 0 },
    { key: "heatLoad", label: "Static heat load", unit: "W", defaultValue: 1.5, min: 0 },
    { key: "coolingPower", label: "Cryocooler capacity", unit: "W", defaultValue: 2.5, min: 0 },
  ],
  solve: (input) => {
    const inductance = Math.max(input.inductance ?? 0, 0);
    const current = Math.max(input.operatingCurrent ?? 0, 0);
    const criticalCurrent = positive(input.criticalCurrent, 1e-9);
    const storedEnergy = 0.5 * inductance * current * current;
    const currentMargin = (criticalCurrent - current) / criticalCurrent;
    const temperatureMargin = (input.criticalTemperature ?? 0) - (input.operatingTemperature ?? 0);
    const dumpVoltage = current * Math.max(input.dumpResistance ?? 0, 0);
    const dischargeTau = inductance / positive(input.dumpResistance, 1e-9);
    const heatLoadMargin = (input.coolingPower ?? 0) - (input.heatLoad ?? 0);

    return result(
      [
        metric("storedEnergy", "Stored magnetic energy", storedEnergy, "J", "orange"),
        metric("currentMargin", "Current margin", currentMargin, "-", currentMargin >= 0 ? "green" : "red"),
        metric("temperatureMargin", "Temperature margin", temperatureMargin, "K", temperatureMargin >= 0 ? "green" : "red"),
        metric("dumpVoltage", "Dump voltage", dumpVoltage, "V", "purple"),
        metric("dischargeTau", "Discharge time constant", dischargeTau, "s", "blue"),
        metric("heatLoadMargin", "Cooling margin", heatLoadMargin, "W", heatLoadMargin >= 0 ? "green" : "red"),
      ],
      [
        "Margins are simple scalar screens and do not model conductor critical surface behavior.",
        "Dump calculation assumes a single external resistance and first-order L/R decay.",
      ],
      currentMargin < 0 || temperatureMargin < 0 || heatLoadMargin < 0
        ? ["At least one superconducting operating margin is negative."]
        : []
    );
  },
};
