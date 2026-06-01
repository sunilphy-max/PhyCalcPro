import type { PhysicsDimension } from "@/lib/physics/units";

export type UnitFieldProfile = {
  dimension: PhysicsDimension;
  defaultUnit: string;
  units: string[];
  label: string;
};

export type ModuleUnitProfile = Record<string, UnitFieldProfile>;

export const moduleUnitProfiles: Record<string, ModuleUnitProfile> = {
  corrosion: {
    initialThickness: {
      dimension: "length",
      defaultUnit: "mm",
      units: ["mm", "in", "m"],
      label: "Initial thickness",
    },
    corrosionRate: {
      dimension: "lengthPerTime",
      defaultUnit: "mm/year",
      units: ["mm/year", "in/year", "m/year"],
      label: "Corrosion rate",
    },
    designLife: {
      dimension: "time",
      defaultUnit: "year",
      units: ["year", "hr", "s"],
      label: "Design life",
    },
    safetyMargin: {
      dimension: "dimensionless",
      defaultUnit: "%",
      units: ["%", "-"],
      label: "Safety margin",
    },
  },
  fatigue: {
    alternatingStress: {
      dimension: "stress",
      defaultUnit: "MPa",
      units: ["MPa", "Pa", "GPa", "psi", "ksi"],
      label: "Alternating stress",
    },
    meanStress: {
      dimension: "stress",
      defaultUnit: "MPa",
      units: ["MPa", "Pa", "GPa", "psi", "ksi"],
      label: "Mean stress",
    },
    ultimateStrength: {
      dimension: "stress",
      defaultUnit: "MPa",
      units: ["MPa", "Pa", "GPa", "psi", "ksi"],
      label: "Ultimate strength",
    },
    enduranceLimit: {
      dimension: "stress",
      defaultUnit: "MPa",
      units: ["MPa", "Pa", "GPa", "psi", "ksi"],
      label: "Endurance limit",
    },
  },
  beams: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Length" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    udl: { dimension: "forcePerLength", defaultUnit: "N/m", units: ["N/m", "kN/m", "lbf/ft"], label: "UDL" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Inertia" },
    moment: { dimension: "moment", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "kN\u00b7m", "lbf\u00b7ft"], label: "Moment" },
    stress: { dimension: "stress", defaultUnit: "Pa", units: ["Pa", "MPa", "GPa", "psi", "ksi"], label: "Stress" },
  },
  vibrations: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Length" },
    modulus: { dimension: "stress", defaultUnit: "Pa", units: ["Pa", "MPa", "GPa", "psi"], label: "Young's modulus" },
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "in2"], label: "Area" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Inertia" },
    density: { dimension: "density", defaultUnit: "kg/m3", units: ["kg/m3", "g/cm3", "lb/ft3"], label: "Density" },
  },
  shafts: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Length" },
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Diameter" },
    torque: { dimension: "torque", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "lbf\u00b7ft"], label: "Torque" },
    moment: { dimension: "moment", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "kN\u00b7m", "lbf\u00b7ft"], label: "Bending moment" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Axial force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Stress" },
  },
  vessels: {
    radius: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Radius" },
    pressure: { dimension: "pressure", defaultUnit: "Pa", units: ["Pa", "MPa", "bar", "psi"], label: "Pressure" },
  },
  columns: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Length" },
    load: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Axial load" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Inertia" },
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "in2"], label: "Area" },
    stress: { dimension: "stress", defaultUnit: "Pa", units: ["Pa", "MPa", "GPa", "psi", "ksi"], label: "Modulus" },
  },
  welds: {
    length: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Weld size / length" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Stress" },
  },
  rivets: {
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Diameter" },
    thickness: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Thickness" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "psi"], label: "Allowable stress" },
  },
  gears: {
    module: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Module" },
    faceWidth: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Face width" },
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    torque: { dimension: "torque", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "lbf\u00b7ft"], label: "Torque" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi"], label: "Stress" },
  },
  bearings: {
    load: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Load" },
    speed: { dimension: "frequency", defaultUnit: "rpm", units: ["rpm", "Hz"], label: "Speed" },
    life: { dimension: "time", defaultUnit: "hr", units: ["hr", "s"], label: "Life" },
  },
  plates: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Length" },
    thickness: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Thickness" },
    pressure: { dimension: "pressure", defaultUnit: "Pa", units: ["Pa", "MPa", "bar", "psi"], label: "Pressure" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "psi"], label: "Stress" },
  },
  bolts: {
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Diameter" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "psi"], label: "Stress" },
  },
  "heat-exchangers": {
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "ft2"], label: "Area" },
    temperature: { dimension: "dimensionless", defaultUnit: "C", units: ["C", "K", "F"], label: "Temperature" },
  },
  hydraulics: {
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Diameter" },
    pressure: { dimension: "pressure", defaultUnit: "bar", units: ["bar", "Pa", "MPa", "psi"], label: "Pressure" },
    flow: { dimension: "volumeFlow", defaultUnit: "m3/s", units: ["m3/s", "L/min", "gpm"], label: "Flow" },
  },
  impact: {
    mass: { dimension: "mass", defaultUnit: "kg", units: ["kg", "lb"], label: "Mass" },
    velocity: { dimension: "velocity", defaultUnit: "m/s", units: ["m/s", "ft/s", "km/h"], label: "Velocity change" },
    duration: { dimension: "time", defaultUnit: "ms", units: ["ms", "s"], label: "Impact duration" },
    area: { dimension: "area", defaultUnit: "cm2", units: ["cm2", "m2", "mm2", "in2"], label: "Cross-section area" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield strength" },
    energy: { dimension: "energy", defaultUnit: "J", units: ["J", "kJ", "ft\u00b7lbf"], label: "Energy" },
  },
  fits: {
    nominalSize: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Nominal size" },
    tolerance: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in", "µm"], label: "Tolerance" },
  },
  tolerance: {
    nominalSize: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Nominal size" },
    tolerance: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in", "µm"], label: "Tolerance" },
  },
  "load-case-manager": {
    axialForce: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Axial force" },
    bendingMoment: { dimension: "moment", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "kN\u00b7m", "lbf\u00b7ft"], label: "Bending moment" },
    shearForce: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Shear force" },
    sectionWidth: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in", "ft"], label: "Section width" },
    sectionHeight: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in", "ft"], label: "Section height" },
    yieldStrength: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield strength" },
  },
  "temperature-properties": {
    baseYield: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield strength" },
    baseModulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Young's modulus" },
    coefficient: { dimension: "dimensionless", defaultUnit: "1/C", units: ["1/C", "1/K", "1/F"], label: "Thermal expansion coeff." },
    temperature: { dimension: "dimensionless", defaultUnit: "C", units: ["C", "K", "F"], label: "Operating temperature" },
  },
  pipes: {
    radius: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Radius" },
    thickness: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Wall thickness" },
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Length" },
    pressure: { dimension: "pressure", defaultUnit: "Pa", units: ["Pa", "MPa", "bar", "psi"], label: "Pressure" },
    modulus: { dimension: "stress", defaultUnit: "Pa", units: ["Pa", "MPa", "GPa", "psi"], label: "Young's modulus" },
  },
  suspension: {
    sprungMass: { dimension: "mass", defaultUnit: "kg", units: ["kg", "lb"], label: "Sprung mass" },
    trackWidth: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Track width" },
    rollStiffness: { dimension: "torque", defaultUnit: "N\u00b7m/rad", units: ["N\u00b7m/rad", "lbf\u00b7ft/rad"], label: "Roll stiffness" },
    wheelbase: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Wheelbase" },
    cgHeight: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "CG height" },
  },
  "combined-loading": {
    axialForce: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Axial force" },
    bendingMoment: { dimension: "moment", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "kN\u00b7m", "lbf\u00b7ft"], label: "Bending moment" },
    torque: { dimension: "torque", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "lbf\u00b7ft"], label: "Torsion" },
    shearForce: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Shear force" },
    sectionWidth: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in", "ft"], label: "Section width" },
    sectionHeight: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in", "ft"], label: "Section height" },
    yieldStrength: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield strength" },
  },
  rotation: {
    speed: { dimension: "frequency", defaultUnit: "rpm", units: ["rpm", "Hz", "rad/s"], label: "Speed" },
    torque: { dimension: "torque", defaultUnit: "N\u00b7m", units: ["N\u00b7m", "lbf\u00b7ft"], label: "Torque" },
    inertia: { dimension: "dimensionless", defaultUnit: "kg\u00b7m2", units: ["kg\u00b7m2", "lb\u00b7ft2"], label: "Inertia" },
  },
  cams: {
    radius: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Radius" },
    angle: { dimension: "dimensionless", defaultUnit: "deg", units: ["deg", "rad"], label: "Angle" },
    velocity: { dimension: "velocity", defaultUnit: "m/s", units: ["m/s", "mm/s"], label: "Velocity" },
  },
  flywheels: {
    mass: { dimension: "mass", defaultUnit: "kg", units: ["kg", "lb"], label: "Mass" },
    radius: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Radius" },
    speed: { dimension: "frequency", defaultUnit: "rpm", units: ["rpm", "Hz"], label: "Speed" },
  },
  sections: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Dimension" },
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "in2"], label: "Area" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Inertia" },
  },
  profiles: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Dimension" },
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "in2"], label: "Area" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Inertia" },
  },
  composites: {
    stress: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Modulus / strength" },
    density: { dimension: "density", defaultUnit: "kg/m3", units: ["kg/m3", "g/cm3", "lb/ft3"], label: "Density" },
  },
  temperature: {
    temperature: { dimension: "dimensionless", defaultUnit: "C", units: ["C", "K", "F"], label: "Temperature" },
    expansion: { dimension: "dimensionless", defaultUnit: "1/C", units: ["1/C", "1/K", "1/F"], label: "Expansion coeff." },
    length: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Length" },
  },
  frames: {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "ft", "in"], label: "Length" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "psi"], label: "Stress" },
  },
  "v-belts": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Pulley diameter" },
    centerDistance: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Center distance" },
  },
  "timing-belts": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    pitch: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Pitch" },
  },
  "roller-chains": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    pitch: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Chain pitch" },
  },
  "compression-springs": {
    wireDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Wire diameter" },
    meanDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Mean coil diameter" },
    freeLength: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Free length" },
    deflection: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Deflection" },
    modulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Shear modulus" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Ultimate strength" },
  },
  "extension-springs": {
    wireDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Wire diameter" },
    meanDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Mean coil diameter" },
    freeLength: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Free length" },
    deflection: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Extension" },
    modulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Shear modulus" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Ultimate strength" },
  },
  "torsion-springs": {
    wireDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Wire diameter" },
    meanDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Mean coil diameter" },
    legLength: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Leg length" },
    modulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Elastic modulus" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Ultimate strength" },
  },
  "multi-pulley": {
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Pulley diameter" },
    centerDistance: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Center distance" },
  },
  "bevel-gears": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    module: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Module" },
    faceWidth: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Face width" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield stress" },
  },
  "worm-gears": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    module: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Module" },
    faceWidth: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Face width" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield stress" },
  },
  "planetary-gears": {
    power: { dimension: "power", defaultUnit: "kW", units: ["kW", "W", "hp"], label: "Power" },
    module: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Module" },
  },
  "gear-ratio-design": {},
  "plain-bearings": {
    load: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Radial load" },
    diameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Journal diameter" },
    length: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Bearing length" },
    clearance: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in", "µm"], label: "Radial clearance" },
  },
  "brakes-clutches": {
    outerRadius: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Outer radius" },
    innerRadius: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Inner radius" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Actuation force" },
  },
  "keys-splines": {
    torque: { dimension: "torque", defaultUnit: "N·m", units: ["N·m", "lbf·ft"], label: "Torque" },
    shaftDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Shaft diameter" },
    keyWidth: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Key width" },
    keyHeight: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Key height" },
    keyLength: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Key length" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Yield stress" },
  },
  "shaft-hubs": {
    shaftDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Shaft diameter" },
    hubOuterDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Hub outer diameter" },
    hubLength: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Hub length" },
    interference: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in", "µm"], label: "Interference" },
    modulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Elastic modulus" },
  },
  pins: {
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Shear force" },
    pinDiameter: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Pin diameter" },
    plateThickness: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Plate thickness" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi", "ksi"], label: "Pin yield" },
  },
  "circular-plates": {
    radius: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Plate radius" },
    thickness: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in"], label: "Thickness" },
    pressure: { dimension: "pressure", defaultUnit: "Pa", units: ["Pa", "MPa", "bar", "psi"], label: "Uniform pressure" },
    modulus: { dimension: "stress", defaultUnit: "GPa", units: ["GPa", "MPa", "Pa", "psi"], label: "Elastic modulus" },
  },
  "rolled-sections": {
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in"], label: "Section depth" },
    area: { dimension: "area", defaultUnit: "m2", units: ["m2", "mm2", "in2"], label: "Area" },
    inertia: { dimension: "inertia", defaultUnit: "m4", units: ["m4", "mm4", "in4"], label: "Moment of inertia" },
  },
  "formula-reference": {
    mass: { dimension: "mass", defaultUnit: "kg", units: ["kg", "lb"], label: "Mass" },
    velocity: { dimension: "velocity", defaultUnit: "m/s", units: ["m/s", "ft/s", "km/h"], label: "Velocity" },
    flow: { dimension: "volumeFlow", defaultUnit: "m3/s", units: ["m3/s", "L/min", "gpm"], label: "Flow rate" },
    pressure: { dimension: "pressure", defaultUnit: "Pa", units: ["Pa", "MPa", "bar", "psi"], label: "Pressure drop" },
    length: { dimension: "length", defaultUnit: "m", units: ["m", "mm", "in", "ft"], label: "Length" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
  },
  "unit-converter": {
    length: { dimension: "length", defaultUnit: "mm", units: ["mm", "m", "in", "ft"], label: "Length" },
    force: { dimension: "force", defaultUnit: "N", units: ["N", "kN", "lbf"], label: "Force" },
    stress: { dimension: "stress", defaultUnit: "MPa", units: ["MPa", "Pa", "GPa", "psi"], label: "Stress" },
  },
};

export function getModuleFieldProfile(
  moduleId: string,
  fieldKey: string
): UnitFieldProfile | undefined {
  return moduleUnitProfiles[moduleId]?.[fieldKey];
}
