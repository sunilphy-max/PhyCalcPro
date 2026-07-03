/**
 * Seed cases for bootstrapping verification JSON files.
 * Run: npx tsx scripts/bootstrap-verification.ts
 */

export type VerificationSeed = {
  id: string;
  moduleId: string;
  description: string;
  inputs: Record<string, unknown>;
  /** Result fields to capture as expected values */
  fields: string[];
  tolerancePercent?: number;
  source?: string;
};

export const VERIFICATION_SEEDS: VerificationSeed[] = [
  {
    id: "impact-indicative-01",
    moduleId: "impact",
    description: "Impact load — 50 kg, 2 m/s delta-v, 10 ms duration",
    inputs: { mass: 50, velocityChange: 2, impactDuration: 10, crossSectionArea: 500, yieldStrength: 250 },
    fields: ["impulse", "averageForce", "safetyFactor"],
    tolerancePercent: 5,
    source: "Impulse-momentum screening",
  },
  {
    id: "corrosion-indicative-01",
    moduleId: "corrosion",
    description: "Corrosion allowance — 0.1 mm/yr, 20 yr life, 10 mm plate",
    inputs: { corrosionRate: 0.0001, designLife: 20, initialThickness: 0.01, safetyMargin: 20 },
    fields: ["corrosionAllowance", "requiredThickness"],
    tolerancePercent: 5,
    source: "Corrosion allowance = rate × life",
  },
  {
    id: "rotation-indicative-01",
    moduleId: "rotation",
    description: "Rotating mass — 10 kg, 0.2 m radius, 1500 rpm, 5 kW",
    inputs: { mass: 10, radius: 0.2, speedRPM: 1500, power: 5000 },
    fields: ["inertia", "kineticEnergy", "torque"],
    tolerancePercent: 5,
    source: "E = ½Iω², T = P/ω",
  },
  {
    id: "suspension-indicative-01",
    moduleId: "suspension",
    description: "Roll screening — 1200 kg sprung mass, 0.4g lateral",
    inputs: {
      sprungMass: 1200,
      lateralAcceleration: 3.92,
      wheelbase: 2.7,
      trackWidth: 1.6,
      cgHeight: 0.55,
      rollStiffness: 45000,
    },
    fields: ["lateralForce", "rollAngleDegrees", "loadTransfer"],
    tolerancePercent: 5,
    source: "Roll moment / roll stiffness",
  },
  {
    id: "rivets-indicative-01",
    moduleId: "rivets",
    description: "Single rivet shear — 6 mm, 2 kN shear",
    inputs: {
      rivetDiameter: 6,
      plateThickness: 3,
      quantity: 1,
      shearForce: 2000,
      axialForce: 0,
      rivetType: "solid",
      material: { name: "steel", yieldStress: 280e6, shearStrength: 170e6, bearingStrength: 340e6 },
    },
    fields: ["safetyFactorOverall", "safetyFactorShear"],
    tolerancePercent: 5,
    source: "Rivet shear/bearing screening",
  },
  {
    id: "welds-indicative-01",
    moduleId: "welds",
    description: "Fillet weld — 6 mm leg, 100 mm length, 10 kN",
    inputs: {
      legSize: 6,
      weldLength: 100,
      force: 10000,
      weldType: "fillet",
      electrodeStrength: 490,
    },
    fields: ["safetyFactor", "throatStress"],
    tolerancePercent: 8,
    source: "Fillet weld throat stress",
  },
  {
    id: "beams-indicative-01",
    moduleId: "beams",
    description: "Simply supported beam — center point load",
    inputs: {
      length: 4,
      E: 210e9,
      I: 8e-5,
      c: 0.15,
      support: "simply_supported",
      meshSegments: 20,
      loads: [{ position: 2, magnitude: 10000, type: "point" }],
    },
    fields: ["maxMoment", "maxDeflection"],
    tolerancePercent: 5,
    source: "Beam FEM vs analytical",
  },
  {
    id: "roller-chains-indicative-01",
    moduleId: "roller-chains",
    description: "Roller chain drive — 5 kW, 2:1 ratio",
    inputs: { power: 5000, speedRatio: 2, driverSpeed: 900, serviceFactor: 1.2 },
    fields: ["chainForce", "safetyFactor"],
    tolerancePercent: 8,
    source: "Chain power rating screening",
  },
  {
    id: "worm-gears-indicative-01",
    moduleId: "worm-gears",
    description: "Worm gear set — 20:1 ratio, 2 kW",
    inputs: { power: 2000, ratio: 20, wormSpeed: 1450, efficiency: 0.85 },
    fields: ["wormTorque", "wheelTorque"],
    tolerancePercent: 8,
    source: "Worm gear torque relations",
  },
  {
    id: "plain-bearings-indicative-01",
    moduleId: "plain-bearings",
    description: "Journal bearing — 50 mm dia, 20 kN radial",
    inputs: { diameter: 50, length: 40, radialLoad: 20000, speed: 1200, clearance: 0.05 },
    fields: ["bearingPressure", "safetyFactor"],
    tolerancePercent: 8,
    source: "Plain bearing PV screening",
  },
  {
    id: "vibrations-indicative-01",
    moduleId: "vibrations",
    description: "SDOF natural frequency — 100 kg, 50 kN/m",
    inputs: { mass: 100, stiffness: 50000, dampingRatio: 0.05, forceAmplitude: 500 },
    fields: ["naturalFrequency", "dampedFrequency"],
    tolerancePercent: 5,
    source: "fn = (1/2π)√(k/m)",
  },
  {
    id: "vessels-indicative-01",
    moduleId: "vessels",
    description: "Thin cylinder — 1 MPa, 500 mm dia, 10 mm wall",
    inputs: { pressure: 1e6, diameter: 0.5, thickness: 0.01, allowableStress: 138e6, jointEfficiency: 0.85 },
    fields: ["hoopStress", "safetyFactor"],
    tolerancePercent: 5,
    source: "Thin-wall hoop stress",
  },
  {
    id: "hydraulics-indicative-01",
    moduleId: "hydraulics",
    description: "Hydraulic cylinder — 20 MPa, 50 mm bore",
    inputs: { pressure: 20e6, boreDiameter: 0.05, rodDiameter: 0.028, stroke: 0.3 },
    fields: ["extendForce", "retractForce"],
    tolerancePercent: 5,
    source: "F = P·A",
  },
  {
    id: "vacuum-engineering-indicative-01",
    moduleId: "vacuum-engineering",
    description: "Vacuum pump sizing — default field values",
    inputs: {},
    fields: ["pumpingSpeed", "throughput"],
    tolerancePercent: 10,
    source: "Advanced systems calculator defaults",
  },
  {
    id: "unit-converter-indicative-01",
    moduleId: "unit-converter",
    description: "MPa to psi conversion",
    inputs: { value: 100, fromUnit: "MPa", toUnit: "psi", dimension: "stress" },
    fields: ["convertedValue"],
    tolerancePercent: 1,
    source: "Unit conversion",
  },
];
