import type { ComponentType } from "react";

import {
  Box,
  Cog,
  Layers,
  Wrench,
  Zap,
  Settings,

  // Module Icons
  BarChart3,
  Building2,
  Network,
  Columns3,
  LayoutGrid,
  RotateCcw,
  CircleDot,
  Gauge,
  Activity,
  Disc3,
  Bolt,
  Flame,
  GitBranch,
  Database,
  Scaling,
  Workflow,
  Circle,
  Waves,
  Orbit,
  Ruler,
  Combine,
  ShieldCheck,
  Link,
  Link2,
  Anchor,
  CircleEllipsis,
  BookOpen,
  ArrowLeftRight,
  Cylinder,
} from "lucide-react";

/**
 * 🧠 ENGINEERING MODULE
 */
export type EngineeringModule = {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;

  // ✅ Module icon support
  icon?: ComponentType<{ className?: string }>;

  tags?: string[];
  featured?: boolean;
  comingSoon?: boolean;
  /** Sidebar sub-heading within a category (e.g. Machine → Gearing). */
  subGroup?: string;
};

/**
 * 🧠 ENGINEERING CATEGORY
 */
export type EngineeringCategory = {
  id: string;
  title: string;
  description: string;

  // ✅ Category icon
  icon: ComponentType<{ className?: string }>;

  color: string;

  modules: EngineeringModule[];
};

/**
 * 🧠 FULL ENGINEERING TAXONOMY
 */
export const categories: EngineeringCategory[] = [
  // =========================================================
  // STRUCTURAL
  // =========================================================
  {
    id: "structural",
    title: "Structural Engineering",
    description:
      "Beams, frames, columns, plates, and structural analysis",

    icon: Box,
    color: "from-blue-500 to-blue-600",

    modules: [
      {
        id: "beams",
        title: "Beam Analysis",
        description: "Deflection, bending moment, shear force",
        route: "/products/structural/beams",
        category: "structural",
        icon: BarChart3,
        featured: true,
      },

      {
        id: "frames",
        title: "Frame Analysis",
        description: "2D frame structural analysis",
        route: "/products/structural/frames",
        category: "structural",
        icon: Building2,
      },

      {
        id: "trusses",
        title: "Truss Analysis",
        description: "Axial force analysis in truss systems",
        route: "/products/structural/trusses",
        category: "structural",
        icon: Network,
      },

      {
        id: "columns",
        title: "Column Buckling",
        description: "Euler buckling and stability analysis",
        route: "/products/structural/columns",
        category: "structural",
        icon: Columns3,
      },

      {
        id: "plates",
        title: "Plate Bending",
        description: "Thin plate bending and stress analysis",
        route: "/products/structural/plates",
        category: "structural",
        icon: LayoutGrid,
      },
      {
        id: "combined-loading",
        title: "Combined Loading",
        description: "Evaluate axial, bending, torsion and shear together",
        route: "/products/structural/combined-loading",
        category: "structural",
        icon: Combine,
      },
      {
        id: "circular-plates",
        title: "Circular Plates",
        description: "Annular and solid plate deflection screening",
        route: "/products/structural/circular-plates",
        category: "structural",
        icon: CircleEllipsis,
      },
      {
        id: "shells",
        title: "Cylindrical Shells",
        description: "Thin-shell hoop, axial and bending stress screening",
        route: "/products/structural/shells",
        category: "structural",
        icon: Cylinder,
        tags: ["plates", "pressure", "axisymmetric"],
      },
    ],
  },

  // =========================================================
  // POWER TRANSMISSION
  // =========================================================
  {
    id: "power-transmission",
    title: "Power Transmission",
    description: "Belts, chains, and multi-pulley drives",

    icon: Link2,
    color: "from-emerald-500 to-emerald-600",

    modules: [
      {
        id: "v-belts",
        title: "V-Belt Drive",
        description: "Pulley sizing, belt length, power and pretension",
        route: "/products/power-transmission/v-belts",
        category: "power-transmission",
        icon: Link,
        featured: true,
      },
      {
        id: "timing-belts",
        title: "Timing Belt Drive",
        description: "Toothed belt pitch, teeth, power and axis loads",
        route: "/products/power-transmission/timing-belts",
        category: "power-transmission",
        icon: Cog,
      },
      {
        id: "roller-chains",
        title: "Roller Chain Drive",
        description: "Sprocket sizing, strand selection and life",
        route: "/products/power-transmission/roller-chains",
        category: "power-transmission",
        icon: Link2,
      },
      {
        id: "multi-pulley",
        title: "Multi-Pulley Layout",
        description: "Wrap angles and belt or chain length",
        route: "/products/power-transmission/multi-pulley",
        category: "power-transmission",
        icon: GitBranch,
      },
    ],
  },

  // =========================================================
  // MACHINE DESIGN
  // =========================================================
  {
    id: "machine",
    title: "Machine Design",
    description:
      "Shafts, gears, bearings, and rotating systems",

    icon: Cog,
    color: "from-green-500 to-green-600",

    modules: [
      {
        id: "gears",
        title: "Gear Design",
        description: "Spur and helical gear calculations",
        route: "/products/machine/gears",
        category: "machine",
        icon: CircleDot,
        subGroup: "Gearing",
      },
      {
        id: "internal-gears-rack",
        title: "Internal Gears & Rack",
        description: "Internal spur and rack-and-pinion strength screening",
        route: "/products/machine/internal-gears-rack",
        category: "machine",
        icon: GitBranch,
        subGroup: "Gearing",
        tags: ["gears", "rack", "internal"],
      },
      {
        id: "bevel-gears",
        title: "Bevel Gear Screening",
        description: "Bevel geometry and strength screening",
        route: "/products/machine/bevel-gears",
        category: "machine",
        icon: CircleDot,
        subGroup: "Gearing",
      },
      {
        id: "worm-gears",
        title: "Worm Gear Drive",
        description: "Worm efficiency and contact stress screening",
        route: "/products/machine/worm-gears",
        category: "machine",
        icon: RotateCcw,
        subGroup: "Gearing",
      },
      {
        id: "planetary-gears",
        title: "Planetary Gear Set",
        description: "Sun, planet and ring sizing for target ratio",
        route: "/products/machine/planetary-gears",
        category: "machine",
        icon: Orbit,
        subGroup: "Gearing",
      },
      {
        id: "gear-ratio-design",
        title: "Gear Ratio Design",
        description: "Tooth count optimization for target ratio",
        route: "/products/machine/gear-ratio-design",
        category: "machine",
        icon: Scaling,
        subGroup: "Gearing",
      },
      {
        id: "shafts",
        title: "Shaft Design",
        description: "Torsion, bending, fatigue analysis",
        route: "/products/machine/shafts",
        category: "machine",
        icon: RotateCcw,
        featured: true,
        subGroup: "Rotating Machinery",
      },
      {
        id: "power-screws",
        title: "Power & Ball Screws",
        description: "Lead screw efficiency, torque and buckling screening",
        route: "/products/machine/power-screws",
        category: "machine",
        icon: Bolt,
        subGroup: "Rotating Machinery",
        tags: ["screw", "linear actuator", "ball screw"],
      },
      {
        id: "cams",
        title: "Cam Design",
        description: "Cam profile and motion analysis",
        route: "/products/machine/cams",
        category: "machine",
        icon: Activity,
        subGroup: "Rotating Machinery",
      },
      {
        id: "flywheels",
        title: "Flywheel Design",
        description: "Energy storage and inertia design",
        route: "/products/machine/flywheels",
        category: "machine",
        icon: Disc3,
        subGroup: "Rotating Machinery",
      },
      {
        id: "brakes-clutches",
        title: "Brakes & Clutches",
        description: "Friction torque, energy and safety factor",
        route: "/products/machine/brakes-clutches",
        category: "machine",
        icon: Disc3,
        subGroup: "Rotating Machinery",
      },
      {
        id: "bearings",
        title: "Bearing Selection",
        description: "Load rating and life estimation",
        route: "/products/machine/bearings",
        category: "machine",
        icon: Gauge,
        subGroup: "Bearings",
      },
      {
        id: "housing",
        title: "Bearing Housing",
        description: "Housing body stress and mounting bolt loads",
        route: "/products/machine/housing",
        category: "machine",
        icon: Building2,
        subGroup: "Bearings",
        tags: ["power train", "workflow"],
      },
      {
        id: "plain-bearings",
        title: "Plain Bearings",
        description: "Journal and thrust pad hydrodynamic screening",
        route: "/products/machine/plain-bearings",
        category: "machine",
        icon: Circle,
        subGroup: "Bearings",
      },
    ],
  },

  // =========================================================
  // SPRINGS
  // =========================================================
  {
    id: "springs",
    title: "Springs",
    description: "Helical compression, extension and torsion springs",

    icon: Waves,
    color: "from-lime-500 to-lime-600",

    modules: [
      {
        id: "compression-springs",
        title: "Compression Springs",
        description: "Rate, stress, solid height and fatigue screening",
        route: "/products/springs/compression-springs",
        category: "springs",
        icon: Activity,
        featured: true,
      },
      {
        id: "extension-springs",
        title: "Extension Springs",
        description: "Tension spring rate and stress screening",
        route: "/products/springs/extension-springs",
        category: "springs",
        icon: Activity,
      },
      {
        id: "torsion-springs",
        title: "Torsion Springs",
        description: "Leg geometry, rate and bending stress",
        route: "/products/springs/torsion-springs",
        category: "springs",
        icon: RotateCcw,
      },
    ],
  },

  // =========================================================
  // FASTENERS
  // =========================================================
  {
    id: "fasteners",
    title: "Connections & Fasteners",
    description: "Bolts, welds, rivets, keys, pins and joints",

    icon: Wrench,
    color: "from-red-500 to-red-600",

    modules: [
      {
        id: "bolts",
        title: "Bolt Calculator",
        description: "Preload, shear, tension analysis",
        route: "/products/fasteners/bolts",
        category: "fasteners",
        icon: Bolt,
        featured: true,
      },

      {
        id: "welds",
        title: "Weld Group Analysis",
        description: "Weld strength and stress distribution",
        route: "/products/fasteners/welds",
        category: "fasteners",
        icon: Flame,
      },

      {
        id: "rivets",
        title: "Rivet Analysis",
        description: "Shear and bearing stress in rivets",
        route: "/products/fasteners/rivets",
        category: "fasteners",
        icon: GitBranch,
      },
      {
        id: "keys-splines",
        title: "Keys & Splines",
        description: "Parallel key and spline torque capacity",
        route: "/products/fasteners/keys-splines",
        category: "fasteners",
        icon: Anchor,
      },
      {
        id: "shaft-hubs",
        title: "Shaft Hub Fits",
        description: "Interference fit pressure and torque capacity",
        route: "/products/fasteners/shaft-hubs",
        category: "fasteners",
        icon: Combine,
      },
      {
        id: "pins",
        title: "Pins & Clevis",
        description: "Pin shear and bearing capacity",
        route: "/products/fasteners/pins",
        category: "fasteners",
        icon: Bolt,
      },
    ],
  },

  // =========================================================
  // MATERIALS
  // =========================================================
  {
    id: "materials",
    title: "Materials & Sections",
    description: "Material properties and cross-sections",

    icon: Layers,
    color: "from-orange-500 to-orange-600",

    modules: [
      {
        id: "material-db",
        title: "Material Database",
        description: "Steel, aluminum, alloys properties",
        route: "/products/materials/database",
        category: "materials",
        icon: Database,
      },

      {
        id: "sections",
        title: "Section Properties",
        description: "I, Z, centroid, inertia calculations",
        route: "/products/materials/sections",
        category: "materials",
        icon: Scaling,
      },
      {
        id: "rolled-sections",
        title: "Rolled Sections",
        description: "W, S, C, I, U and L section property lookup",
        route: "/products/materials/rolled-sections",
        category: "materials",
        icon: LayoutGrid,
      },
      {
        id: "profiles",
        title: "Area Properties",
        description: "Centroid, inertia and moduli for common profile shapes",
        route: "/products/materials/profiles",
        category: "materials",
        icon: Ruler,
      },
      {
        id: "composites",
        title: "Composite Materials",
        description: "Design laminate layups and composite section behavior",
        route: "/products/materials/composites",
        category: "materials",
        icon: Layers,
      },
      {
        id: "temperature-properties",
        title: "Temperature Properties",
        description: "Evaluate material behavior across temperature ranges",
        route: "/products/materials/temperature-properties",
        category: "materials",
        icon: Flame,
      },
      {
        id: "fatigue",
        title: "Fatigue Assessment",
        description: "Estimate life with S-N curves and load cycles",
        route: "/products/materials/fatigue",
        category: "materials",
        icon: Gauge,
      },
      {
        id: "corrosion",
        title: "Corrosion Allowance",
        description: "Calculate thickness and allowance for corrosion protection",
        route: "/products/materials/corrosion",
        category: "materials",
        icon: Wrench,
      },
    ],
  },

  // =========================================================
  // PRESSURE
  // =========================================================
  {
    id: "pressure",
    title: "Pressure Systems",
    description: "Pipes, vessels, and pressure components",

    icon: Settings,
    color: "from-purple-500 to-purple-600",

    modules: [
      {
        id: "pipes",
        title: "Pipe Stress Analysis",
        description: "Internal pressure and stress analysis",
        route: "/products/pressure/pipes",
        category: "pressure",
        icon: Workflow,
      },

      {
        id: "vessels",
        title: "Pressure Vessels",
        description: "Thin and thick wall vessel design",
        route: "/products/pressure/vessels",
        category: "pressure",
        icon: Circle,
      },
      {
        id: "hydraulics",
        title: "Hydraulic Cylinders",
        description: "Analyze actuator forces and pressure loads",
        route: "/products/pressure/hydraulics",
        category: "pressure",
        icon: Waves,
      },
      {
        id: "heat-exchangers",
        title: "Heat Exchangers",
        description: "Estimate heat transfer and pressure drops",
        route: "/products/pressure/heat-exchangers",
        category: "pressure",
        icon: CircleDot,
      },
    ],
  },

  // =========================================================
  // DYNAMICS
  // =========================================================
  {
    id: "dynamics",
    title: "Dynamics & Vibrations",
    description: "Motion, vibration, and dynamic systems",

    icon: Zap,
    color: "from-cyan-500 to-cyan-600",

    modules: [
      {
        id: "vibrations",
        title: "Vibration Analysis",
        description: "Natural frequency and resonance",
        route: "/products/dynamics/vibrations",
        category: "dynamics",
        icon: Waves,
      },

      {
        id: "rotation",
        title: "Rotational Systems",
        description: "Dynamic rotating system analysis",
        route: "/products/dynamics/rotation",
        category: "dynamics",
        icon: Orbit,
      },
      {
        id: "motor",
        title: "Motor Sizing",
        description: "Indicative motor frame class, torque, and speed for power trains",
        route: "/products/dynamics/motor",
        category: "dynamics",
        icon: Gauge,
        featured: true,
        tags: ["power train", "workflow"],
      },
      {
        id: "impact",
        title: "Impact & Shock",
        description: "Assess transient impact and shock response",
        route: "/products/dynamics/impact",
        category: "dynamics",
        icon: Zap,
      },
      {
        id: "suspension",
        title: "Suspension & Sway",
        description: "Analyze vehicle suspension and sway dynamics",
        route: "/products/dynamics/suspension",
        category: "dynamics",
        icon: Orbit,
      },
    ],
  },

  // =========================================================
  // MANUFACTURING
  // =========================================================
  {
    id: "manufacturing",
    title: "Manufacturing",
    description: "Tolerance analysis and fit systems",

    icon: Ruler,
    color: "from-yellow-500 to-yellow-600",

    modules: [
      {
        id: "tolerance",
        title: "Tolerance Stackup",
        description: "Dimensional variation analysis",
        route: "/products/manufacturing/tolerance",
        category: "manufacturing",
        icon: Ruler,
      },

      {
        id: "fits",
        title: "Fits & Clearances",
        description: "ISO fit system calculations",
        route: "/products/manufacturing/fits",
        category: "manufacturing",
        icon: Combine,
      },
      {
        id: "cost-estimator",
        title: "Cost Estimation",
        description: "Estimate manufacturing cost and process selection",
        route: "/products/manufacturing/cost-estimator",
        category: "manufacturing",
        icon: Ruler,
      },
      {
        id: "cam-toolpaths",
        title: "CAM Toolpaths",
        description: "Basic toolpath planning and machining parameters",
        route: "/products/manufacturing/cam-toolpaths",
        category: "manufacturing",
        icon: RotateCcw,
      },
    ],
  },

  // =========================================================
  // TECHNICAL TOOLS
  // =========================================================
  {
    id: "advanced-systems",
    title: "Advanced Systems",
    description: "Cryogenic, vacuum, electromagnetic and emerging engineering systems",

    icon: Orbit,
    color: "from-fuchsia-500 to-fuchsia-600",

    modules: [
      {
        id: "vacuum-engineering",
        title: "Vacuum Engineering",
        description: "Pump-down, conductance, leak rate and chamber-force tools",
        route: "/products/advanced-systems/vacuum-engineering",
        category: "advanced-systems",
        icon: Circle,
      },
      {
        id: "cryogenic-engineering",
        title: "Cryogenic Engineering",
        description: "Heat leak, boil-off, cooldown and thermal contraction screening",
        route: "/products/advanced-systems/cryogenic-engineering",
        category: "advanced-systems",
        icon: Waves,
      },
      {
        id: "magnetic-fields",
        title: "Magnetic Fields & Coils",
        description: "Solenoid fields, Lorentz forces, inductance and coil heating",
        route: "/products/advanced-systems/magnetic-fields",
        category: "advanced-systems",
        icon: Orbit,
      },
      {
        id: "superconducting-systems",
        title: "Superconducting Systems",
        description: "Stored energy, quench margin and cryogenic coil screening",
        route: "/products/advanced-systems/superconducting-systems",
        category: "advanced-systems",
        icon: Zap,
      },
      {
        id: "thermal-management",
        title: "Thermal Management",
        description: "Heat sinks, cold plates, radiation and thermal-resistance networks",
        route: "/products/advanced-systems/thermal-management",
        category: "advanced-systems",
        icon: Flame,
      },
      {
        id: "battery-ev-systems",
        title: "Battery & EV Systems",
        description: "Pack heat generation, busbars, cooling and vent screening",
        route: "/products/advanced-systems/battery-ev-systems",
        category: "advanced-systems",
        icon: Gauge,
      },
      {
        id: "hydrogen-systems",
        title: "Hydrogen Systems",
        description: "Hydrogen storage, pipe flow, leak and vent screening",
        route: "/products/advanced-systems/hydrogen-systems",
        category: "advanced-systems",
        icon: Waves,
      },
      {
        id: "precision-motion",
        title: "Precision Motion & Vibration",
        description: "Flexures, isolation, thermal drift and optomechanical stiffness",
        route: "/products/advanced-systems/precision-motion",
        category: "advanced-systems",
        icon: Activity,
      },
    ],
  },

  {
    id: "tools",
    title: "Technical Tools",
    description: "Load cases, safety factors, formulas and unit conversion",

    icon: BookOpen,
    color: "from-indigo-500 to-indigo-600",

    modules: [
      {
        id: "load-case-manager",
        title: "Load Case Manager",
        description: "Manage multiple structural load cases and envelopes",
        route: "/products/structural/load-case-manager",
        category: "tools",
        icon: Workflow,
        subGroup: "Analysis Utilities",
      },
      {
        id: "safety-factor",
        title: "Safety Factor",
        description: "Compute reserve factors for bolts, shafts and joints",
        route: "/products/fasteners/safety-factor",
        category: "tools",
        icon: ShieldCheck,
        subGroup: "Analysis Utilities",
      },
      {
        id: "formula-reference",
        title: "Engineering Formulas",
        description: "Searchable hub of common physics formulas",
        route: "/products/tools/formula-reference",
        category: "tools",
        icon: BookOpen,
        subGroup: "Reference",
      },
      {
        id: "unit-converter",
        title: "Unit Converter",
        description: "Convert between engineering unit systems",
        route: "/products/tools/unit-converter",
        category: "tools",
        icon: ArrowLeftRight,
        subGroup: "Reference",
      },
    ],
  },
];

/**
 * 🔥 FLAT MODULE LIST
 */
export const allModules = categories.flatMap(
  (category) => category.modules
);

/**
 * ⭐ FEATURED MODULES
 */
export const featuredModules = allModules.filter(
  (module) => module.featured
);

/**
 * 🧭 HELPERS
 */
export function getModuleByRoute(route: string) {
  return allModules.find((module) => module.route === route);
}