import { allModules } from "@/data/modules";
import {
  DEFAULT_WORKFLOW_MODES,
  type DesignWorkflowMode,
} from "@/lib/design-workflows/workflowModeLabels";

export type { DesignWorkflowMode };

export type CandidateRow = {
  option: string;
  basis: string;
  pass: string;
  tradeoff: string;
};

export type ModuleDesignWorkflow = {
  moduleId: string;
  title: string;
  category: string;
  maturity: "workflow" | "solver-backed" | "catalog-backed";
  modes: Array<{
    id: DesignWorkflowMode;
    label: string;
    description: string;
  }>;
  designInputs: string[];
  autoSizingTargets: string[];
  candidateColumns: string[];
  candidates: CandidateRow[];
  catalogTables: string[];
  linkedWorkflowModuleIds: string[];
  expertNotes: string[];
  gaps: string[];
};

const DEFAULT_MODES: ModuleDesignWorkflow["modes"] = DEFAULT_WORKFLOW_MODES;

const CATEGORY_TEMPLATES: Record<
  string,
  Omit<ModuleDesignWorkflow, "moduleId" | "title" | "category">
> = {
  structural: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: [
      "Target load cases and support conditions",
      "Material allowable stress or yield strength",
      "Stiffness or deflection target",
      "Preferred section family or envelope limit",
    ],
    autoSizingTargets: [
      "Required section modulus",
      "Required second moment of area",
      "Candidate section utilization",
      "Deflection reserve",
    ],
    candidateColumns: ["Section", "Stress utilization", "Deflection", "Mass / envelope"],
    candidates: [
      { option: "Light candidate", basis: "Minimum envelope", pass: "Check stress and deflection", tradeoff: "Lowest mass; lowest reserve" },
      { option: "Balanced candidate", basis: "Target utilization", pass: "Pass expected", tradeoff: "Best first production choice" },
      { option: "Stiff candidate", basis: "Deflection margin", pass: "Pass with reserve", tradeoff: "Higher mass and cost" },
    ],
    catalogTables: ["Material allowable table", "Section property table", "Deflection limit presets"],
    linkedWorkflowModuleIds: ["combined-loading", "fatigue", "welds", "bolts"],
    expertNotes: [
      "Auto-design should compare at least three candidate sizes, not only report a single pass/fail result.",
      "Deflection and local connection details often govern before peak stress.",
    ],
    gaps: ["Full code-specific member design remains module-dependent.", "No automatic procurement catalog is connected yet."],
  },
  "power-transmission": {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Power", "Speed", "Service factor", "Center distance", "Preferred catalog family"],
    autoSizingTargets: ["Belt/chain size", "Pulley/sprocket diameter", "Wrap angle", "Service life margin"],
    candidateColumns: ["Drive size", "Power margin", "Geometry", "Service factor"],
    candidates: [
      { option: "Compact drive", basis: "Smallest pitch/section", pass: "May require high tension", tradeoff: "Small footprint" },
      { option: "Standard drive", basis: "Catalog service factor", pass: "Pass expected", tradeoff: "Balanced life and size" },
      { option: "Heavy-duty drive", basis: "Higher strand/section", pass: "High reserve", tradeoff: "More cost and inertia" },
    ],
    catalogTables: ["Belt sections", "Chain pitches", "Pulley/sprocket standards", "Service factors"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "keys-splines", "safety-factor"],
    expertNotes: ["Shaft load and bearing life should be checked after drive selection."],
    gaps: ["Manufacturer-specific rating tables are not fully embedded."],
  },
  machine: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Power or torque", "Speed", "Duty cycle", "Material", "Target safety factor"],
    autoSizingTargets: ["Minimum diameter/size", "Fatigue margin", "Deflection or stiffness", "Critical-speed margin"],
    candidateColumns: ["Candidate", "Static SF", "Fatigue / life", "Weight / cost"],
    candidates: [
      { option: "Minimum size", basis: "Static strength", pass: "Screen fatigue", tradeoff: "Compact but sensitive" },
      { option: "Recommended size", basis: "Strength + stiffness", pass: "Pass expected", tradeoff: "Balanced" },
      { option: "Robust size", basis: "High reserve", pass: "Pass with margin", tradeoff: "Larger and heavier" },
    ],
    catalogTables: ["Material grades", "Standard diameters", "Bearing series", "Gear/tooth standards"],
    linkedWorkflowModuleIds: ["fatigue", "keys-splines", "bearings", "gear-ratio-design"],
    expertNotes: ["Rotating machinery should be designed around strength, stiffness, life and speed margin together."],
    gaps: ["Detailed vendor catalogs and automatic assembly linking are planned."],
  },
  springs: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Target force", "Travel or angle", "Envelope", "Material", "Cycle life"],
    autoSizingTargets: ["Wire diameter", "Mean coil diameter", "Active coils", "Stress margin"],
    candidateColumns: ["Spring geometry", "Rate", "Stress", "Solid / travel margin"],
    candidates: [
      { option: "Compact spring", basis: "Small envelope", pass: "Check stress", tradeoff: "Higher stress" },
      { option: "Balanced spring", basis: "Target rate", pass: "Pass expected", tradeoff: "Moderate envelope" },
      { option: "Long-life spring", basis: "Lower stress", pass: "High fatigue margin", tradeoff: "Larger size" },
    ],
    catalogTables: ["Spring wire catalog (EN 10270)", "Material modulus", "End condition factors"],
    linkedWorkflowModuleIds: ["fatigue", "materials/database", "compression-springs", "extension-springs", "torsion-springs"],
    expertNotes: ["All three spring sub-modules share wire catalog and EN 13906 fatigue screening."],
    gaps: ["Full EN 13906 nomograph digitization and hook FEA not embedded."],
  },
  fasteners: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Joint loads", "Pattern geometry", "Material/grade", "Preload or fit", "Target safety factor"],
    autoSizingTargets: ["Fastener size", "Grade", "Embedment/engagement", "Group utilization"],
    candidateColumns: ["Size/grade", "Shear", "Tension/bearing", "Installability"],
    candidates: [
      { option: "Small fastener", basis: "Minimum geometry", pass: "Check bearing", tradeoff: "Compact pattern" },
      { option: "Recommended fastener", basis: "Balanced utilization", pass: "Pass expected", tradeoff: "Standard hardware" },
      { option: "Heavy fastener", basis: "High reserve", pass: "High margin", tradeoff: "More space/cost" },
    ],
    catalogTables: ["Bolt grades", "Thread sizes", "Keyway/spline dimensions", "Weld throat/leg sizes"],
    linkedWorkflowModuleIds: ["combined-loading", "fatigue", "shafts", "materials/database"],
    expertNotes: ["Connection detailing and eccentricity often control more than nominal stress."],
    gaps: ["Automatic bolt/weld pattern optimization is not complete."],
  },
  materials: {
    maturity: "catalog-backed",
    modes: DEFAULT_MODES,
    designInputs: ["Material family", "Temperature", "Environment", "Load type", "Life target"],
    autoSizingTargets: ["Allowable stress", "Fatigue limit", "Temperature derating", "Corrosion allowance"],
    candidateColumns: ["Material", "Strength", "Environment", "Availability"],
    candidates: [
      { option: "Baseline material", basis: "Common grade", pass: "Check environment", tradeoff: "Available" },
      { option: "Higher-strength material", basis: "Stress margin", pass: "Pass strength", tradeoff: "Cost/ductility" },
      { option: "Environment-resistant material", basis: "Corrosion/temperature", pass: "Pass environment", tradeoff: "Cost" },
    ],
    catalogTables: ["Material grades", "Temperature properties", "S-N curves", "Corrosion rates"],
    linkedWorkflowModuleIds: ["fatigue", "corrosion", "temperature-properties", "sections"],
    expertNotes: ["Material selection should include temperature, corrosion and fatigue context, not only yield strength."],
    gaps: ["Traceable vendor/material certificates are not connected."],
  },
  pressure: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Pressure", "Temperature", "Diameter", "Material", "Corrosion allowance"],
    autoSizingTargets: ["Wall thickness", "Hoop/longitudinal stress", "Pressure drop", "Support load"],
    candidateColumns: ["Thickness/schedule", "Stress margin", "Pressure drop", "Code context"],
    candidates: [
      { option: "Minimum wall", basis: "Pressure stress", pass: "Check corrosion", tradeoff: "Lowest mass" },
      { option: "Standard schedule", basis: "Nearest catalog", pass: "Pass expected", tradeoff: "Procurement ready" },
      { option: "Heavy wall", basis: "High pressure/erosion", pass: "High reserve", tradeoff: "Cost/weight" },
    ],
    catalogTables: ["Pipe schedules", "Vessel material allowables", "Corrosion allowances", "Fluid properties"],
    linkedWorkflowModuleIds: ["corrosion", "temperature-properties", "welds", "safety-factor"],
    expertNotes: ["Pressure components need code boundary review before production use."],
    gaps: ["Full ASME/EN code worksheets and nozzle/support detail checks are partial."],
  },
  dynamics: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Mass/inertia", "Stiffness", "Damping", "Excitation", "Operating speed"],
    autoSizingTargets: ["Natural frequency", "Separation margin", "Damping ratio", "Shock response"],
    candidateColumns: ["Configuration", "Frequency", "Margin", "Response"],
    candidates: [
      { option: "Soft system", basis: "Isolation", pass: "Check travel", tradeoff: "Large motion" },
      { option: "Balanced system", basis: "Frequency separation", pass: "Pass expected", tradeoff: "Moderate response" },
      { option: "Stiff system", basis: "Low deflection", pass: "High stiffness", tradeoff: "Transmits vibration" },
    ],
    catalogTables: ["Damping ratios", "Isolation mounts", "Shock factors", "Rotor balance grades"],
    linkedWorkflowModuleIds: ["shafts", "fatigue", "precision-motion", "safety-factor"],
    expertNotes: ["Avoid operating continuously near resonance; check startup and transient conditions."],
    gaps: ["Full time-domain and modal superposition workflows are planned."],
  },
  manufacturing: {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Nominal dimensions", "Functional gap", "Tolerance class", "Process capability", "Cost target"],
    autoSizingTargets: ["Worst-case stack", "RSS/Monte Carlo yield", "Fit class", "Cost sensitivity"],
    candidateColumns: ["Tolerance/process", "Yield", "Cost", "Risk"],
    candidates: [
      { option: "Loose tolerance", basis: "Low cost", pass: "Check function", tradeoff: "Higher variation" },
      { option: "Functional tolerance", basis: "Assembly target", pass: "Pass expected", tradeoff: "Balanced" },
      { option: "Precision tolerance", basis: "High yield", pass: "High confidence", tradeoff: "Higher cost" },
    ],
    catalogTables: ["ISO 286 fits", "ASME Y14.5 controls", "Process capability", "Cost factors"],
    linkedWorkflowModuleIds: ["fits", "sections", "shaft-hubs", "cost-estimator"],
    expertNotes: ["Design tolerances from functional limits, then loosen non-critical dimensions."],
    gaps: ["Full GD&T datum-chain solver is not implemented."],
  },
  "advanced-systems": {
    maturity: "workflow",
    modes: DEFAULT_MODES,
    designInputs: ["Operating envelope", "Material/environment", "Heat/load source", "Allowable margin", "Reference standard"],
    autoSizingTargets: ["Heat load", "Stored energy", "Force/stress", "Operating margin"],
    candidateColumns: ["Configuration", "Margin", "Risk", "Next linked check"],
    candidates: [
      { option: "Research screen", basis: "Fast estimate", pass: "Flag risks", tradeoff: "Lowest detail" },
      { option: "Preliminary design", basis: "Balanced assumptions", pass: "Pass expected", tradeoff: "Needs verification" },
      { option: "Conservative design", basis: "Margin-first", pass: "High reserve", tradeoff: "Heavier/costlier" },
    ],
    catalogTables: ["Cryogenic properties", "Vacuum conductance", "Magnet constants", "Battery/hydrogen safety references"],
    linkedWorkflowModuleIds: ["thermal-management", "materials/database", "fatigue", "combined-loading"],
    expertNotes: ["Advanced systems need assumptions shown prominently because coupled physics can dominate simple checks."],
    gaps: ["Coupled multiphysics, vendor catalogs and compliance workflows are not fully implemented."],
  },
  tools: {
    maturity: "catalog-backed",
    modes: DEFAULT_MODES,
    designInputs: ["Formula inputs", "Unit system", "Reference basis"],
    autoSizingTargets: ["Converted value", "Formula result", "Reusable calculation basis"],
    candidateColumns: ["Formula/table", "Input", "Output", "Use in module"],
    candidates: [
      { option: "Reference formula", basis: "Known equation", pass: "Use in report", tradeoff: "Manual applicability" },
      { option: "Unit conversion", basis: "SI base layer", pass: "Pass", tradeoff: "Dimension must match" },
      { option: "Linked module", basis: "Open calculator", pass: "Continue workflow", tradeoff: "Requires module-specific input" },
    ],
    catalogTables: ["Formula catalog", "Unit conversion table", "NIST/ISO unit references"],
    linkedWorkflowModuleIds: ["beams", "shafts", "thermal-management", "unit-converter"],
    expertNotes: ["Reference formulas should feed module inputs rather than replace module-specific checks."],
    gaps: ["Symbolic derivation and automatic formula chaining are not implemented."],
  },
};

const MODULE_OVERRIDES: Record<string, Partial<ModuleDesignWorkflow>> = {
  beams: {
    maturity: "solver-backed",
    designInputs: ["Target load case", "Application preset", "Material", "Span/supports", "Allowable deflection"],
    autoSizingTargets: ["Required section modulus", "Required second moment of area", "Nearest section candidate", "Stress and deflection utilization"],
    linkedWorkflowModuleIds: ["combined-loading", "fatigue", "welds", "bolts", "rolled-sections"],
    expertNotes: [
      "Use Compare to review section candidates; Validate verifies the geometry currently in the form.",
    ],
    gaps: ["Connection and lateral-torsional buckling checks remain module-dependent."],
  },
  columns: {
    maturity: "solver-backed",
    designInputs: ["Axial load", "Column length", "End condition", "Target buckling safety factor"],
    autoSizingTargets: ["Critical load", "Effective length", "Lightest passing catalog section", "Slenderness ratio"],
    linkedWorkflowModuleIds: ["combined-loading", "rolled-sections", "safety-factor"],
    expertNotes: ["Auto-design searches rolled sections for minimum weight at the target safety factor."],
    gaps: ["Inelastic buckling and code-specific column curves are not fully embedded."],
  },
  "compression-springs": {
    maturity: "solver-backed",
    designInputs: ["Target rate", "Maximum force", "Maximum OD", "Material", "Free length"],
    autoSizingTargets: ["Wire diameter", "Mean coil diameter", "Active coils", "Stress margin"],
    linkedWorkflowModuleIds: ["fatigue", "materials/database", "safety-factor"],
    expertNotes: ["Auto-design iterates wire diameter and active coils within the OD envelope."],
    gaps: ["Full wire-stock catalog and EN 13906 nomograph digitization need deeper integration."],
  },
  "extension-springs": {
    maturity: "solver-backed",
    designInputs: ["Target rate", "Maximum force", "Initial tension", "Hook type", "Material"],
    autoSizingTargets: ["Wire diameter", "Active coils", "Hook safety factor"],
    linkedWorkflowModuleIds: ["fatigue", "materials/database", "compression-springs"],
    expertNotes: ["Hook stress often governs; verify initial tension against manufacturable limit."],
    gaps: ["EN 13906-2 hook fatigue nomograph and hook FEA not embedded."],
  },
  "torsion-springs": {
    maturity: "solver-backed",
    designInputs: ["Target rate", "Deflection angle", "Leg length", "Material"],
    autoSizingTargets: ["Wire diameter", "Active coils", "Leg length", "Coil bending SF"],
    linkedWorkflowModuleIds: ["fatigue", "materials/database"],
    expertNotes: ["Rate k = Ed⁴/(64·D·n) with curvature factor on coil bending stress."],
    gaps: ["Leg junction FEA and EN 13906-3 full nomograph not embedded."],
  },
  "v-belts": {
    maturity: "solver-backed",
    designInputs: ["Power", "Speed ratio", "Driver speed", "Service factor"],
    autoSizingTargets: ["Belt section", "Driver/driven diameters", "Center distance", "Power utilization"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "multi-pulley", "safety-factor"],
    expertNotes: ["Auto-design screens belt sections and pulley sizes from power, speed ratio, and service factor."],
    gaps: ["Manufacturer-specific rating tables are not fully embedded."],
  },
  shafts: {
    maturity: "solver-backed",
    designInputs: ["Power/rpm or torque", "Bearing spacing", "Gear/pulley loads", "Material", "Keyways/shoulders/Kt", "Target safety factor"],
    autoSizingTargets: ["Minimum shaft diameter", "Nearest standard diameter", "Fatigue safety factor", "Bearing slope/deflection", "Critical speed margin"],
    catalogTables: ["Standard shaft diameters", "DIN 743 factors", "AGMA/ASME shaft factors", "Keyway dimensions", "Bearing series"],
    linkedWorkflowModuleIds: ["keys-splines", "bearings", "gears", "fatigue", "shaft-hubs"],
    expertNotes: ["MITCalc-like shaft design must link torque, bending, Kt/Kf, fatigue, bearings, keys and critical speed."],
    gaps: ["Full DIN 743 EU worksheet (K_sigma, K_tau, gamma_F) and AGMA 6001 load templates still need integration."],
  },
  gears: {
    maturity: "solver-backed",
    designInputs: ["Power", "Ratio", "Speed", "Material", "Duty factor", "Target safety factors"],
    autoSizingTargets: ["Module/DP", "Tooth counts", "Face width", "Bending/contact safety", "Center distance"],
    catalogTables: ["AGMA/ISO gear factors", "Standard modules", "Material hardness", "Lubrication factors"],
    linkedWorkflowModuleIds: ["gear-ratio-design", "shafts", "bearings", "keys-splines"],
    expertNotes: ["Auto-design should generate tooth-count candidates before strength checking."],
  },
  bearings: {
    maturity: "solver-backed",
    designInputs: ["Radial/axial load", "Speed", "Required life", "Reliability", "Bore/space limits", "Lubrication class"],
    autoSizingTargets: ["Required dynamic rating", "Catalog designation", "L10/Lnm life", "Static C₀/P₀", "Speed margin"],
    catalogTables: ["ISO 281 life factors", "ISO 76 static ratings", "Deep groove / angular / NU catalog", "Lubrication a_ISO screening"],
    linkedWorkflowModuleIds: ["shafts", "plain-bearings", "fatigue"],
    expertNotes: ["Shaft FEM handoff imports Fr, Fa, and speed. Design mode ranks full catalog by C, C₀, and n_lim."],
    gaps: ["Full SKF/INA database, paired bearing arrangements, and ISO 281 a_ISO from κ/ηc still need integration."],
  },
  bolts: {
    maturity: "solver-backed",
    designInputs: ["Tension/shear", "Joint members", "Bolt pattern", "Preload", "Grade"],
    autoSizingTargets: ["Bolt diameter", "Grade", "Preload", "Thread engagement", "Group utilization"],
    catalogTables: ["ISO/ASME bolt sizes", "Property classes", "AISC/VDI factors"],
    linkedWorkflowModuleIds: ["welds", "pins", "combined-loading", "safety-factor"],
  },
  vessels: {
    maturity: "solver-backed",
    designInputs: ["Pressure", "Diameter", "Temperature", "Material", "Corrosion allowance", "Joint efficiency"],
    autoSizingTargets: ["Required thickness", "Nearest plate thickness", "Hoop/longitudinal stress", "Corrosion life"],
    catalogTables: ["ASME VIII allowables", "EN 13445 material data", "Plate thicknesses"],
    linkedWorkflowModuleIds: ["corrosion", "welds", "temperature-properties", "safety-factor"],
  },
  "vacuum-engineering": {
    maturity: "solver-backed",
    designInputs: ["Chamber volume", "Target pressure", "Pump speed", "Line diameter/length", "Window area"],
    autoSizingTargets: ["Pump speed", "Line conductance", "Pump-down time", "Vacuum force", "Throughput margin"],
    catalogTables: ["Pump speed classes", "Vacuum conductance", "Outgassing references", "Flange/window load references"],
    linkedWorkflowModuleIds: ["thermal-management", "cryogenic-engineering", "combined-loading", "materials/database"],
  },
  "cryogenic-engineering": {
    maturity: "solver-backed",
    designInputs: ["Warm/cold temperatures", "Heat paths", "Surface emissivity", "Cold mass", "Cryogen properties"],
    autoSizingTargets: ["Heat leak", "Boil-off rate", "Cooldown energy", "Cooling power margin"],
    catalogTables: ["Cryogen latent heats", "Material conductivity", "MLI assumptions", "Cooldown heat capacity"],
    linkedWorkflowModuleIds: ["vacuum-engineering", "thermal-management", "materials/database"],
  },
  "magnetic-fields": {
    maturity: "solver-backed",
    designInputs: ["Turns", "Current", "Coil geometry", "Resistance", "Active conductor length"],
    autoSizingTargets: ["Magnetic field", "Inductance", "Stored energy", "Lorentz force", "Coil heating"],
    catalogTables: ["Conductor gauges", "Insulation classes", "Magnetic constants", "Cooling assumptions"],
    linkedWorkflowModuleIds: ["thermal-management", "superconducting-systems", "combined-loading"],
  },
  "material-db": {
    maturity: "catalog-backed",
    designInputs: ["Required allowable stress", "Application temperature", "Environment"],
    autoSizingTargets: ["Nearest passing material", "Yield margin", "Elastic modulus"],
    linkedWorkflowModuleIds: ["fatigue", "corrosion", "temperature-properties", "beams", "shafts"],
    expertNotes: [
      "Auto-design ranks catalog materials by required allowable stress; Compare lets you Apply material and E to the browse view.",
    ],
    gaps: ["Full temperature derating and corrosion screening in one workflow are planned."],
  },
  "battery-ev-systems": {
    maturity: "solver-backed",
    designInputs: ["Cell count", "Capacity", "Pack current", "Cell resistance", "Cooling target", "Vent assumptions"],
    autoSizingTargets: ["Pack voltage/energy", "Ohmic heat", "Cooling mass flow", "Busbar area", "Vent area"],
    catalogTables: ["Cell formats", "Busbar current density", "Coolants", "UL/SAE/ISO safety references"],
    linkedWorkflowModuleIds: ["thermal-management", "hydrogen-systems", "materials/database"],
  },
};

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function mergeWorkflow(
  base: Omit<ModuleDesignWorkflow, "moduleId" | "title" | "category">,
  override: Partial<ModuleDesignWorkflow>,
  moduleId: string,
  title: string,
  category: string
): ModuleDesignWorkflow {
  return {
    moduleId,
    title,
    category,
    maturity: override.maturity ?? base.maturity,
    modes: override.modes ?? base.modes,
    designInputs: override.designInputs ?? base.designInputs,
    autoSizingTargets: override.autoSizingTargets ?? base.autoSizingTargets,
    candidateColumns: override.candidateColumns ?? base.candidateColumns,
    candidates: override.candidates ?? base.candidates,
    catalogTables: unique([...(base.catalogTables ?? []), ...(override.catalogTables ?? [])]),
    linkedWorkflowModuleIds: unique([
      ...(base.linkedWorkflowModuleIds ?? []),
      ...(override.linkedWorkflowModuleIds ?? []),
    ]),
    expertNotes: unique([...(base.expertNotes ?? []), ...(override.expertNotes ?? [])]),
    gaps: unique([...(base.gaps ?? []), ...(override.gaps ?? [])]),
  };
}

export function getModuleDesignWorkflow(moduleId: string): ModuleDesignWorkflow | undefined {
  const catalogModule = allModules.find((item) => item.id === moduleId);
  if (!catalogModule) return undefined;
  const base = CATEGORY_TEMPLATES[catalogModule.category] ?? CATEGORY_TEMPLATES.tools;
  if (!base) return undefined;
  return mergeWorkflow(
    base,
    MODULE_OVERRIDES[moduleId] ?? {},
    catalogModule.id,
    catalogModule.title,
    catalogModule.category
  );
}

export function getModuleDesignWorkflowCoverage() {
  const workflows = allModules
    .map((catalogModule) => getModuleDesignWorkflow(catalogModule.id))
    .filter((workflow): workflow is ModuleDesignWorkflow => Boolean(workflow));

  return {
    totalModules: allModules.filter((catalogModule) => !catalogModule.comingSoon).length,
    workflowModules: workflows.length,
    solverBacked: workflows.filter((workflow) => workflow.maturity === "solver-backed").length,
    catalogBacked: workflows.filter((workflow) => workflow.maturity === "catalog-backed").length,
  };
}
