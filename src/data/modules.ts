export type EngineeringModule = {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;
  tags?: string[];
  featured?: boolean;
};

export type EngineeringCategory = {
  id: string;
  title: string;
  description: string;
  modules: EngineeringModule[];
};

/**
 * 🧠 FULL ENGINEERING TAXONOMY (MITCalc-STYLE)
 */

export const categories: EngineeringCategory[] = [
  // ================= STRUCTURAL =================
  {
    id: "structural",
    title: "Structural Engineering",
    description: "Beams, frames, columns, plates, and structural analysis",
    modules: [
      {
        id: "beams",
        title: "Beam Analysis",
        description: "Deflection, bending moment, shear force",
        route: "/products/structural/beams",
        category: "structural",
        featured: true,
      },
      {
        id: "frames",
        title: "Frame Analysis",
        description: "2D frame structural analysis",
        route: "/products/structural/frames",
        category: "structural",
      },
      {
        id: "trusses",
        title: "Truss Analysis",
        description: "Axial force analysis in truss systems",
        route: "/products/structural/trusses",
        category: "structural",
      },
      {
        id: "columns",
        title: "Column Buckling",
        description: "Euler buckling and stability analysis",
        route: "/products/structural/columns",
        category: "structural",
      },
      {
        id: "plates",
        title: "Plate Bending",
        description: "Thin plate bending and stress analysis",
        route: "/products/structural/plates",
        category: "structural",
      },
    ],
  },

  // ================= MACHINE DESIGN =================
  {
    id: "machine",
    title: "Machine Design",
    description: "Shafts, gears, bearings, and rotating systems",
    modules: [
      {
        id: "shafts",
        title: "Shaft Design",
        description: "Torsion, bending, fatigue analysis",
        route: "/products/machine/shafts",
        category: "machine",
        featured: true,
      },
      {
        id: "gears",
        title: "Gear Design",
        description: "Spur and helical gear calculations",
        route: "/products/machine/gears",
        category: "machine",
      },
      {
        id: "bearings",
        title: "Bearing Selection",
        description: "Load rating and life estimation",
        route: "/products/machine/bearings",
        category: "machine",
      },
      {
        id: "cams",
        title: "Cam Design",
        description: "Cam profile and motion analysis",
        route: "/products/machine/cams",
        category: "machine",
      },
      {
        id: "flywheels",
        title: "Flywheel Design",
        description: "Energy storage and inertia design",
        route: "/products/machine/flywheels",
        category: "machine",
      },
    ],
  },

  // ================= FASTENERS =================
  {
    id: "fasteners",
    title: "Fasteners & Connections",
    description: "Bolts, welds, rivets, threaded joints",
    modules: [
      {
        id: "bolts",
        title: "Bolt Calculator",
        description: "Preload, shear, tension analysis",
        route: "/products/fasteners/bolts",
        category: "fasteners",
        featured: true,
      },
      {
        id: "welds",
        title: "Weld Group Analysis",
        description: "Weld strength and stress distribution",
        route: "/products/fasteners/welds",
        category: "fasteners",
      },
      {
        id: "rivets",
        title: "Rivet Analysis",
        description: "Shear and bearing stress in rivets",
        route: "/products/fasteners/rivets",
        category: "fasteners",
      },
    ],
  },

  // ================= MATERIALS =================
  {
    id: "materials",
    title: "Materials & Sections",
    description: "Material properties and cross-sections",
    modules: [
      {
        id: "material-db",
        title: "Material Database",
        description: "Steel, aluminum, alloys properties",
        route: "/products/materials/database",
        category: "materials",
      },
      {
        id: "sections",
        title: "Section Properties",
        description: "I, Z, centroid, inertia calculations",
        route: "/products/materials/sections",
        category: "materials",
      },
    ],
  },

  // ================= PRESSURE SYSTEMS =================
  {
    id: "pressure",
    title: "Pressure Systems",
    description: "Pipes, vessels, and pressure components",
    modules: [
      {
        id: "pipes",
        title: "Pipe Stress Analysis",
        description: "Internal pressure and stress analysis",
        route: "/products/pressure/pipes",
        category: "pressure",
      },
      {
        id: "vessels",
        title: "Pressure Vessels",
        description: "Thin and thick wall vessel design",
        route: "/products/pressure/vessels",
        category: "pressure",
      },
    ],
  },

  // ================= DYNAMICS =================
  {
    id: "dynamics",
    title: "Dynamics & Vibrations",
    description: "Motion, vibration, and dynamic systems",
    modules: [
      {
        id: "vibrations",
        title: "Vibration Analysis",
        description: "Natural frequency and resonance",
        route: "/products/dynamics/vibrations",
        category: "dynamics",
      },
      {
        id: "rotation",
        title: "Rotational Systems",
        description: "Dynamic rotating system analysis",
        route: "/products/dynamics/rotation",
        category: "dynamics",
      },
    ],
  },

  // ================= MANUFACTURING =================
  {
    id: "manufacturing",
    title: "Manufacturing",
    description: "Tolerances, fits, and GD&T tools",
    modules: [
      {
        id: "tolerance",
        title: "Tolerance Stackup",
        description: "Dimensional variation analysis",
        route: "/products/manufacturing/tolerance",
        category: "manufacturing",
      },
      {
        id: "fits",
        title: "Fits & Clearances",
        description: "ISO fit system calculations",
        route: "/products/manufacturing/fits",
        category: "manufacturing",
      },
    ],
  },
];

/**
 * 🔥 FLAT LIST (used by sidebar/search)
 */
export const allModules = categories.flatMap((c) => c.modules);

/**
 * ⭐ FEATURED MODULES
 */
export const featuredModules = allModules.filter((m) => m.featured);

/**
 * 🧭 HELPERS
 */
export function getModuleByRoute(route: string) {
  return allModules.find((m) => m.route === route);
}