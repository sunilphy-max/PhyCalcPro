import type { EquationReference } from "../types";

export const columnsEquations: EquationReference[] = [
  {
    id: "euler-buckling",
    label: "Euler buckling load",
    expression: "P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}",
    description: "Elastic column buckling for slender members.",
  },
  {
    id: "column-slenderness",
    label: "Slenderness ratio",
    expression: "\\lambda = \\frac{KL}{r}, \\quad r = \\sqrt{I/A}",
  },
  {
    id: "column-utilization",
    label: "Axial utilization",
    expression: "U = \\frac{P}{P_{allow}}",
  },
];
