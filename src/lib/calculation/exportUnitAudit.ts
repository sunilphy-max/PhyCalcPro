import { allModules } from "@/data/modules";

export type ModuleAuditEntry = {
  moduleId: string;
  route: string;
  exportBound: boolean;
  csvAvailable: boolean;
  unitSelectorsPresent: boolean;
  notes: string;
};

const profiledModules = new Set([
  "beams",
  "vibrations",
  "shafts",
  "corrosion",
  "fatigue",
  "pipes",
  "vessels",
]);

const exportMigratedRoutes = new Set([
  "/products/structural/beams",
  "/products/dynamics/vibrations",
  "/products/machine/shafts",
  "/products/structural/frames",
  "/products/structural/trusses",
  "/products/structural/columns",
  "/products/structural/plates",
  "/products/pressure/pipes",
  "/products/pressure/vessels",
  "/products/pressure/hydraulics",
  "/products/pressure/heat-exchangers",
  "/products/dynamics/rotation",
  "/products/dynamics/impact",
  "/products/dynamics/suspension",
  "/products/machine/gears",
  "/products/bearings/selection",
  "/products/machine/cams",
  "/products/machine/flywheels",
  "/products/fasteners/bolts",
  "/products/fasteners/welds",
  "/products/fasteners/rivets",
  "/products/fasteners/safety-factor",
  "/products/materials/sections",
  "/products/materials/composites",
  "/products/materials/corrosion",
  "/products/materials/fatigue",
  "/products/materials/temperature-properties",
  "/products/manufacturing/tolerance",
  "/products/manufacturing/fits",
  "/products/manufacturing/cost-estimator",
  "/products/manufacturing/cam-toolpaths",
  "/products/structural/combined-loading",
  "/products/structural/load-case-manager",
  "/products/materials/profiles",
]);

export const exportUnitAudit: ModuleAuditEntry[] = allModules.map((module) => ({
  moduleId: module.id,
  route: module.route,
  exportBound: exportMigratedRoutes.has(module.route),
  csvAvailable: exportMigratedRoutes.has(module.route),
  unitSelectorsPresent:
    profiledModules.has(module.id) ||
    ["beams", "vibrations", "shafts"].includes(module.id),
  notes: exportMigratedRoutes.has(module.route)
    ? profiledModules.has(module.id)
      ? "ExportableReport + module unit profile"
      : "ExportableReport migrated"
    : "Pending export migration",
}));

export function auditSummary() {
  const total = exportUnitAudit.length;
  const exportReady = exportUnitAudit.filter((entry) => entry.exportBound).length;
  const unitReady = exportUnitAudit.filter((entry) => entry.unitSelectorsPresent).length;
  return { total, exportReady, unitReady };
}
