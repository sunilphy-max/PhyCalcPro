import { metric, positive, result, SIGMA, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
  id: "thermal-management",
  title: "Thermal Management",
  eyebrow: "Heat transfer",
  description:
    "Combine conduction, convection, radiation, and cold-plate flow estimates for electronics and advanced hardware.",
  standards: ["JEDEC thermal practice", "ASHRAE heat transfer data", "Incropera heat-transfer methods"],
  fields: [
    { key: "deltaT", label: "Temperature difference", unit: "K", defaultValue: 40, min: 0 },
    { key: "area", label: "Heat-transfer area", unit: "m^2", defaultValue: 0.08, min: 0 },
    { key: "thickness", label: "Conduction thickness", unit: "m", defaultValue: 0.004, min: 0 },
    { key: "conductivity", label: "Thermal conductivity", unit: "W/m-K", defaultValue: 205, min: 0 },
    { key: "convectionCoefficient", label: "Convection coefficient", unit: "W/m^2-K", defaultValue: 80, min: 0 },
    { key: "emissivity", label: "Surface emissivity", unit: "-", defaultValue: 0.85, min: 0 },
    { key: "hotTemperature", label: "Hot surface temperature", unit: "K", defaultValue: 340, min: 0 },
    { key: "ambientTemperature", label: "Ambient temperature", unit: "K", defaultValue: 300, min: 0 },
    { key: "flowRate", label: "Coolant mass flow", unit: "kg/s", defaultValue: 0.04, min: 0 },
    { key: "coolantCp", label: "Coolant specific heat", unit: "J/kg-K", defaultValue: 4180, min: 0 },
  ],
  solve: (input) => {
    const deltaT = Math.max(input.deltaT ?? 0, 0);
    const area = Math.max(input.area ?? 0, 0);
    const conduction = (Math.max(input.conductivity ?? 0, 0) * area * deltaT) / positive(input.thickness, 1e-9);
    const convection = Math.max(input.convectionCoefficient ?? 0, 0) * area * deltaT;
    const radiation =
      Math.max(input.emissivity ?? 0, 0) *
      SIGMA *
      area *
      Math.max(Math.pow(input.hotTemperature ?? 0, 4) - Math.pow(input.ambientTemperature ?? 0, 4), 0);
    const totalCapacity = conduction + convection + radiation;
    const thermalResistance = deltaT / positive(totalCapacity, 1e-9);
    const coolantRise = totalCapacity / (positive(input.flowRate, 1e-9) * positive(input.coolantCp, 1e-9));

    return result(
      [
        metric("totalCapacity", "Total heat-transfer capacity", totalCapacity, "W", "orange"),
        metric("conduction", "Conduction path", conduction, "W", "purple"),
        metric("convection", "Convection path", convection, "W", "blue"),
        metric("radiation", "Radiation path", radiation, "W", "green"),
        metric("thermalResistance", "Effective thermal resistance", thermalResistance, "K/W", "amber"),
        metric("coolantRise", "Coolant temperature rise", coolantRise, "K", "red"),
      ],
      [
        "Paths are shown as parallel capacity estimates for screening.",
        "Cold-plate coolant rise assumes all heat is removed by the entered mass flow.",
      ]
    );
  },
};
