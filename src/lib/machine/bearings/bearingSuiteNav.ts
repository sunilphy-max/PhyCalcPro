/**
 * Bearing Engineering Suite — navigation centered on System Designer.
 */

import { bearingAssistantExamples } from "./bearingApplicationAssistants";

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
    description: "Product Select–style start: Auto-design, Validate, Compare, Diagnose",
  },
  {
    id: "designer",
    label: "Calculator",
    href: "/products/bearings/designer",
    description: "Single bearing / system calculator",
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

/** Absorbed tools — deep-link into Designer panels (kept for SEO redirects). */
export const BEARING_ABSORBED_TOOL_REDIRECTS: Record<string, string> = {
  life: "/products/bearings/designer?intent=design&panel=verify",
  loads: "/products/bearings/designer?intent=design&panel=duty",
  speed: "/products/bearings/designer?intent=design&panel=verify",
  lubrication: "/products/bearings/designer?intent=design&panel=verify",
  mounting: "/products/bearings/designer?intent=design&panel=system",
  arrangement: "/products/bearings/designer?intent=design&panel=system",
  selection: "/products/bearings/designer?intent=design",
};

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
    href: "/products/bearings/designer?intent=design&type=deep_groove",
    typeQuery: "deep_groove",
    description: "General radial and light combined loads",
  },
  {
    id: "angular_contact",
    label: "Angular contact",
    href: "/products/bearings/designer?intent=design&type=angular_contact",
    typeQuery: "angular_contact",
    description: "Axial + radial; duplex O / X / T",
  },
  {
    id: "cylindrical_roller",
    label: "Cylindrical roller",
    href: "/products/bearings/designer?intent=design&type=cylindrical_roller",
    typeQuery: "cylindrical_roller",
    description: "High radial capacity",
  },
  {
    id: "needle_roller",
    label: "Needle roller",
    href: "/products/bearings/designer?intent=design&type=needle_roller",
    typeQuery: "needle_roller",
    description: "Compact radial envelopes",
  },
  {
    id: "spherical_roller",
    label: "Spherical roller",
    href: "/products/bearings/designer?intent=design&type=spherical_roller",
    typeQuery: "spherical_roller",
    description: "Heavy radial + misalignment",
  },
  {
    id: "tapered_roller",
    label: "Tapered roller",
    href: "/products/bearings/designer?intent=design&type=tapered_roller",
    typeQuery: "tapered_roller",
    description: "Combined loads; adjustable preload",
  },
  {
    id: "thrust",
    label: "Thrust",
    href: "/products/bearings/designer?intent=design&type=thrust_ball",
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

/** Worked examples — backed by selection assistants. */
export const BEARING_SUITE_EXAMPLES = bearingAssistantExamples();

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
  // Prefer longest href so /products/bearings does not steal /products/bearings/designer.
  const ranked = [...BEARING_SUITE_NAV].sort((a, b) => b.href.length - a.href.length);
  return ranked.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
}
