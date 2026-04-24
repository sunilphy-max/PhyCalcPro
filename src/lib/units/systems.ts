// src/lib/units/systems.ts

export const UnitSystems = {
  SI: {
    length: "m",
    force: "N",
    stress: "Pa",
    inertia: "m4",
    forcePerLength: "N/m",
    moment: "N·m",
  },

  Imperial: {
    length: "ft",
    force: "lbf",
    stress: "psi",
    inertia: "in4",
    forcePerLength: "lbf/ft",
    moment: "lbf·ft",
  }
} as const;

export type UnitSystem = keyof typeof UnitSystems;