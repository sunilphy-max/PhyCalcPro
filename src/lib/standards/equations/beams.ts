import type { EquationReference } from "../types";

export const beamsEquations: EquationReference[] = [
  {
    id: "beam-governing",
    label: "Euler–Bernoulli beam",
    expression: "EI \\frac{d^4 w}{dx^4} = q(x)",
    description: "Governing ODE for small-deflection beam bending.",
  },
  {
    id: "beam-bending-stress",
    label: "Bending stress",
    expression: "\\sigma_{\\max} = \\frac{M_{\\max} c}{I}",
  },
  {
    id: "beam-shear-stress",
    label: "Web shear (approx.)",
    expression: "\\tau_{\\mathrm{web}} \\approx \\frac{V_{\\max}}{A_{\\mathrm{web}}}",
  },
  {
    id: "beam-ss-central-load",
    label: "Simply supported, central P",
    expression: "M_{\\max} = \\frac{PL}{4}, \\quad \\delta_{\\max} = \\frac{PL^3}{48EI}",
  },
  {
    id: "beam-deflection-limit",
    label: "Serviceability limit",
    expression: "\\delta_{\\mathrm{limit}} = \\frac{L}{\\mathrm{deflectionLimitRatio}}",
  },
];
