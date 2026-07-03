import { metric, positive, result, SIGMA, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
  id: "cryogenic-engineering",
  title: "Cryogenic Engineering",
  eyebrow: "Cryogenic systems",
  description:
    "Screen conductive/radiative heat leak, boil-off, cooldown energy, and cooldown time for low-temperature hardware.",
  standards: ["CGA cryogenic guidance", "NASA cryogenic practice", "ASTM material data"],
  fields: [
    { key: "hotTemperature", label: "Warm boundary temperature", unit: "K", defaultValue: 300, min: 0 },
    { key: "coldTemperature", label: "Cold boundary temperature", unit: "K", defaultValue: 77, min: 0 },
    { key: "area", label: "Exposed/conduction area", unit: "m^2", defaultValue: 0.5, min: 0 },
    { key: "pathLength", label: "Conduction path length", unit: "m", defaultValue: 0.1, min: 0 },
    { key: "conductivity", label: "Effective conductivity", unit: "W/m-K", defaultValue: 0.04, min: 0 },
    { key: "emissivity", label: "Effective emissivity", unit: "-", defaultValue: 0.03, min: 0 },
    { key: "coldMass", label: "Cold mass", unit: "kg", defaultValue: 25, min: 0 },
    { key: "specificHeat", label: "Average specific heat", unit: "J/kg-K", defaultValue: 450, min: 0 },
    { key: "latentHeat", label: "Cryogen latent heat", unit: "J/kg", defaultValue: 199000, min: 0 },
    { key: "coolingPower", label: "Available cooling power", unit: "W", defaultValue: 20, min: 0 },
  ],
  solve: (input) => {
    const deltaT = Math.max((input.hotTemperature ?? 0) - (input.coldTemperature ?? 0), 0);
    const area = Math.max(input.area ?? 0, 0);
    const conduction = (Math.max(input.conductivity ?? 0, 0) * area * deltaT) / positive(input.pathLength, 1e-9);
    const radiation =
      Math.max(input.emissivity ?? 0, 0) *
      SIGMA *
      area *
      Math.max(Math.pow(input.hotTemperature ?? 0, 4) - Math.pow(input.coldTemperature ?? 0, 4), 0);
    const totalHeatLeak = conduction + radiation;
    const boiloffRate = (totalHeatLeak * 86400) / positive(input.latentHeat, 1e-9);
    const cooldownEnergy = Math.max(input.coldMass ?? 0, 0) * Math.max(input.specificHeat ?? 0, 0) * deltaT;
    const cooldownTime = cooldownEnergy / positive(input.coolingPower, 1e-9);

    return result(
      [
        metric("totalHeatLeak", "Total heat leak", totalHeatLeak, "W", "orange"),
        metric("boiloffRate", "Equivalent boil-off", boiloffRate, "kg/day", "blue"),
        metric("cooldownEnergy", "Cooldown energy", cooldownEnergy, "J", "purple"),
        metric("cooldownTime", "Ideal cooldown time", cooldownTime, "s", "green"),
      ],
      [
        "Conduction uses a lumped effective thermal conductivity.",
        "Radiation uses grey-body exchange to a large surrounding boundary.",
      ],
      totalHeatLeak > (input.coolingPower ?? Infinity)
        ? ["Heat leak exceeds the entered cooling power; steady-state target temperature may not be reachable."]
        : []
    );
  },
};
