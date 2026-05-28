export type ModuleQualityChecklist = {
  unitIntegrity: boolean;
  physicsValidation: boolean;
  chartConformance: boolean;
  pictorialCoverage: boolean;
  exportConsistency: boolean;
};

export type ChecklistItem = {
  key: keyof ModuleQualityChecklist;
  label: string;
  description: string;
};

export const moduleChecklistItems: ChecklistItem[] = [
  {
    key: "unitIntegrity",
    label: "Unit integrity",
    description: "All solver inputs/outputs normalized and converted through shared unit contracts.",
  },
  {
    key: "physicsValidation",
    label: "Physics validation",
    description: "Engines expose explicit validation and solver-check metadata.",
  },
  {
    key: "chartConformance",
    label: "Chart conformance",
    description: "Plots use shared professional styling and consistent axis/legend language.",
  },
  {
    key: "pictorialCoverage",
    label: "Pictorial input/output",
    description: "Module includes schematic inputs and color-coded output visualizations.",
  },
  {
    key: "exportConsistency",
    label: "Export consistency",
    description: "Reports include the same KPIs, units, and visuals as on-screen results.",
  },
];

export function checklistScore(checklist: ModuleQualityChecklist): number {
  const passed = Object.values(checklist).filter(Boolean).length;
  return Math.round((passed / moduleChecklistItems.length) * 100);
}
