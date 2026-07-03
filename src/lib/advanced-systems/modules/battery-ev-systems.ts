import { metric, positive, result, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
  id: "battery-ev-systems",
  title: "Battery & EV Systems",
  eyebrow: "Battery systems",
  description:
    "Estimate pack energy, resistive heat, cooling flow, busbar area, and simple vent area for EV/battery packs.",
  standards: ["UL 2580", "SAE J2464", "ISO 6469", "IEC 62619"],
  fields: [
    { key: "seriesCells", label: "Series cells", unit: "-", defaultValue: 96, min: 1 },
    { key: "parallelCells", label: "Parallel cells", unit: "-", defaultValue: 4, min: 1 },
    { key: "cellVoltage", label: "Nominal cell voltage", unit: "V", defaultValue: 3.7, min: 0 },
    { key: "cellCapacityAh", label: "Cell capacity", unit: "Ah", defaultValue: 5, min: 0 },
    { key: "current", label: "Pack current", unit: "A", defaultValue: 200, min: 0 },
    { key: "cellResistance", label: "Cell internal resistance", unit: "ohm", defaultValue: 0.004, min: 0 },
    { key: "allowableCurrentDensity", label: "Busbar current density", unit: "A/mm^2", defaultValue: 3, min: 0 },
    { key: "coolantCp", label: "Coolant specific heat", unit: "J/kg-K", defaultValue: 3600, min: 0 },
    { key: "coolantDeltaT", label: "Allowed coolant rise", unit: "K", defaultValue: 8, min: 0 },
    { key: "gasGenerationRate", label: "Abuse gas generation", unit: "m^3/s", defaultValue: 0.05, min: 0 },
    { key: "ventVelocity", label: "Target vent velocity", unit: "m/s", defaultValue: 30, min: 0 },
  ],
  solve: (input) => {
    const seriesCells = Math.max(input.seriesCells ?? 0, 0);
    const parallelCells = positive(input.parallelCells, 1);
    const totalCells = seriesCells * parallelCells;
    const packVoltage = seriesCells * Math.max(input.cellVoltage ?? 0, 0);
    const packEnergyWh = packVoltage * parallelCells * Math.max(input.cellCapacityAh ?? 0, 0);
    const currentPerCell = Math.max(input.current ?? 0, 0) / parallelCells;
    const heatGeneration = totalCells * Math.max(input.cellResistance ?? 0, 0) * currentPerCell * currentPerCell;
    const coolingMassFlow =
      heatGeneration / (positive(input.coolantCp, 1e-9) * positive(input.coolantDeltaT, 1e-9));
    const busbarArea = Math.max(input.current ?? 0, 0) / positive(input.allowableCurrentDensity, 1e-9);
    const ventArea = Math.max(input.gasGenerationRate ?? 0, 0) / positive(input.ventVelocity, 1e-9);

    return result(
      [
        metric("packVoltage", "Nominal pack voltage", packVoltage, "V", "purple"),
        metric("packEnergy", "Nominal pack energy", packEnergyWh / 1000, "kWh", "green"),
        metric("heatGeneration", "Ohmic heat generation", heatGeneration, "W", "orange"),
        metric("coolingMassFlow", "Cooling mass flow", coolingMassFlow, "kg/s", "blue"),
        metric("busbarArea", "Minimum busbar area", busbarArea, "mm^2", "amber"),
        metric("ventArea", "Simple vent area", ventArea, "m^2", "red"),
      ],
      [
        "Heat generation uses I^2R cell heating with current divided across parallel cells.",
        "Vent area is a first-pass volumetric-flow screen, not a thermal runaway compliance calculation.",
      ]
    );
  },
};
