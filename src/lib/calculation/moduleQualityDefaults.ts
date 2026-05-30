import type { ModuleQualityChecklist } from "./qualityChecklist";
import { moduleUnitProfiles } from "@/lib/units/moduleProfiles";

const MODULES_WITH_PLOTS = new Set([
  "beams",
  "shafts",
  "columns",
  "frames",
  "trusses",
  "plates",
  "vibrations",
  "pipes",
  "vessels",
]);

const MODULES_WITH_DIAGRAMS = new Set([
  "beams",
  "shafts",
  "columns",
  "frames",
  "trusses",
  "vibrations",
]);

export function getModuleQualityChecklist(
  moduleId: string,
  overrides?: Partial<ModuleQualityChecklist>
): ModuleQualityChecklist {
  const hasProfile = Boolean(moduleUnitProfiles[moduleId]);
  return {
    unitIntegrity: hasProfile,
    physicsValidation: true,
    chartConformance: MODULES_WITH_PLOTS.has(moduleId),
    pictorialCoverage: MODULES_WITH_DIAGRAMS.has(moduleId),
    exportConsistency: true,
    ...overrides,
  };
}
