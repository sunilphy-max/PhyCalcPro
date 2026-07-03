import type { EquationReference } from "../types";

export const gearsEquations: EquationReference[] = [
  {
    id: "gear-pitch-diameter",
    label: "Pitch diameter",
    expression: "d = m \\cdot z",
    description: "Module m and tooth count z.",
  },
  {
    id: "gear-lewis-bending",
    label: "Lewis bending stress (screening)",
    expression: "\\sigma_F = \\frac{F_t \\cdot Y}{b \\cdot m}",
  },
  {
    id: "gear-hertz-contact",
    label: "Hertzian contact (simplified)",
    expression: "\\sigma_H = Z_E \\sqrt{\\frac{F_t}{b \\cdot d_1} \\cdot \\frac{u+1}{u}}",
  },
  {
    id: "gear-contact-ratio",
    label: "Contact ratio",
    expression: "\\varepsilon_\\alpha = \\frac{\\text{length of action}}{p_b}",
  },
];
