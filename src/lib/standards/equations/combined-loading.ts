import type { EquationReference } from "../types";

export const combinedLoadingEquations: EquationReference[] = [
  {
    id: "normal-stress",
    label: "Normal stress",
    expression: "\\sigma = \\frac{N}{A} + \\frac{M c}{I}",
  },
  {
    id: "shear-stress",
    label: "Shear stress",
    expression: "\\tau = \\frac{V}{A} + \\frac{T r}{J}",
  },
  {
    id: "von-mises",
    label: "von Mises equivalent stress",
    expression: "\\sigma_{vm} = \\sqrt{\\sigma^2 + 3\\tau^2}",
  },
  {
    id: "combined-utilization",
    label: "Utilization",
    expression: "U = \\frac{\\sigma_{vm}}{\\sigma_{allow}}",
  },
];
