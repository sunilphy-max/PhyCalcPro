import { metric, positive, result, type AdvancedCalculatorDefinition } from "../shared";

export const definition: AdvancedCalculatorDefinition = {
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
};
