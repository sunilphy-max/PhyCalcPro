import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";

export type DesignInputFieldDef = {
  inputKey: keyof ModuleUserInputs;
  label: string;
  dimension?: "length" | "stress" | "force" | "torque" | "moment" | "power" | "pressure" | "frequency" | "time" | "temperature" | "energy" | "mass" | "velocity" | "ratio" | "count";
  fieldKey?: string;
  unitLabel?: string;
  defaultValue?: number;
  step?: number | string;
};

/**
 * Modules that still embed design targets in *Inputs (legacy).
 * Prefer the shared DesignTargetFields strip — keep this empty unless a module
 * cannot yet consume shared targets.
 */
const INLINE_DESIGN_TARGET_MODULES = new Set<string>([]);

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
    { inputKey: "speedDriver", label: "Driver speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1450, step: 1 },
    { inputKey: "ratio", label: "Speed ratio", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  machine: [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
    { inputKey: "requiredLife", label: "Required life", dimension: "time", fieldKey: "life", defaultValue: 20000, step: 100 },
  ],
  springs: [
    { inputKey: "targetRate", label: "Target spring rate", unitLabel: "N/m", defaultValue: 50, step: "any" },
    { inputKey: "maxForce", label: "Maximum force", dimension: "force", fieldKey: "force", defaultValue: 500, step: "any" },
    { inputKey: "maxOD", label: "Maximum OD", dimension: "length", fieldKey: "meanDiameter", defaultValue: 40, step: "any" },
  ],
  fasteners: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "loadFactor", label: "Load factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  materials: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "targetCycles", label: "Target cycles", unitLabel: "cycles", defaultValue: 1e6, step: 1000 },
    { inputKey: "temperature", label: "Operating temperature", dimension: "temperature", fieldKey: "temperature", defaultValue: 20, step: 1 },
  ],
  pressure: [
    { inputKey: "pressure", label: "Design pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 1e6, step: "any" },
    { inputKey: "temperature", label: "Design temperature", dimension: "temperature", fieldKey: "temperature", defaultValue: 20, step: 1 },
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
    { inputKey: "temperature", label: "Operating temperature", dimension: "temperature", fieldKey: "temperature", defaultValue: 20, step: 1 },
  ],
  tools: [
    { inputKey: "targetSafetyFactor", label: "Reference factor", unitLabel: "—", defaultValue: 1, step: 0.1 },
  ],
};

const MODULE_FIELD_OVERRIDES: Record<string, DesignInputFieldDef[]> = {
  gears: [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Pinion speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "gearRatio", label: "Gear ratio", unitLabel: "—", defaultValue: 4, step: 0.1 },
    { inputKey: "targetSafetyFactor", label: "Target bending safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  shafts: [
    { inputKey: "power", label: "Transmitted power", dimension: "power", fieldKey: "power", defaultValue: 15, step: "any" },
    { inputKey: "rpm", label: "Operating speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "torque", label: "Torque (direct, optional)", dimension: "torque", fieldKey: "torque", defaultValue: 0, step: "any" },
    { inputKey: "bendingMoment", label: "Bending moment", dimension: "moment", fieldKey: "moment", defaultValue: 650, step: "any" },
    { inputKey: "targetSafetyFactor", label: "Target fatigue safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  bearings: [
    { inputKey: "maxForce", label: "Radial load", dimension: "force", fieldKey: "load", defaultValue: 6200, step: "any" },
    { inputKey: "axialLoad", label: "Axial load", dimension: "force", fieldKey: "load", defaultValue: 0, step: "any" },
    { inputKey: "rpm", label: "Operating speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "requiredLife", label: "Required life L10", dimension: "time", fieldKey: "life", defaultValue: 20000, step: 100 },
    { inputKey: "targetSafetyFactor", label: "Reliability factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  "plain-bearings": [
    { inputKey: "maxForce", label: "Radial load", dimension: "force", fieldKey: "load", defaultValue: 5000, step: "any" },
    { inputKey: "rpm", label: "Journal speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  flywheels: [
    { inputKey: "energy", label: "Stored energy target", dimension: "energy", fieldKey: "energy", defaultValue: 5000, step: "any" },
    { inputKey: "rpm", label: "Operating speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1500, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target stress margin", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  "bevel-gears": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 12, step: "any" },
    { inputKey: "rpm", label: "Pinion speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "gearRatio", label: "Gear ratio", unitLabel: "—", defaultValue: 3, step: 0.1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  "worm-gears": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 5, step: "any" },
    { inputKey: "rpm", label: "Worm speed", dimension: "frequency", fieldKey: "speed", defaultValue: 900, step: 1 },
    { inputKey: "gearRatio", label: "Reduction ratio", unitLabel: "—", defaultValue: 20, step: 0.5 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  "planetary-gears": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 20, step: "any" },
    { inputKey: "rpm", label: "Sun gear speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1500, step: 1 },
    { inputKey: "gearRatio", label: "Overall ratio", unitLabel: "—", defaultValue: 5, step: 0.1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  "brakes-clutches": [
    { inputKey: "maxForce", label: "Actuation force", dimension: "force", fieldKey: "force", defaultValue: 2000, step: "any" },
    { inputKey: "torque", label: "Transmitted torque", dimension: "torque", fieldKey: "torque", defaultValue: 400, step: "any" },
    { inputKey: "rpm", label: "Slip speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  "roller-chains": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 10, step: "any" },
    { inputKey: "speedDriver", label: "Driver sprocket speed", dimension: "frequency", fieldKey: "speed", defaultValue: 600, step: 1 },
    { inputKey: "ratio", label: "Speed ratio", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  "multi-pulley": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 8, step: "any" },
    { inputKey: "speedDriver", label: "Driver speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1450, step: 1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  pipes: [
    { inputKey: "pressure", label: "Design pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 1e6, step: "any" },
    { inputKey: "temperature", label: "Design temperature", dimension: "temperature", fieldKey: "temperature", defaultValue: 20, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  fatigue: [
    { inputKey: "stressAmplitude", label: "Alternating stress", dimension: "stress", fieldKey: "stress", defaultValue: 150, step: "any" },
    { inputKey: "meanStress", label: "Mean stress", dimension: "stress", fieldKey: "stress", defaultValue: 50, step: "any" },
    { inputKey: "targetCycles", label: "Target cycles", unitLabel: "cycles", defaultValue: 1e6, step: 1000 },
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
  ],
  vessels: [
    { inputKey: "pressure", label: "Design pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 1e6, step: "any" },
    { inputKey: "temperature", label: "Design temperature", dimension: "temperature", fieldKey: "temperature", defaultValue: 20, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Joint efficiency factor", unitLabel: "—", defaultValue: 0.85, step: 0.05 },
  ],
  bolts: [
    { inputKey: "targetSafetyFactor", label: "Target safety factor", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "loadFactor", label: "Load factor", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  "timing-belts": [
    { inputKey: "power", label: "Power to transmit", dimension: "power", fieldKey: "power", defaultValue: 5, step: "any" },
    { inputKey: "speedDriver", label: "Driver speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1200, step: 1 },
    { inputKey: "ratio", label: "Speed ratio", unitLabel: "—", defaultValue: 2, step: 0.1 },
    { inputKey: "serviceFactor", label: "Service factor", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  cams: [
    { inputKey: "lift", label: "Peak follower lift", dimension: "length", fieldKey: "radius", defaultValue: 10, step: "any" },
    { inputKey: "speedDriver", label: "Cam speed", dimension: "frequency", fieldKey: "speed", defaultValue: 300, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Pressure-angle margin", unitLabel: "—", defaultValue: 1.2, step: 0.05 },
  ],
  "gear-ratio-design": [
    { inputKey: "ratio", label: "Target gear ratio", unitLabel: "—", defaultValue: 4.5, step: 0.01 },
    { inputKey: "targetSafetyFactor", label: "Ratio tolerance factor", unitLabel: "—", defaultValue: 1, step: 0.01 },
  ],
  hydraulics: [
    { inputKey: "maxForce", label: "Required cylinder force", dimension: "force", fieldKey: "force", defaultValue: 50, step: "any" },
    { inputKey: "pressure", label: "System pressure", dimension: "pressure", fieldKey: "pressure", defaultValue: 160, step: "any" },
    { inputKey: "targetSafetyFactor", label: "Capacity margin", unitLabel: "—", defaultValue: 1.25, step: 0.05 },
  ],
  "heat-exchangers": [
    { inputKey: "heatDuty", label: "Heat duty", dimension: "power", fieldKey: "power", defaultValue: 50, step: "any" },
    { inputKey: "deltaT", label: "Log-mean ΔT", dimension: "temperature", fieldKey: "temperature", defaultValue: 25, step: 1 },
    { inputKey: "targetSafetyFactor", label: "UA margin", unitLabel: "—", defaultValue: 1.1, step: 0.05 },
  ],
  rotation: [
    { inputKey: "mass", label: "Rotating mass", dimension: "mass", fieldKey: "mass", defaultValue: 50, step: "any" },
    { inputKey: "power", label: "Shaft power", dimension: "power", fieldKey: "power", defaultValue: 10, step: "any" },
    { inputKey: "rpm", label: "Operating speed", dimension: "frequency", fieldKey: "speed", defaultValue: 1500, step: 1 },
    { inputKey: "targetSafetyFactor", label: "Stress margin", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  impact: [
    { inputKey: "mass", label: "Moving mass", dimension: "mass", fieldKey: "mass", defaultValue: 500, step: "any" },
    { inputKey: "velocity", label: "Velocity change", dimension: "velocity", fieldKey: "velocity", defaultValue: 2, step: "any" },
    { inputKey: "impactDuration", label: "Impact duration", dimension: "time", fieldKey: "duration", defaultValue: 0.01, step: "any" },
    { inputKey: "targetSafetyFactor", label: "Target dynamic SF", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
  suspension: [
    { inputKey: "mass", label: "Sprung mass", dimension: "mass", fieldKey: "sprungMass", defaultValue: 400, step: "any" },
    { inputKey: "lateralAcceleration", label: "Lateral acceleration", unitLabel: "m/s²", defaultValue: 3.92, step: 0.1 },
    { inputKey: "targetSafetyFactor", label: "Roll stability target", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  vibrations: [
    { inputKey: "excitationHz", label: "Excitation frequency", unitLabel: "Hz", defaultValue: 50, step: 0.1 },
    { inputKey: "dampingRatio", label: "Damping ratio", unitLabel: "—", defaultValue: 0.05, step: 0.01 },
    { inputKey: "targetSafetyFactor", label: "Separation margin", unitLabel: "—", defaultValue: 0.15, step: 0.01 },
  ],
  "keys-splines": [
    { inputKey: "torque", label: "Transmitted torque", dimension: "torque", fieldKey: "torque", defaultValue: 800, step: "any" },
    { inputKey: "targetSafetyFactor", label: "Target utilization", unitLabel: "—", defaultValue: 1, step: 0.05 },
  ],
  "extension-springs": [
    { inputKey: "targetRate", label: "Target spring rate", unitLabel: "N/m", defaultValue: 40, step: "any" },
    { inputKey: "maxForce", label: "Maximum force", dimension: "force", fieldKey: "force", defaultValue: 400, step: "any" },
    { inputKey: "maxOD", label: "Maximum OD", dimension: "length", fieldKey: "meanDiameter", defaultValue: 35, step: "any" },
  ],
  "torsion-springs": [
    { inputKey: "torque", label: "Applied torque", dimension: "torque", fieldKey: "torque", defaultValue: 5, step: "any" },
    { inputKey: "maxOD", label: "Maximum OD", dimension: "length", fieldKey: "meanDiameter", defaultValue: 40, step: "any" },
    { inputKey: "targetSafetyFactor", label: "Target stress margin", unitLabel: "—", defaultValue: 1.5, step: 0.1 },
  ],
};

function labelFromWorkflow(moduleId: string, fields: DesignInputFieldDef[]): DesignInputFieldDef[] {
  const workflow = getModuleDesignWorkflow(moduleId);
  if (!workflow?.designInputs.length) return fields;
  // Only replace labels when counts align — avoids mismatched workflow copy on module overrides.
  if (workflow.designInputs.length !== fields.length) return fields;

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
