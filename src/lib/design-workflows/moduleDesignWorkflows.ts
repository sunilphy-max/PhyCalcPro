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
    linkedWorkflowModuleIds: ["shafts", "bearings", "keys-splines"],
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
    catalogTables: [
      "ISO 898-1 / ISO 724 threads",
      "DIN EN ISO bolt series",
      "ANSI B18 inch bolts",
      "ASME B1.1 unified threads",
      "Keyway/spline dimensions",
      "Weld throat/leg sizes",
    ],
    linkedWorkflowModuleIds: ["combined-loading", "fatigue", "shafts", "materials/database"],
    expertNotes: [
      "Connection detailing and eccentricity often control more than nominal stress.",
      "Thread catalogs span ISO metric, DIN EN ISO, ANSI inch, and ASME unified series — match hardware to the selected design standard.",
    ],
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
    linkedWorkflowModuleIds: ["corrosion", "temperature-properties", "welds"],
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
    linkedWorkflowModuleIds: ["shafts", "fatigue", "precision-motion"],
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
  bearings: {
    maturity: "solver-backed",
    modes: DEFAULT_MODES,
    designInputs: ["Radial/axial load", "Speed", "Required life", "Lubrication", "Bore limits"],
    autoSizingTargets: ["Required C/C₀", "Catalog designation", "L10 life", "Speed margin"],
    candidateColumns: ["Designation", "Dynamic util", "Static util", "Speed margin"],
    candidates: [
      { option: "Compact series", basis: "Smallest bore/C", pass: "Check life", tradeoff: "Lower reserve" },
      { option: "Standard series", basis: "ISO 281 life", pass: "Pass expected", tradeoff: "Balanced" },
      { option: "Heavy series", basis: "High C", pass: "High reserve", tradeoff: "Larger envelope" },
    ],
    catalogTables: ["ISO 281 life factors", "ISO 76 static", "SKF/FAG/NSK/Timken/NTN metric catalog"],
    linkedWorkflowModuleIds: ["shafts", "housing", "plain-bearings", "fatigue"],
    expertNotes: ["Auto-design ranks catalog bearings from required dynamic rating and speed limits."],
    gaps: ["Full vendor gold tables and duplex life factors remain partial."],
  },
  tools: {
    maturity: "catalog-backed",
    modes: DEFAULT_MODES,
    designInputs: ["Value", "Dimension", "From unit", "To unit"],
    autoSizingTargets: ["Converted value"],
    candidateColumns: ["Dimension", "From", "To", "Result"],
    candidates: [
      { option: "Unit conversion", basis: "SI base layer", pass: "Pass", tradeoff: "Dimension must match" },
    ],
    catalogTables: ["Unit conversion table", "NIST/ISO unit references"],
    linkedWorkflowModuleIds: ["beams", "shafts", "thermal-management", "unit-converter"],
    expertNotes: ["Unit conversion feeds module inputs; it does not replace module-specific checks."],
    gaps: ["Site-wide converter shortcuts from other modules are planned."],
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
    linkedWorkflowModuleIds: ["combined-loading", "rolled-sections"],
    expertNotes: ["Auto-design searches rolled sections for minimum weight at the target safety factor."],
    gaps: ["Inelastic buckling and code-specific column curves are not fully embedded."],
  },
  "compression-springs": {
    maturity: "solver-backed",
    designInputs: ["Target rate", "Maximum force", "Maximum OD", "Material", "Free length"],
    autoSizingTargets: ["Wire diameter", "Mean coil diameter", "Active coils", "Stress margin"],
    linkedWorkflowModuleIds: ["fatigue", "materials/database"],
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
    linkedWorkflowModuleIds: ["shafts", "bearings", "multi-pulley", "keys-splines"],
    expertNotes: ["Auto-design screens belt sections and pulley sizes from power, speed ratio, and service factor. Imports motor power/speed via handoff."],
    gaps: ["Manufacturer-specific rating tables are not fully embedded."],
  },
  motor: {
    maturity: "solver-backed",
    designInputs: ["Required shaft power", "Pole count / speed", "Service class", "Starting torque factor"],
    autoSizingTargets: ["Frame class", "Rated torque", "Slip speed", "Belt service factor"],
    linkedWorkflowModuleIds: ["v-belts", "multi-pulley", "rotation"],
    expertNotes: ["Power-train entry point — publishes rated power and speed to V-Belt Drive."],
  },
  "multi-pulley": {
    maturity: "solver-backed",
    linkedWorkflowModuleIds: ["v-belts", "shafts", "bearings"],
    expertNotes: [
      "Optional pulley layout step; publishes diameters to V-Belt Drive.",
      "Auto-design sweeps a closed three-pulley layout for wrap angle and belt length.",
    ],
    gaps: ["Full serpentine routing with idler tensioner catalogs remains indicative."],
  },
  shafts: {
    maturity: "solver-backed",
    designInputs: ["Power/rpm or torque", "Bearing spacing", "Gear/pulley loads", "Material", "Keyways/shoulders/Kt", "Target safety factor"],
    autoSizingTargets: ["Minimum shaft diameter", "Nearest standard diameter", "Fatigue safety factor", "Bearing slope/deflection", "Critical speed margin"],
    catalogTables: ["Standard shaft diameters", "DIN 743 factors", "AGMA/ASME shaft factors", "Keyway dimensions", "Bearing series"],
    linkedWorkflowModuleIds: ["keys-splines", "bearings", "housing", "gears", "fatigue", "shaft-hubs"],
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
    designInputs: ["Radial/axial load", "Speed", "Required life", "Reliability", "Manufacturer", "Bore/space limits", "Lubrication class"],
    autoSizingTargets: ["Required dynamic rating", "Catalog designation", "L10/Lnm life", "Static C₀/P₀", "Speed margin"],
    catalogTables: ["ISO 281 life factors", "ISO 76 static ratings", "SKF/FAG/NSK/Timken/NTN metric catalog", "Lubrication a_ISO screening"],
    linkedWorkflowModuleIds: ["housing", "shafts", "plain-bearings", "fatigue"],
    expertNotes: ["Shaft FEM handoff imports Fr, Fa, and speed. Publishes bore and loads to Bearing Housing."],
    gaps: ["Full vendor designation tables beyond representative series, duplex paired life factors, and ISO 281 a_ISO from κ/ηc still need integration."],
  },
  housing: {
    maturity: "solver-backed",
    designInputs: ["Bearing bore", "Radial/axial load", "Mount style", "Bolt pattern"],
    autoSizingTargets: ["Body safety factor", "Bolt size", "Bolt tension and shear"],
    linkedWorkflowModuleIds: ["bolts", "bearings", "shafts", "frames"],
    expertNotes: ["Bridges bearing selection to fastener design in the power-train workflow. Diagnose mode screens body SF, bolts, deflection, and fit risks."],
  },
  "keys-splines": {
    maturity: "solver-backed",
    linkedWorkflowModuleIds: ["housing", "shafts", "bearings", "fatigue"],
    expertNotes: ["Imports torque and shaft diameter from shaft analysis handoff."],
  },
  bolts: {
    maturity: "solver-backed",
    designInputs: ["Tension/shear", "Joint members", "Bolt pattern", "Preload", "Grade"],
    autoSizingTargets: ["Bolt diameter", "Grade", "Preload", "Thread engagement", "Group utilization"],
    catalogTables: [
      "ISO 898-1 / ISO 724 threads",
      "DIN EN ISO bolt series",
      "ANSI B18 inch bolts",
      "ASME B1.1 unified threads",
      "Property classes",
      "AISC/VDI factors",
    ],
    linkedWorkflowModuleIds: ["frames", "welds", "pins", "combined-loading"],
  },
  frames: {
    maturity: "solver-backed",
    designInputs: ["Bay geometry", "Joint/fixity", "Member loads", "Section family"],
    autoSizingTargets: ["Member utilization", "Deflection", "Reaction envelope"],
    linkedWorkflowModuleIds: ["bolts", "beams", "trusses", "rolled-sections", "combined-loading"],
    gaps: ["Plastic hinge and code-specific connection checks remain module-dependent."],
  },
  trusses: {
    maturity: "solver-backed",
    designInputs: ["Span", "Panel geometry", "Joint loads", "Section area"],
    autoSizingTargets: ["Member force utilization", "Deflection at joints"],
    linkedWorkflowModuleIds: ["frames", "rolled-sections", "beams"],
  },
  "roller-chains": {
    maturity: "solver-backed",
    designInputs: ["Power", "Speed ratio", "Service factor", "Strand count"],
    autoSizingTargets: ["Chain pitch", "Sprocket teeth", "Tension", "Life hours"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "multi-pulley"],
  },
  "worm-gears": {
    maturity: "solver-backed",
    designInputs: ["Power", "Ratio", "Friction", "Lead angle", "Yield limit"],
    autoSizingTargets: ["Module", "Worm starts", "Contact safety", "Efficiency"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "gears"],
  },
  "planetary-gears": {
    maturity: "solver-backed",
    designInputs: ["Target ratio", "Sun/planet teeth", "Module", "Power"],
    autoSizingTargets: ["Ring teeth", "Planet count", "Sun diameter"],
    linkedWorkflowModuleIds: ["gears", "shafts", "bearings"],
  },
  "plain-bearings": {
    maturity: "solver-backed",
    designInputs: ["Radial load", "Speed", "Diameter", "Clearance", "Viscosity"],
    autoSizingTargets: ["Sommerfeld number", "Eccentricity", "Min film thickness"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "hydraulics"],
    expertNotes: ["Diagnose mode screens film thickness, specific load, thermal rise, and clearance risks for journal and pad bearings."],
  },
  "brakes-clutches": {
    maturity: "solver-backed",
    designInputs: ["Friction coeff", "Actuation force", "Speed", "Engagement time"],
    autoSizingTargets: ["Friction torque", "Power dissipated", "Safety factor"],
    linkedWorkflowModuleIds: ["shafts", "flywheels"],
  },
  plates: {
    maturity: "solver-backed",
    designInputs: ["Plate dimensions", "Pressure", "Boundary condition", "Mesh density"],
    autoSizingTargets: ["Max deflection", "Max moment", "Stress utilization"],
    linkedWorkflowModuleIds: ["beams", "circular-plates", "combined-loading"],
  },
  shells: {
    maturity: "solver-backed",
    designInputs: ["Radius", "Thickness", "Pressure", "End condition"],
    autoSizingTargets: ["Hoop stress", "Von Mises stress", "Safety factor"],
    linkedWorkflowModuleIds: ["vessels", "pipes", "combined-loading"],
  },
  vessels: {
    maturity: "solver-backed",
    designInputs: ["Pressure", "Diameter", "Temperature", "Material", "Corrosion allowance", "Joint efficiency"],
    autoSizingTargets: ["Required thickness", "Nearest plate thickness", "Hoop/longitudinal stress", "Corrosion life"],
    catalogTables: ["ASME VIII allowables", "EN 13445 material data", "Plate thicknesses"],
    linkedWorkflowModuleIds: ["corrosion", "welds", "temperature-properties"],
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
  welds: {
    maturity: "solver-backed",
    designInputs: ["Shear/axial joint loads", "Weld length and count", "Eccentricity", "Target safety factor"],
    autoSizingTargets: ["Fillet leg size", "Throat stress", "Overall safety factor"],
    catalogTables: ["Fillet leg series 3–20 mm", "AWS/EN throat factors"],
    linkedWorkflowModuleIds: ["bolts", "combined-loading", "frames", "fatigue"],
    expertNotes: ["Auto-design sweeps fillet leg sizes against live joint loads and eccentricity."],
    gaps: ["Full AWS D1.1 / EN 1993-1-8 weld group worksheets remain module-dependent."],
  },
  rivets: {
    maturity: "solver-backed",
    designInputs: ["Shear/axial load", "Rivet count", "Plate thickness", "Target SF"],
    autoSizingTargets: ["Rivet diameter", "Shear/bearing capacity"],
    linkedWorkflowModuleIds: ["bolts", "plates", "combined-loading"],
  },
  pins: {
    maturity: "solver-backed",
    designInputs: ["Shear force", "Pin count", "Plate thickness", "Pin yield"],
    autoSizingTargets: ["Pin diameter", "Shear SF", "Bearing SF"],
    linkedWorkflowModuleIds: ["bolts", "shafts", "keys-splines"],
  },
  "shaft-hubs": {
    maturity: "solver-backed",
    designInputs: ["Shaft diameter", "Torque", "Hub length", "Friction"],
    autoSizingTargets: ["Interference", "Friction torque capacity"],
    linkedWorkflowModuleIds: ["shafts", "keys-splines", "fits"],
  },
  "bevel-gears": {
    maturity: "solver-backed",
    designInputs: ["Power", "Speed", "Ratio", "Pinion teeth", "Target SF"],
    autoSizingTargets: ["ISO 54 module", "Face width", "Bending/contact SF"],
    catalogTables: ["ISO 54 module series", "Face-width heuristics 8–10×m"],
    linkedWorkflowModuleIds: ["gears", "shafts", "bearings", "keys-splines"],
    gaps: ["Full AGMA/ISO bevel rating worksheets are indicative screening only."],
  },
  flywheels: {
    maturity: "solver-backed",
    designInputs: ["Speed", "Target stored energy", "Material yield"],
    autoSizingTargets: ["Outer diameter", "Rim thickness", "Hoop stress SF"],
    linkedWorkflowModuleIds: ["brakes-clutches", "shafts", "rotation"],
  },
  cams: {
    maturity: "solver-backed",
    designInputs: ["Lift", "Speed", "Motion law", "Pressure-angle limit"],
    autoSizingTargets: ["Base-circle radius", "Peak pressure angle"],
    linkedWorkflowModuleIds: ["precision-motion", "fatigue"],
  },
  "timing-belts": {
    maturity: "solver-backed",
    designInputs: ["Power", "Driver speed", "Ratio", "Service factor"],
    autoSizingTargets: ["Pitch", "Tooth counts", "Belt width", "Power utilization"],
    linkedWorkflowModuleIds: ["v-belts", "shafts", "bearings", "multi-pulley"],
    gaps: ["Manufacturer power-rating tables are not fully embedded."],
  },
  pipes: {
    maturity: "solver-backed",
    designInputs: ["Design pressure", "Radius", "Allowable stress", "Modulus"],
    autoSizingTargets: ["Wall thickness", "Hoop stress utilization"],
    catalogTables: ["Schedule-like wall series"],
    linkedWorkflowModuleIds: ["vessels", "corrosion", "welds"],
    gaps: ["Full ASME B31.3 / EN 13480 code worksheets remain partial."],
  },
  hydraulics: {
    maturity: "solver-backed",
    designInputs: ["Actuation force", "System pressure"],
    autoSizingTargets: ["Cylinder bore", "Force capacity"],
    linkedWorkflowModuleIds: ["pipes", "plain-bearings"],
  },
  "heat-exchangers": {
    maturity: "solver-backed",
    designInputs: ["Heat duty", "Log-mean temperature difference"],
    autoSizingTargets: ["Required UA", "Configuration class"],
    linkedWorkflowModuleIds: ["thermal-management", "pipes"],
    gaps: ["Detailed LMTD/NTU geometry sizing is indicative."],
  },
  fatigue: {
    maturity: "solver-backed",
    designInputs: ["Alternating/mean stress", "Su / Se'", "Target cycles", "Surface finish"],
    autoSizingTargets: ["Characteristic diameter", "Allowable Sa", "Life SF"],
    catalogTables: ["Marin factors", "Basquin S-N screening"],
    linkedWorkflowModuleIds: ["shafts", "combined-loading", "gears"],
    expertNotes: ["Auto-design scales bending stress with diameter (∝ 1/d³) and applies Marin size factor."],
    gaps: ["Component-specific Kt/Kf and full load spectra are not automatic."],
  },
  "combined-loading": {
    maturity: "solver-backed",
    designInputs: ["Axial", "Bending", "Torsion", "Shear", "Yield", "Target SF"],
    autoSizingTargets: ["Round bar diameter", "Von Mises SF"],
    linkedWorkflowModuleIds: ["shafts", "fatigue"],
    expertNotes: ["Auto-design sweeps solid round diameters (square proxy in engine) for von Mises SF."],
  },
  "circular-plates": {
    maturity: "solver-backed",
    designInputs: ["Radius", "Pressure", "Boundary", "Deflection/stress limits"],
    autoSizingTargets: ["Plate thickness", "Deflection", "Bending stress"],
    linkedWorkflowModuleIds: ["plates", "combined-loading"],
  },
  vibrations: {
    maturity: "solver-backed",
    designInputs: ["Span", "Excitation frequency", "Damping ratio"],
    autoSizingTargets: ["Section inertia", "Modal separation margin"],
    linkedWorkflowModuleIds: ["beams", "shafts", "rotation"],
  },
  impact: {
    maturity: "solver-backed",
    designInputs: ["Mass", "Velocity change", "Impact duration", "Yield"],
    autoSizingTargets: ["Cross-section area", "Dynamic stress SF"],
    linkedWorkflowModuleIds: ["combined-loading"],
  },
  suspension: {
    maturity: "solver-backed",
    designInputs: ["Sprung mass", "Track", "Wheelbase", "Lateral acceleration"],
    autoSizingTargets: ["Roll stiffness", "Roll angle"],
    linkedWorkflowModuleIds: ["compression-springs", "vibrations"],
  },
  rotation: {
    maturity: "solver-backed",
    designInputs: ["Mass", "Speed", "Power"],
    autoSizingTargets: ["Radius", "Centripetal load"],
    linkedWorkflowModuleIds: ["flywheels", "shafts"],
  },
  "gear-ratio-design": {
    maturity: "solver-backed",
    designInputs: ["Target ratio", "Min pinion teeth", "Max teeth"],
    autoSizingTargets: ["Pinion/gear tooth counts", "Ratio error"],
    linkedWorkflowModuleIds: ["gears", "bevel-gears", "planetary-gears"],
  },
  "power-screws": {
    maturity: "solver-backed",
    designInputs: ["Load", "Lead", "Friction", "Target SF"],
    autoSizingTargets: ["Screw diameter", "Pitch", "Efficiency / torque"],
    linkedWorkflowModuleIds: ["shafts", "bearings", "keys-splines"],
    expertNotes: ["Auto-design ranks Tr diameter×pitch candidates with the live power-screw engine."],
    gaps: ["Full vendor lead-screw catalogs and ball-screw dynamic ratings remain partial."],
  },
  "internal-gears-rack": {
    maturity: "solver-backed",
    designInputs: ["Power", "Ratio", "Speed", "Target SF"],
    autoSizingTargets: ["Module", "Face width", "Bending/contact SF"],
    linkedWorkflowModuleIds: ["gears", "shafts", "bearings"],
    expertNotes: ["Uses dedicated internal/rack Lewis + contact screening (not the spur-only path)."],
    gaps: ["Full ISO 6336 / AGMA rack worksheets and tooth profile FEA are not embedded."],
  },
  "cost-estimator": {
    maturity: "catalog-backed",
    designInputs: ["Material volume", "Process rates", "Cost target"],
    autoSizingTargets: ["Process class", "Machine/labor rate", "Total cost vs budget"],
    expertNotes: ["Auto-design ranks process/rate catalogs with the live cost-estimator engine."],
    gaps: ["Full shop-rate databases and volume learning curves are not connected."],
  },
  "cam-toolpaths": {
    maturity: "solver-backed",
    designInputs: ["Stock size", "Tool", "Cycle-time target"],
    autoSizingTargets: ["Feed per tooth", "Stepover", "Total cut time"],
    expertNotes: ["Auto-design sweeps feed×stepover against live CAM totalCutTime."],
    gaps: ["Full CAM kernel / tool library / spindle-power limits remain out of scope."],
  },
  "thermal-management": {
    maturity: "solver-backed",
    designInputs: ["Heat load", "Convection", "Area"],
    autoSizingTargets: ["h coefficient", "Heat rejection capacity"],
    expertNotes: ["Convection coefficient sweep uses the live thermal-path solver."],
    gaps: ["Multi-node thermal networks and CFD couple are not implemented."],
  },
  "hydrogen-systems": {
    maturity: "solver-backed",
    designInputs: ["Pressure", "Leak / vent target"],
    autoSizingTargets: ["Orifice area", "Vent capacity"],
    expertNotes: ["Orifice sweep ranks relief capacity with the live hydrogen screening engine."],
    gaps: ["ASME B31.12 / ISO 19880 / NFPA 2 worksheets and real-gas Z remain gaps."],
  },
  "precision-motion": {
    maturity: "solver-backed",
    designInputs: ["Deflection limit", "Moving mass", "Flexure"],
    autoSizingTargets: ["Flexure length", "Stiffness"],
    expertNotes: ["Flexure length sweep uses live stiffness/deflection screening."],
    gaps: ["ISO 230 geometric test suites and multi-DOF stage catalogs remain gaps."],
  },
  "superconducting-systems": {
    maturity: "solver-backed",
    designInputs: ["Energy target", "Operating current"],
    autoSizingTargets: ["Operating current", "Current/temperature margin"],
    expertNotes: ["Current sweep ranks stored energy and critical-current margin with the live coil screen."],
    gaps: ["Quench propagation and critical-surface Ic(B,T) models remain gaps."],
  },
  tolerance: {
    maturity: "solver-backed",
    designInputs: ["Nominal gap", "Minimum functional gap"],
    autoSizingTargets: ["Bilateral tolerance", "Worst-case stack"],
    linkedWorkflowModuleIds: ["fits", "cost-estimator"],
  },
  fits: {
    maturity: "solver-backed",
    designInputs: ["Target clearance/interference"],
    autoSizingTargets: ["ISO fit class"],
    catalogTables: ["ISO 286 H7/g6, H7/k6, H7/p6"],
    linkedWorkflowModuleIds: ["shaft-hubs", "tolerance", "shafts"],
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
