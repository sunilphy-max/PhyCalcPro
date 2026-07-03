import { metric, MU0, positive, result, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
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
};
