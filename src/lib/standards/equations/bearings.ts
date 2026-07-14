import type { EquationReference } from "../types";

/** ISO 281 / SKF rating life governing equations for calculation basis / PDF. */
export const bearingsEquations: EquationReference[] = [
  {
    id: "eq-l10",
    label: "Basic rating life L₁₀",
    expression: "L_{10h} = \\frac{a_1 \\cdot 10^6}{60 n}\\left(\\frac{C}{P}\\right)^p",
    description: "p = 3 (ball) or 10/3 (roller); a₁ from reliability Table 12",
  },
  {
    id: "eq-lnm",
    label: "Modified rating life Lnm",
    expression: "L_{nm} = a_1 \\cdot a_{\\mathrm{SKF}} \\cdot (C/P)^p \\cdot 10^6/(60n)",
    description: "aSKF ≡ ISO 281 aISO from κ, eC, Pu/P",
  },
  {
    id: "eq-kappa",
    label: "Viscosity ratio κ",
    expression: "\\kappa = \\nu / \\nu_1",
    description: "Operating viscosity ν over rated viscosity ν₁",
  },
  {
    id: "eq-static",
    label: "Static safety (ISO 76)",
    expression: "s_0 = C_0 / P_0",
    description: "Equivalent static load P₀ from family tables",
  },
];
