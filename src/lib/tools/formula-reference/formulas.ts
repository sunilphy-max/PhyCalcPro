export type FormulaCategory =
  | "motion"
  | "forces"
  | "thermal"
  | "fluids"
  | "structures"
  | "units";

export type FormulaInputDef = {
  key: string;
  label: string;
  moduleFieldKey?: string;
};

export const FORMULA_CATEGORIES: Record<FormulaCategory, string> = {
  motion: "Motion & energy",
  forces: "Forces & friction",
  thermal: "Thermal",
  fluids: "Fluids & hydraulics",
  structures: "Structures & beams",
  units: "Unit conversions",
};

export const FORMULA_INPUTS: Record<string, FormulaInputDef[]> = {
  kinetic_energy: [
    { key: "mass", label: "Mass", moduleFieldKey: "mass" },
    { key: "velocity", label: "Velocity", moduleFieldKey: "velocity" },
  ],
  potential_energy: [
    { key: "mass", label: "Mass", moduleFieldKey: "mass" },
    { key: "height", label: "Height", moduleFieldKey: "length" },
  ],
  momentum: [
    { key: "mass", label: "Mass", moduleFieldKey: "mass" },
    { key: "velocity", label: "Velocity", moduleFieldKey: "velocity" },
  ],
  centripetal_force: [
    { key: "mass", label: "Mass", moduleFieldKey: "mass" },
    { key: "velocity", label: "Velocity", moduleFieldKey: "velocity" },
    { key: "radius", label: "Radius", moduleFieldKey: "length" },
  ],
  uniform_accel_velocity: [
    { key: "u", label: "Initial velocity" },
    { key: "a", label: "Acceleration" },
    { key: "t", label: "Time (s)" },
  ],
  uniform_accel_displacement: [
    { key: "u", label: "Initial velocity" },
    { key: "a", label: "Acceleration" },
    { key: "t", label: "Time (s)" },
  ],
  friction_force: [
    { key: "mu", label: "Friction coefficient μ" },
    { key: "normalForce", label: "Normal force", moduleFieldKey: "force" },
  ],
  inclined_plane_axial: [
    { key: "mass", label: "Mass", moduleFieldKey: "mass" },
    { key: "angleDeg", label: "Plane angle (deg)" },
    { key: "mu", label: "Friction coefficient μ" },
  ],
  spring_potential: [
    { key: "k", label: "Spring rate (N/m)" },
    { key: "x", label: "Deflection", moduleFieldKey: "length" },
  ],
  thermal_expansion: [
    { key: "alpha", label: "Coefficient of thermal expansion (1/K)" },
    { key: "length", label: "Original length", moduleFieldKey: "length" },
    { key: "deltaT", label: "Temperature change (K or °C)" },
  ],
  heat_conduction_rate: [
    { key: "k", label: "Thermal conductivity (W/m·K)" },
    { key: "area", label: "Area", moduleFieldKey: "area" },
    { key: "deltaT", label: "ΔT (K)" },
    { key: "thickness", label: "Thickness", moduleFieldKey: "length" },
  ],
  pump_power: [
    { key: "flow", label: "Volume flow rate", moduleFieldKey: "flow" },
    { key: "pressureDrop", label: "Pressure drop", moduleFieldKey: "pressure" },
  ],
  hydraulic_cylinder_force: [
    { key: "pressure", label: "Pressure", moduleFieldKey: "pressure" },
    { key: "bore", label: "Bore diameter", moduleFieldKey: "length" },
  ],
  orifice_flow: [
    { key: "cd", label: "Discharge coefficient" },
    { key: "area", label: "Orifice area", moduleFieldKey: "area" },
    { key: "deltaP", label: "Pressure drop", moduleFieldKey: "pressure" },
    { key: "rho", label: "Density (kg/m³)" },
  ],
  beam_max_moment_udl: [
    { key: "w", label: "UDL", moduleFieldKey: "force" },
    { key: "L", label: "Span", moduleFieldKey: "length" },
  ],
  beam_max_deflection_udl_ss: [
    { key: "w", label: "UDL (N/m)" },
    { key: "L", label: "Span", moduleFieldKey: "length" },
    { key: "E", label: "Elastic modulus", moduleFieldKey: "modulus" },
    { key: "I", label: "Second moment", moduleFieldKey: "inertia" },
  ],
  beam_shear_stress_rect: [
    { key: "V", label: "Shear force", moduleFieldKey: "force" },
    { key: "b", label: "Width", moduleFieldKey: "length" },
    { key: "h", label: "Depth", moduleFieldKey: "length" },
  ],
  euler_buckling_load: [
    { key: "E", label: "Elastic modulus", moduleFieldKey: "modulus" },
    { key: "I", label: "Second moment", moduleFieldKey: "inertia" },
    { key: "L", label: "Length", moduleFieldKey: "length" },
    { key: "K", label: "Effective length factor K" },
  ],
  hoop_stress_thin_cylinder: [
    { key: "p", label: "Pressure", moduleFieldKey: "pressure" },
    { key: "r", label: "Radius", moduleFieldKey: "length" },
    { key: "t", label: "Wall thickness", moduleFieldKey: "length" },
  ],
  torque_power: [
    { key: "torque", label: "Torque (N·m)" },
    { key: "rpm", label: "Speed (rpm)" },
  ],
  stress_concentration_kt: [
    { key: "nominalStress", label: "Nominal stress (Pa)" },
    { key: "Kt", label: "Stress concentration factor Kt" },
  ],
  von_mises_2d: [
    { key: "sx", label: "σx (Pa)" },
    { key: "sy", label: "σy (Pa)" },
    { key: "txy", label: "τxy (Pa)" },
  ],
  psi_to_pa: [{ key: "psi", label: "Pressure (psi)" }],
  mph_to_mps: [{ key: "mph", label: "Speed (mph)" }],
  hp_to_watts: [{ key: "hp", label: "Power (hp)" }],
  lbf_to_n: [{ key: "lbf", label: "Force (lbf)" }],
  in_to_m: [{ key: "inch", label: "Length (in)" }],
};

export const FORMULA_IDS = Object.keys(FORMULA_INPUTS);

type FormulaDef = {
  name: string;
  expression: string;
  unit: string;
  category: FormulaCategory;
  calc: (i: Record<string, number>) => number;
};

export const FORMULAS: Record<string, FormulaDef> = {
  kinetic_energy: {
    name: "Kinetic energy",
    expression: "E = ½·m·v²",
    unit: "J",
    category: "motion",
    calc: (i) => 0.5 * i.mass * i.velocity ** 2,
  },
  potential_energy: {
    name: "Gravitational potential energy",
    expression: "E = m·g·h (g=9.81)",
    unit: "J",
    category: "motion",
    calc: (i) => i.mass * 9.81 * i.height,
  },
  momentum: {
    name: "Linear momentum",
    expression: "p = m·v",
    unit: "kg·m/s",
    category: "motion",
    calc: (i) => i.mass * i.velocity,
  },
  centripetal_force: {
    name: "Centripetal force",
    expression: "F = m·v²/r",
    unit: "N",
    category: "motion",
    calc: (i) => (i.mass * i.velocity ** 2) / Math.max(i.radius, 1e-12),
  },
  uniform_accel_velocity: {
    name: "Velocity (constant acceleration)",
    expression: "v = u + a·t",
    unit: "m/s",
    category: "motion",
    calc: (i) => i.u + i.a * i.t,
  },
  uniform_accel_displacement: {
    name: "Displacement (constant acceleration)",
    expression: "s = u·t + ½·a·t²",
    unit: "m",
    category: "motion",
    calc: (i) => i.u * i.t + 0.5 * i.a * i.t ** 2,
  },
  friction_force: {
    name: "Coulomb friction",
    expression: "F = μ·N",
    unit: "N",
    category: "forces",
    calc: (i) => i.mu * i.normalForce,
  },
  inclined_plane_axial: {
    name: "Block on incline (axial component)",
    expression: "F = m·g·sinθ − μ·m·g·cosθ",
    unit: "N",
    category: "forces",
    calc: (i) => {
      const t = (i.angleDeg * Math.PI) / 180;
      return i.mass * 9.81 * (Math.sin(t) - i.mu * Math.cos(t));
    },
  },
  spring_potential: {
    name: "Elastic potential energy",
    expression: "E = ½·k·x²",
    unit: "J",
    category: "forces",
    calc: (i) => 0.5 * i.k * i.x ** 2,
  },
  thermal_expansion: {
    name: "Linear thermal expansion",
    expression: "ΔL = α·L·ΔT",
    unit: "m",
    category: "thermal",
    calc: (i) => i.alpha * i.length * i.deltaT,
  },
  heat_conduction_rate: {
    name: "Fourier conduction rate",
    expression: "Q = k·A·ΔT/t",
    unit: "W",
    category: "thermal",
    calc: (i) => (i.k * i.area * i.deltaT) / Math.max(i.thickness, 1e-12),
  },
  pump_power: {
    name: "Pump hydraulic power",
    expression: "P = Q·Δp",
    unit: "W",
    category: "fluids",
    calc: (i) => i.flow * i.pressureDrop,
  },
  hydraulic_cylinder_force: {
    name: "Hydraulic cylinder force",
    expression: "F = p·π·D²/4",
    unit: "N",
    category: "fluids",
    calc: (i) => (i.pressure * Math.PI * i.bore ** 2) / 4,
  },
  orifice_flow: {
    name: "Orifice volumetric flow (incompressible)",
    expression: "Q = Cd·A·√(2Δp/ρ)",
    unit: "m³/s",
    category: "fluids",
    calc: (i) => i.cd * i.area * Math.sqrt((2 * Math.max(i.deltaP, 0)) / Math.max(i.rho, 1e-9)),
  },
  beam_max_moment_udl: {
    name: "Max moment — simply supported UDL",
    expression: "M = w·L²/8",
    unit: "N·m",
    category: "structures",
    calc: (i) => (i.w * i.L ** 2) / 8,
  },
  beam_max_deflection_udl_ss: {
    name: "Max deflection — SS beam UDL",
    expression: "δ = 5·w·L⁴/(384·E·I)",
    unit: "m",
    category: "structures",
    calc: (i) => (5 * i.w * i.L ** 4) / (384 * i.E * Math.max(i.I, 1e-18)),
  },
  beam_shear_stress_rect: {
    name: "Max shear stress — rectangular section",
    expression: "τ = 1.5·V/(b·h)",
    unit: "Pa",
    category: "structures",
    calc: (i) => (1.5 * i.V) / Math.max(i.b * i.h, 1e-12),
  },
  euler_buckling_load: {
    name: "Euler buckling load",
    expression: "Pcr = π²·E·I/(K·L)²",
    unit: "N",
    category: "structures",
    calc: (i) => (Math.PI ** 2 * i.E * i.I) / Math.max((i.K * i.L) ** 2, 1e-18),
  },
  hoop_stress_thin_cylinder: {
    name: "Thin-wall hoop stress",
    expression: "σ = p·r/t",
    unit: "Pa",
    category: "structures",
    calc: (i) => (i.p * i.r) / Math.max(i.t, 1e-12),
  },
  torque_power: {
    name: "Shaft power from torque",
    expression: "P = T·ω = T·2π·n/60",
    unit: "W",
    category: "motion",
    calc: (i) => (i.torque * 2 * Math.PI * i.rpm) / 60,
  },
  stress_concentration_kt: {
    name: "Peak stress with Kt",
    expression: "σpeak = Kt·σnom",
    unit: "Pa",
    category: "structures",
    calc: (i) => i.Kt * i.nominalStress,
  },
  von_mises_2d: {
    name: "Von Mises (2D plane stress)",
    expression: "σvm = √(σx² − σx·σy + σy² + 3τ²)",
    unit: "Pa",
    category: "structures",
    calc: (i) =>
      Math.sqrt(i.sx ** 2 - i.sx * i.sy + i.sy ** 2 + 3 * i.txy ** 2),
  },
  psi_to_pa: {
    name: "psi → pascal",
    expression: "Pa = psi × 6894.757",
    unit: "Pa",
    category: "units",
    calc: (i) => i.psi * 6894.757293168,
  },
  mph_to_mps: {
    name: "mph → m/s",
    expression: "m/s = mph × 0.44704",
    unit: "m/s",
    category: "units",
    calc: (i) => i.mph * 0.44704,
  },
  hp_to_watts: {
    name: "hp → watts",
    expression: "W = hp × 745.7",
    unit: "W",
    category: "units",
    calc: (i) => i.hp * 745.699872,
  },
  lbf_to_n: {
    name: "lbf → newton",
    expression: "N = lbf × 4.44822",
    unit: "N",
    category: "units",
    calc: (i) => i.lbf * 4.4482216152605,
  },
  in_to_m: {
    name: "inch → meter",
    expression: "m = in × 0.0254",
    unit: "m",
    category: "units",
    calc: (i) => i.inch * 0.0254,
  },
};

export function formulasByCategory(category: FormulaCategory | "all") {
  return FORMULA_IDS.filter((id) => category === "all" || FORMULAS[id].category === category);
}
