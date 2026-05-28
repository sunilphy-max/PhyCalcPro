import type { DesignCodeId } from "./types";

export type DesignCodeOption = {
  id: DesignCodeId;
  label: string;
  shortLabel: string;
  description: string;
  unitSystem: "SI" | "US" | "mixed";
};

export const designCodeOptions: DesignCodeOption[] = [
  {
    id: "INDICATIVE",
    label: "Indicative (educational)",
    shortLabel: "Indicative",
    description: "Closed-form or FEM estimates without a specific design code claim.",
    unitSystem: "SI",
  },
  {
    id: "US",
    label: "United States",
    shortLabel: "US",
    description: "US practice (AISC, ASME, AGMA, AWS, etc.) by module.",
    unitSystem: "US",
  },
  {
    id: "EU",
    label: "European Union",
    shortLabel: "EU",
    description: "EU harmonized practice (EN, VDI, DIN references) by module.",
    unitSystem: "SI",
  },
  {
    id: "ISO",
    label: "International (ISO)",
    shortLabel: "ISO",
    description: "ISO international standards where applicable by module.",
    unitSystem: "SI",
  },
];

export const defaultDesignCode: DesignCodeId = "INDICATIVE";

export function getDesignCodeOption(id: DesignCodeId): DesignCodeOption {
  return designCodeOptions.find((option) => option.id === id) ?? designCodeOptions[0];
}
