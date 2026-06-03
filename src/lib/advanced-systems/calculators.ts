const SIGMA = 5.670374419e-8;
const MU0 = 4 * Math.PI * 1e-7;
const GAS_R = 8.314462618;
const HYDROGEN_MOLAR_MASS = 0.002016;

export type AdvancedCalculatorId =
  | "vacuum-engineering"
  | "cryogenic-engineering"
  | "magnetic-fields"
  | "superconducting-systems"
  | "thermal-management"
  | "battery-ev-systems"
  | "hydrogen-systems"
  | "precision-motion";

export type AdvancedField = {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min?: number;
  description?: string;
};

export type AdvancedMetric = {
  key: string;
  label: string;
  value: number;
  unit: string;
  description?: string;
  tone?: "default" | "blue" | "purple" | "orange" | "red" | "amber" | "green";
};

export type AdvancedResult = Record<string, number | string[] | AdvancedMetric[]> & {
  metrics: AdvancedMetric[];
  warnings: string[];
  assumptions: string[];
};

export type AdvancedCalculatorDefinition = {
  id: AdvancedCalculatorId;
  title: string;
  eyebrow: string;
  description: string;
  standards: string[];
  fields: AdvancedField[];
  solve: (input: Record<string, number>) => AdvancedResult;
};

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function metric(
  key: string,
  label: string,
  value: number,
  unit: string,
  tone: AdvancedMetric["tone"] = "blue",
  description?: string
): AdvancedMetric {
  return { key, label, value, unit, tone, description };
}

function result(
  metrics: AdvancedMetric[],
  assumptions: string[],
  warnings: string[] = []
): AdvancedResult {
  return {
    ...Object.fromEntries(metrics.map((item) => [item.key, item.value])),
    metrics,
    assumptions,
    warnings,
  };
}

export const advancedSystemCalculators: AdvancedCalculatorDefinition[] = [
  {
    id: "vacuum-engineering",
    title: "Vacuum Engineering",
    eyebrow: "Vacuum systems",
    description:
      "Estimate pump-down time, molecular-flow conductance, chamber force, and gas throughput for vacuum hardware.",
    standards: ["ISO 21360", "ASTM E595", "AVS vacuum practice"],
    fields: [
      { key: "volume", label: "Chamber volume", unit: "m^3", defaultValue: 0.25, min: 0 },
      { key: "pumpSpeed", label: "Effective pump speed", unit: "m^3/s", defaultValue: 0.08, min: 0 },
      { key: "initialPressure", label: "Initial pressure", unit: "Pa", defaultValue: 101325, min: 0 },
      { key: "targetPressure", label: "Target pressure", unit: "Pa", defaultValue: 0.1, min: 0 },
      { key: "tubeDiameterMm", label: "Vacuum line diameter", unit: "mm", defaultValue: 50, min: 0 },
      { key: "tubeLength", label: "Vacuum line length", unit: "m", defaultValue: 1.5, min: 0 },
      { key: "pressureDiff", label: "Window/flange pressure differential", unit: "Pa", defaultValue: 101325, min: 0 },
      { key: "projectedArea", label: "Projected area", unit: "m^2", defaultValue: 0.04, min: 0 },
    ],
    solve: (input) => {
      const volume = positive(input.volume, 1e-9);
      const pumpSpeed = positive(input.pumpSpeed, 1e-9);
      const initialPressure = positive(input.initialPressure, 1e-9);
      const targetPressure = Math.min(positive(input.targetPressure, 1e-12), initialPressure * 0.999999);
      const diameterCm = positive(input.tubeDiameterMm, 1e-9) / 10;
      const tubeLengthCm = positive(input.tubeLength, 1e-9) * 100;
      const conductanceLs = (12.1 * Math.pow(diameterCm, 3)) / tubeLengthCm;
      const pumpDownTime = (volume / pumpSpeed) * Math.log(initialPressure / targetPressure);
      const chamberForce = Math.max(input.pressureDiff ?? 0, 0) * Math.max(input.projectedArea ?? 0, 0);
      const throughput = targetPressure * pumpSpeed;

      return result(
        [
          metric("pumpDownTime", "Ideal pump-down time", pumpDownTime, "s", "purple"),
          metric("conductance", "Molecular conductance", conductanceLs, "L/s", "blue"),
          metric("chamberForce", "Vacuum force", chamberForce, "N", "orange"),
          metric("throughput", "Target gas throughput", throughput, "Pa m^3/s", "green"),
        ],
        [
          "Pump-down estimate assumes isothermal ideal gas behavior and constant effective pumping speed.",
          "Conductance uses the common room-temperature molecular-flow air approximation C = 12.1 d^3 / L with d and L in cm.",
        ],
        targetPressure > 100
          ? ["Target pressure is above typical high-vacuum range; viscous-flow effects may dominate."]
          : []
      );
    },
  },
  {
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
  },
  {
    id: "magnetic-fields",
    title: "Magnetic Fields & Coils",
    eyebrow: "Electromagnetics",
    description:
      "Estimate solenoid field, inductance, stored magnetic energy, Lorentz force, and resistive heating.",
    standards: ["IEC electrical equipment practice", "MMPDS material allowables", "Magnet design handbooks"],
    fields: [
      { key: "turns", label: "Coil turns", unit: "-", defaultValue: 500, min: 0 },
      { key: "current", label: "Current", unit: "A", defaultValue: 20, min: 0 },
      { key: "coilLength", label: "Coil length", unit: "m", defaultValue: 0.25, min: 0 },
      { key: "coilArea", label: "Coil area", unit: "m^2", defaultValue: 0.01, min: 0 },
      { key: "activeWireLength", label: "Active conductor length", unit: "m", defaultValue: 1, min: 0 },
      { key: "resistance", label: "Coil resistance", unit: "ohm", defaultValue: 0.8, min: 0 },
    ],
    solve: (input) => {
      const turns = Math.max(input.turns ?? 0, 0);
      const current = Math.max(input.current ?? 0, 0);
      const coilLength = positive(input.coilLength, 1e-9);
      const coilArea = Math.max(input.coilArea ?? 0, 0);
      const field = (MU0 * turns * current) / coilLength;
      const inductance = (MU0 * turns * turns * coilArea) / coilLength;
      const storedEnergy = 0.5 * inductance * current * current;
      const lorentzForce = field * current * Math.max(input.activeWireLength ?? 0, 0);
      const coilPower = current * current * Math.max(input.resistance ?? 0, 0);

      return result(
        [
          metric("magneticField", "Solenoid field", field, "T", "purple"),
          metric("inductance", "Inductance", inductance, "H", "blue"),
          metric("storedEnergy", "Stored energy", storedEnergy, "J", "orange"),
          metric("lorentzForce", "Lorentz force", lorentzForce, "N", "green"),
          metric("coilPower", "Resistive heating", coilPower, "W", "red"),
        ],
        [
          "Magnetic field uses the long-solenoid approximation B = mu0 N I / L.",
          "Lorentz force assumes conductor length is perpendicular to the magnetic field.",
        ]
      );
    },
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: "precision-motion",
    title: "Precision Motion & Vibration",
    eyebrow: "Precision engineering",
    description:
      "Estimate flexure stiffness, natural frequency, thermal drift, and vibration isolation transmissibility.",
    standards: ["ISO 230", "ISO 10816/20816 context", "Precision machine design references"],
    fields: [
      { key: "elasticModulus", label: "Elastic modulus", unit: "Pa", defaultValue: 69e9, min: 0 },
      { key: "inertia", label: "Flexure second moment", unit: "m^4", defaultValue: 1.2e-12, min: 0 },
      { key: "flexureLength", label: "Flexure length", unit: "m", defaultValue: 0.04, min: 0 },
      { key: "movingMass", label: "Moving mass", unit: "kg", defaultValue: 1.5, min: 0 },
      { key: "alpha", label: "Thermal expansion coefficient", unit: "1/K", defaultValue: 23e-6, min: 0 },
      { key: "referenceLength", label: "Reference length", unit: "m", defaultValue: 0.3, min: 0 },
      { key: "deltaT", label: "Temperature change", unit: "K", defaultValue: 2, min: 0 },
      { key: "excitationFrequency", label: "Excitation frequency", unit: "Hz", defaultValue: 60, min: 0 },
      { key: "dampingRatio", label: "Damping ratio", unit: "-", defaultValue: 0.08, min: 0 },
    ],
    solve: (input) => {
      const stiffness =
        (3 * Math.max(input.elasticModulus ?? 0, 0) * Math.max(input.inertia ?? 0, 0)) /
        Math.pow(positive(input.flexureLength, 1e-9), 3);
      const naturalFrequency = Math.sqrt(stiffness / positive(input.movingMass, 1e-9)) / (2 * Math.PI);
      const thermalDrift =
        Math.max(input.alpha ?? 0, 0) * Math.max(input.referenceLength ?? 0, 0) * Math.max(input.deltaT ?? 0, 0);
      const ratio = Math.max(input.excitationFrequency ?? 0, 0) / positive(naturalFrequency, 1e-9);
      const damping = Math.max(input.dampingRatio ?? 0, 0);
      const transmissibility = Math.sqrt(
        (1 + Math.pow(2 * damping * ratio, 2)) /
          (Math.pow(1 - ratio * ratio, 2) + Math.pow(2 * damping * ratio, 2))
      );

      return result(
        [
          metric("stiffness", "Flexure stiffness", stiffness, "N/m", "blue"),
          metric("naturalFrequency", "Natural frequency", naturalFrequency, "Hz", "green"),
          metric("thermalDrift", "Thermal drift", thermalDrift, "m", "orange"),
          metric("frequencyRatio", "Frequency ratio", ratio, "-", "purple"),
          metric("transmissibility", "Isolation transmissibility", transmissibility, "-", transmissibility < 1 ? "green" : "red"),
        ],
        [
          "Flexure stiffness uses a cantilever tip-stiffness approximation k = 3EI/L^3.",
          "Transmissibility uses a single-degree-of-freedom base-excitation model.",
        ],
        ratio > 0.8 && ratio < 1.2 ? ["Excitation is near resonance; transmissibility is highly sensitive."] : []
      );
    },
  },
];

export function getAdvancedSystemCalculator(id: AdvancedCalculatorId): AdvancedCalculatorDefinition {
  return advancedSystemCalculators.find((calculator) => calculator.id === id) ?? advancedSystemCalculators[0]!;
}
