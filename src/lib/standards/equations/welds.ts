import type { EquationReference } from "../types";

export const weldsEquations: EquationReference[] = [
  {
    id: "weld-throat-area",
    label: "Throat area",
    expression: "A_t = t \\cdot L_{eff}",
    description: "Throat thickness t and effective weld length.",
  },
  {
    id: "weld-shear",
    label: "Throat shear stress",
    expression: "\\tau = \\frac{F}{A_t}",
  },
  {
    id: "weld-combined",
    label: "Combined stress (vector sum)",
    expression: "\\sigma_{eq} = \\sqrt{\\sigma^2 + \\tau^2}",
  },
  {
    id: "weld-eccentric",
    label: "Eccentric weld group",
    expression: "\\tau_i = \\frac{F}{A_t} + \\frac{M \\cdot r_i}{J}",
  },
];
