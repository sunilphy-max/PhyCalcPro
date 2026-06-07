import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

export type DesignInputFieldDef = {
  inputKey: keyof ModuleUserInputs;
  label: string;
  dimension?: "length" | "stress" | "force" | "power" | "ratio" | "count" | "pressure";
  fieldKey?: string;
  unitLabel?: string;
  defaultValue?: number;
  step?: number | string;
};

/** Modules with editable design targets embedded in their *Inputs component. */
const INLINE_DESIGN_TARGET_MODULES = new Set([
  "beams",
  "columns",
  "compression-springs",
  "v-belts",
]);

const CATEGORY_FIELDS: Record<string, DesignInputFieldDef[]> = {
  structural: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "designMaxDeflection", label: "Max deflection", dimension: "length", fieldKey: "length", step: "any" },
    {
      inputKey: "designMaxStressPa",
      label: "Max allowable stress",
      dimension: "stress",
      fieldKey: "stress",
      defaultValue: 170e6,
      step: "any",
    },
  ],
  "power-transmission": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "speedDriver", label: "Driver speed", unitLabel: "rpm", defaultValue: 1450, step: 1 },
    { inputKey: "ratio", label: "Speed ratio", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  machine: [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Speed", unitLabel: "rpm", defaultValue: 1200, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
    { inputKey: "requiredLife", label: "Required life", unitLabel: "h", defaultValue: 20000, step: 100 },
  ],
  springs: [
    { inputKey: "targetRate", label: "Target spring rate", unitLabel: "N/m", defaultValue: 50, step: "any" },
    { inputKey: "maxForce", label: "Maximum force", unitLabel: "N", defaultValue: 500, step: "any" },
    { inputKey: "maxOD", label: "Maximum OD", dimension: "length", fieldKey: "meanDiameter", defaultValue: 40, step: "any" },
  ],
  fasteners: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "loadFactor", label: "Load factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  materials: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "targetCycles", label: "Target cycles", unitLabel: "cycles", defaultValue: 1e6, step: 1000 },
    { inputKey: "temperature", label: "Operating temperature", unitLabel: "°C", defaultValue: 20, step: 1 },
  ],
  pressure: [
    { inputKey: "pressure", label: "Design pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 1e6, step: "any" },
    { inputKey: "temperature", label: "Design temperature", unitLabel: "°C", defaultValue: 20, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  dynamics: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "naturalFrequency", label: "Target natural frequency", unitLabel: "Hz", defaultValue: 10, step: 0.1 },
    { inputKey: "dampingRatio", label: "Damping ratio", unitLabel: "—", defaultValue: 0.05, step: 0.01 },
  ],
  manufacturing: [
    { inputKey: "minGap", label: "Minimum functional gap", dimension: "length", fieldKey: "length", defaultValue: 0.1, step: "any" },
    { inputKey: "costTarget", label: "Cost target", unitLabel: "$", defaultValue: 100, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target yield", unitLabel: "—", defaultValue: 0.997, step: 0.001 },
  ],
  "advanced-systems": [
    { inputKey: "targetSafetyFactor", label: "Target margin", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "maxHeatLeak", label: "Max heat leak", unitLabel: "W", defaultValue: 50, step: "any" },
    { inputKey: "temperature", label: "Operating temperature", unitLabel: "°C", defaultValue: 20, step: 1 },
  ],
  tools: [
    { inputKey: "targetSafetyFactor", label: "Reference factor", unitLabel: "—", defaultValue: 1, step: 0.1 },
  ],
};

const MODULE_FIELD_OVERRIDES: Record<string, DesignInputFieldDef[]> = {
  gears: [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Pinion speed", unitLabel: "rpm", defaultValue: 1200, step: 1 },
    { inputKey: "gearRatio", label: "Gear ratio", unitLabel: "—", defaultValue: 4, step: 0.1 },
    { inputKey: "targetSafetyFactor", label: "Target bending safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  shafts: [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Shaft speed", unitLabel: "rpm", defaultValue: 1200, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target fatigue safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  bearings: [
    { inputKey: "requiredLife", label: "Required life L10", unitLabel: "h", defaultValue: 20000, step: 100 },
    { inputKey: "targetSafetyFactor", label: "Reliability factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
    { inputKey: "rpm", label: "Operating speed", unitLabel: "rpm", defaultValue: 1200, step: 1 },
  ],
  vessels: [
    { inputKey: "pressure", label: "Design pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 1e6, step: "any" },
    { inputKey: "temperature", label: "Design temperature", unitLabel: "°C", defaultValue: 20, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Joint efficiency factor", unitLabel: "—", defaultValue: 0.85, step: 0.05 },
  ],
  bolts: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "loadFactor", label: "Load factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  "timing-belts": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 5, step: "any" },
    { inputKey: "speedDriver", label: "Driver speed", unitLabel: "rpm", defaultValue: 1200, step: 1 },
    { inputKey: "ratio", label: "Speed ratio", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
};

function labelFromWorkflow(moduleId: string, fields: DesignInputFieldDef[]): DesignInputFieldDef[] {
  const workflow = getModuleDesignWorkflow(moduleId);
  if (!workflow?.designInputs.length) return fields;

  return fields.map((field, index) => ({
    ...field,
    label: workflow.designInputs[index] ?? field.label,
  }));
}

export function usesInlineDesignTargetFields(moduleId: string): boolean {
  return INLINE_DESIGN_TARGET_MODULES.has(moduleId);
}

export function getDesignInputFieldDefs(moduleId: string): DesignInputFieldDef[] {
  if (usesInlineDesignTargetFields(moduleId)) return [];

  const workflow = getModuleDesignWorkflow(moduleId);
  if (!workflow) return [];

  const categoryFields = CATEGORY_FIELDS[workflow.category] ?? CATEGORY_FIELDS.tools;
  const fields = MODULE_FIELD_OVERRIDES[moduleId] ?? categoryFields;
  return labelFromWorkflow(moduleId, fields);
}
