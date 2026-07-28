/**
 * Bearing Engineering Suite — navigation and family deep-links.
 */

export type BearingSuiteNavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
  /** Calculator module id when registered in modules.ts */
  moduleId?: string;
};

export const BEARING_SUITE_NAV: BearingSuiteNavItem[] = [
  {
    id: "selection",
    label: "Selection",
    href: "/products/bearings/selection",
    description: "Rank catalog designations for duty and life",
    moduleId: "bearings",
  },
  {
    id: "life",
    label: "Life",
    href: "/products/bearings/life",
    description: "ISO 281 L10 / Lnm rating life",
    moduleId: "bearing-life",
  },
  {
    id: "database",
    label: "Database",
    href: "/products/bearings/database",
    description: "Search SKF, FAG, NSK, Timken, NTN",
    moduleId: "bearing-database",
  },
  {
    id: "loads",
    label: "Loads",
    href: "/products/bearings/loads",
    description: "Equivalent dynamic load P with X, Y, e",
    moduleId: "bearing-loads",
  },
  {
    id: "arrangement",
    label: "Arrangement",
    href: "/products/bearings/arrangement",
    description: "Fixed-free and duplex O / X / T layouts",
    moduleId: "bearing-arrangement",
  },
  {
    id: "speed",
    label: "Speed",
    href: "/products/bearings/speed",
    description: "DN value and limiting speeds",
    moduleId: "bearing-speed",
  },
  {
    id: "lubrication",
    label: "Lubrication",
    href: "/products/bearings/lubrication",
    description: "κ, grease life, and relubrication",
    moduleId: "bearing-lubrication",
  },
  {
    id: "failure",
    label: "Failure",
    href: "/products/bearings/failure",
    description: "Modes, causes, and corrective actions",
    moduleId: "bearing-failure",
  },
  {
    id: "mounting",
    label: "Mounting",
    href: "/products/bearings/mounting",
    description: "Fits, clearance, and mounting practice",
    moduleId: "bearing-mounting",
  },
  {
    id: "plain",
    label: "Plain",
    href: "/products/bearings/plain",
    description: "Hydrodynamic journal and pad bearings",
    moduleId: "plain-bearings",
  },
  {
    id: "housing",
    label: "Housings",
    href: "/products/bearings/housing",
    description: "Housing body and mounting bolts",
    moduleId: "housing",
  },
];

export type BearingFamilyCard = {
  id: string;
  label: string;
  href: string;
  typeQuery?: string;
  description: string;
};

export const BEARING_FAMILY_CARDS: BearingFamilyCard[] = [
  {
    id: "deep_groove",
    label: "Deep groove ball",
    href: "/products/bearings/selection?type=deep_groove",
    typeQuery: "deep_groove",
    description: "General radial and light combined loads",
  },
  {
    id: "angular_contact",
    label: "Angular contact",
    href: "/products/bearings/selection?type=angular_contact",
    typeQuery: "angular_contact",
    description: "Axial + radial; duplex O / X / T",
  },
  {
    id: "cylindrical_roller",
    label: "Cylindrical roller",
    href: "/products/bearings/selection?type=cylindrical_roller",
    typeQuery: "cylindrical_roller",
    description: "High radial capacity",
  },
  {
    id: "needle_roller",
    label: "Needle roller",
    href: "/products/bearings/selection?type=needle_roller",
    typeQuery: "needle_roller",
    description: "Compact radial envelopes",
  },
  {
    id: "spherical_roller",
    label: "Spherical roller",
    href: "/products/bearings/selection?type=spherical_roller",
    typeQuery: "spherical_roller",
    description: "Heavy radial + misalignment",
  },
  {
    id: "tapered_roller",
    label: "Tapered roller",
    href: "/products/bearings/selection?type=tapered_roller",
    typeQuery: "tapered_roller",
    description: "Combined loads; adjustable preload",
  },
  {
    id: "thrust",
    label: "Thrust",
    href: "/products/bearings/selection?type=thrust_ball",
    typeQuery: "thrust_ball",
    description: "Primarily axial duty",
  },
  {
    id: "plain",
    label: "Plain bearing",
    href: "/products/bearings/plain",
    description: "Journal, thrust pad, tilting pad",
  },
];

export const BEARING_SUITE_EXAMPLES = [
  {
    id: "conveyor",
    title: "Conveyor roller selection",
    href: "/products/bearings/selection?type=deep_groove&example=conveyor",
    blurb: "Screen a deep-groove pair for continuous radial duty.",
  },
  {
    id: "motor",
    title: "Electric motor L10 life",
    href: "/products/bearings/life?example=motor",
    blurb: "ISO 281 life hours for a 6205-class motor bearing.",
  },
  {
    id: "ballscrew",
    title: "Angular contact for ballscrew",
    href: "/products/bearings/selection?type=angular_contact&example=ballscrew",
    blurb: "Duplex angular-contact sizing for axial-dominant duty.",
  },
] as const;

export const BEARING_SUITE_STANDARDS = [
  {
    id: "iso-281",
    code: "ISO 281",
    title: "Basic and modified rating life",
    href: "/documentation/modules/bearings#iso-281",
  },
  {
    id: "iso-76",
    code: "ISO 76",
    title: "Static load ratings",
    href: "/documentation/modules/bearings#iso-76",
  },
  {
    id: "iso-492",
    code: "ISO 492",
    title: "Bearing tolerances",
    href: "/documentation/modules/bearings#iso-492",
  },
  {
    id: "abma",
    code: "ABMA / ANSI",
    title: "Inch series context",
    href: "/documentation/modules/bearings#abma",
  },
] as const;

export function suiteNavItemForPath(pathname: string): BearingSuiteNavItem | undefined {
  const exact = BEARING_SUITE_NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  if (exact) return exact;
  if (pathname === "/products/bearings" || pathname === "/products/bearings/") {
    return undefined;
  }
  return undefined;
}
