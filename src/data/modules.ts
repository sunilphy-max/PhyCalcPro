import { ComponentType } from "react";

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
  icon?: ComponentType<any>;

  tags?: string[];
  featured?: boolean;
};

/**
 * 🧠 ENGINEERING CATEGORY
 */
export type EngineeringCategory = {
  id: string;
  title: string;
  description: string;

  // ✅ Category icon
  icon: ComponentType<any>;

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
        id: "shafts",
        title: "Shaft Design",
        description: "Torsion, bending, fatigue analysis",
        route: "/products/machine/shafts",
        category: "machine",
        icon: RotateCcw,
        featured: true,
      },

      {
        id: "gears",
        title: "Gear Design",
        description: "Spur and helical gear calculations",
        route: "/products/machine/gears",
        category: "machine",
        icon: CircleDot,
      },

      {
        id: "bearings",
        title: "Bearing Selection",
        description: "Load rating and life estimation",
        route: "/products/machine/bearings",
        category: "machine",
        icon: Gauge,
      },

      {
        id: "cams",
        title: "Cam Design",
        description: "Cam profile and motion analysis",
        route: "/products/machine/cams",
        category: "machine",
        icon: Activity,
      },

      {
        id: "flywheels",
        title: "Flywheel Design",
        description: "Energy storage and inertia design",
        route: "/products/machine/flywheels",
        category: "machine",
        icon: Disc3,
      },
    ],
  },

  // =========================================================
  // FASTENERS
  // =========================================================
  {
    id: "fasteners",
    title: "Fasteners & Connections",
    description: "Bolts, welds, rivets, threaded joints",

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