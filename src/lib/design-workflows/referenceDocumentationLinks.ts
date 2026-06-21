/**
 * Maps catalog reference labels (from module design workflows) to in-app documentation
 * and calculator routes. Falls back to the current module doc when no exact match exists.
 */

export type ReferenceDocLink = {
  href: string;
  /** When true, opens in a new tab (external standards body). */
  external?: boolean;
};

/** Exact label → destination. Prefer module docs and live calculators over generic pages. */
const EXACT_REFERENCE_LINKS: Record<string, ReferenceDocLink> = {
  // Structural
  "Material allowable table": { href: "/documentation/modules/material-db" },
  "Section property table": { href: "/documentation/modules/profiles" },
  "Deflection limit presets": { href: "/documentation/modules/beams" },

  // Power transmission
  "Belt sections": { href: "/documentation/modules/v-belts" },
  "Chain pitches": { href: "/documentation/modules/roller-chains" },
  "Pulley/sprocket standards": { href: "/documentation/modules/multi-pulley" },
  "Service factors": { href: "/documentation/modules/v-belts" },

  // Machine
  "Material grades": { href: "/documentation/modules/material-db" },
  "Standard diameters": { href: "/documentation/modules/shafts" },
  "Standard shaft diameters": { href: "/documentation/modules/shafts" },
  "Bearing series": { href: "/documentation/modules/bearings" },
  "Gear/tooth standards": { href: "/documentation/modules/gears" },
  "AGMA/ISO gear factors": { href: "/documentation/modules/gears" },
  "Standard modules": { href: "/documentation/modules/gears" },
  "Material hardness": { href: "/documentation/modules/material-db" },
  "Lubrication factors": { href: "/documentation/modules/bearings" },
  "DIN 743 factors": { href: "/documentation/modules/shafts" },
  "AGMA/ASME shaft factors": { href: "/documentation/modules/shafts" },
  "Keyway dimensions": { href: "/documentation/modules/keys-splines" },
  "ISO 281 life factors": { href: "/documentation/modules/bearings" },
  "ABMA bearing series": { href: "/documentation/modules/bearings" },
  "Lubrication/service factors": { href: "/documentation/modules/bearings" },

  // Springs
  "Spring wire sizes": { href: "/documentation/modules/compression-springs" },
  "Material modulus": { href: "/documentation/modules/temperature-properties" },
  "End condition factors": { href: "/documentation/modules/columns" },

  // Fasteners
  "Bolt grades": { href: "/documentation/modules/bolts" },
  "Thread sizes": { href: "/documentation/modules/bolts" },
  "ISO/ASME bolt sizes": { href: "/documentation/modules/bolts" },
  "Property classes": { href: "/documentation/modules/bolts" },
  "AISC/VDI factors": { href: "/documentation/modules/bolts" },
  "Keyway/spline dimensions": { href: "/documentation/modules/keys-splines" },
  "Weld throat/leg sizes": { href: "/documentation/modules/welds" },

  // Materials
  "Temperature properties": { href: "/documentation/modules/temperature-properties" },
  "S-N curves": { href: "/documentation/modules/fatigue" },
  "Corrosion rates": { href: "/documentation/modules/corrosion" },

  // Pressure
  "Pipe schedules": { href: "/documentation/modules/pipes" },
  "Vessel material allowables": { href: "/documentation/modules/vessels" },
  "ASME VIII allowables": { href: "/documentation/modules/vessels" },
  "EN 13445 material data": { href: "/documentation/modules/vessels" },
  "Plate thicknesses": { href: "/documentation/modules/plates" },
  "Corrosion allowances": { href: "/documentation/modules/corrosion" },
  "Fluid properties": { href: "/documentation/modules/hydraulics" },

  // Dynamics
  "Damping ratios": { href: "/documentation/modules/vibrations" },
  "Isolation mounts": { href: "/documentation/modules/suspension" },
  "Shock factors": { href: "/documentation/modules/impact" },
  "Rotor balance grades": { href: "/documentation/modules/rotation" },

  // Manufacturing
  "ISO 286 fits": { href: "/documentation/modules/fits" },
  "ASME Y14.5 controls": { href: "/documentation/modules/tolerance" },
  "Process capability": { href: "/documentation/modules/tolerance" },
  "Cost factors": { href: "/documentation/modules/cost-estimator" },

  // Advanced systems
  "Cryogenic properties": { href: "/documentation/modules/cryogenic-engineering" },
  "Vacuum conductance": { href: "/documentation/modules/vacuum-engineering" },
  "Magnet constants": { href: "/documentation/modules/magnetic-fields" },
  "Battery/hydrogen safety references": { href: "/documentation/modules/battery-ev-systems" },
  "Pump speed classes": { href: "/documentation/modules/vacuum-engineering" },
  "Outgassing references": { href: "/documentation/modules/vacuum-engineering" },
  "Flange/window load references": { href: "/documentation/modules/vacuum-engineering" },
  "Cryogen latent heats": { href: "/documentation/modules/cryogenic-engineering" },
  "Material conductivity": { href: "/documentation/modules/thermal-management" },
  "MLI assumptions": { href: "/documentation/modules/cryogenic-engineering" },
  "Cooldown heat capacity": { href: "/documentation/modules/cryogenic-engineering" },
  "Conductor gauges": { href: "/documentation/modules/magnetic-fields" },
  "Insulation classes": { href: "/documentation/modules/magnetic-fields" },
  "Cooling assumptions": { href: "/documentation/modules/thermal-management" },

  // Tools
  "Formula catalog": { href: "/documentation/modules/formula-reference" },
  "Unit conversion table": { href: "/documentation/modules/unit-converter" },
  "NIST/ISO unit references": {
    href: "https://www.nist.gov/pml/owm/metric-si/si-units",
    external: true,
  },
};

/** Keyword hints when the catalog label is not an exact map key. */
const KEYWORD_REFERENCE_LINKS: Array<{ pattern: RegExp; link: ReferenceDocLink }> = [
  { pattern: /material|grade|allowable/i, link: { href: "/documentation/modules/material-db" } },
  { pattern: /section|profile|property/i, link: { href: "/documentation/modules/profiles" } },
  { pattern: /beam|deflection/i, link: { href: "/documentation/modules/beams" } },
  { pattern: /column|buckling|end condition/i, link: { href: "/documentation/modules/columns" } },
  { pattern: /belt|pulley|service factor/i, link: { href: "/documentation/modules/v-belts" } },
  { pattern: /chain|sprocket/i, link: { href: "/documentation/modules/roller-chains" } },
  { pattern: /gear|module|AGMA|ISO 6336/i, link: { href: "/documentation/modules/gears" } },
  { pattern: /shaft|DIN 743/i, link: { href: "/documentation/modules/shafts" } },
  { pattern: /bearing|ISO 281|ABMA|L10/i, link: { href: "/documentation/modules/bearings" } },
  { pattern: /spring|wire/i, link: { href: "/documentation/modules/compression-springs" } },
  { pattern: /bolt|thread|VDI|AISC|fastener/i, link: { href: "/documentation/modules/bolts" } },
  { pattern: /weld|throat|leg size/i, link: { href: "/documentation/modules/welds" } },
  { pattern: /keyway|spline|key/i, link: { href: "/documentation/modules/keys-splines" } },
  { pattern: /fatigue|S-N/i, link: { href: "/documentation/modules/fatigue" } },
  { pattern: /corrosion/i, link: { href: "/documentation/modules/corrosion" } },
  { pattern: /temperature/i, link: { href: "/documentation/modules/temperature-properties" } },
  { pattern: /pipe|schedule/i, link: { href: "/documentation/modules/pipes" } },
  { pattern: /vessel|ASME|EN 13445|plate thickness/i, link: { href: "/documentation/modules/vessels" } },
  { pattern: /hydraulic|fluid/i, link: { href: "/documentation/modules/hydraulics" } },
  { pattern: /vibration|damping|natural frequency/i, link: { href: "/documentation/modules/vibrations" } },
  { pattern: /suspension|isolation|mount/i, link: { href: "/documentation/modules/suspension" } },
  { pattern: /impact|shock/i, link: { href: "/documentation/modules/impact" } },
  { pattern: /rotation|rotor|balance/i, link: { href: "/documentation/modules/rotation" } },
  { pattern: /fit|ISO 286/i, link: { href: "/documentation/modules/fits" } },
  { pattern: /tolerance|GD&T|Y14\.5|stack/i, link: { href: "/documentation/modules/tolerance" } },
  { pattern: /cost/i, link: { href: "/documentation/modules/cost-estimator" } },
  { pattern: /vacuum|pump|conductance|outgassing|flange/i, link: { href: "/documentation/modules/vacuum-engineering" } },
  { pattern: /cryogen|MLI|latent heat|cooldown/i, link: { href: "/documentation/modules/cryogenic-engineering" } },
  { pattern: /magnet|solenoid|conductor|insulation class/i, link: { href: "/documentation/modules/magnetic-fields" } },
  { pattern: /thermal|heat leak|conductivity|cooling/i, link: { href: "/documentation/modules/thermal-management" } },
  { pattern: /battery|hydrogen|EV/i, link: { href: "/documentation/modules/battery-ev-systems" } },
  { pattern: /superconduct/i, link: { href: "/documentation/modules/superconducting-systems" } },
  { pattern: /precision motion|ISO 230/i, link: { href: "/documentation/modules/precision-motion" } },
  { pattern: /formula/i, link: { href: "/documentation/modules/formula-reference" } },
  { pattern: /unit|NIST|SI/i, link: { href: "/documentation/modules/unit-converter" } },
  { pattern: /design workflow|workflow layer/i, link: { href: "/documentation/reference#1-8-design-workflow-layer" } },
  { pattern: /design code|standard profile/i, link: { href: "/documentation/reference#1-3-design-codes" } },
];

export function getModuleDocumentationHref(moduleId: string): string {
  const normalized = moduleId.replace(/^materials\//, "material-").replace(/\//g, "-");
  return `/documentation/modules/${normalized}`;
}

export function resolveReferenceDocumentationLink(
  label: string,
  moduleId: string
): ReferenceDocLink {
  const exact = EXACT_REFERENCE_LINKS[label];
  if (exact) return exact;

  for (const { pattern, link } of KEYWORD_REFERENCE_LINKS) {
    if (pattern.test(label)) return link;
  }

  return { href: getModuleDocumentationHref(moduleId) };
}

export function getReferenceDocumentationEntries(
  labels: string[],
  moduleId: string
): Array<{ label: string; link: ReferenceDocLink }> {
  const seen = new Set<string>();
  const entries: Array<{ label: string; link: ReferenceDocLink }> = [];

  for (const label of labels) {
    const link = resolveReferenceDocumentationLink(label, moduleId);
    const key = `${link.href}|${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ label, link });
  }

  return entries;
}
