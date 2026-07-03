import { metric, positive, result, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
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
};
