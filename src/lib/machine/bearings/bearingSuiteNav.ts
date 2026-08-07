/**
 * Bearing Engineering Suite — navigation centered on System Designer.
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
    id: "start",
    label: "Start",
    href: "/products/bearings",
    description: "Choose Auto-design, Validate, Compare, or Diagnose",
  },
  {
    id: "designer",
    label: "Designer",
    href: "/products/bearings/designer",
    description: "Bearing System Designer — single bearing / system calculator",
    moduleId: "bearings",
  },
  {
    id: "assistant",
    label: "Assistants",
    href: "/products/bearings/assistant",
    description: "Machine-guided selection: motor, pump, fan, gearbox, conveyor, ballscrew",
    moduleId: "bearing-assistant",
  },
  {
    id: "database",
    label: "Database",
    href: "/products/bearings/database",
    description: "Search SKF, FAG, NSK, Timken, NTN",
    moduleId: "bearing-database",
  },
  {
    id: "failure",
    label: "Failure guide",
    href: "/products/bearings/failure",
    description: "Modes, causes, and corrective actions",
    moduleId: "bearing-failure",
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

export const BEARING_SUITE_STANDARDS = [
  {
    id: "iso-281",
    code: "ISO 281",
    title: "Basic and modified rating life",
    href: "/documentation/modules/bearings#iso-281--dynamic-load-ratings-and-rating-life",
  },
  {
    id: "iso-76",
    code: "ISO 76",
    title: "Static load ratings",
    href: "/documentation/modules/bearings#iso-76--static-load-ratings",
  },
  {
    id: "iso-492",
    code: "ISO 492",
    title: "Bearing tolerances",
    href: "/documentation/modules/bearings#iso-492--dimensional-and-running-accuracy-radial-bearings",
  },
  {
    id: "abma",
    code: "ABMA / ANSI",
    title: "Inch series context",
    href: "/documentation/modules/bearings#abma--ansi-inch-series",
  },
] as const;

export function suiteNavItemForPath(pathname: string): BearingSuiteNavItem | undefined {
  // Prefer longest href so /products/bearings does not steal /products/bearings/designer.
  const ranked = [...BEARING_SUITE_NAV].sort((a, b) => b.href.length - a.href.length);
  return ranked.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
}
