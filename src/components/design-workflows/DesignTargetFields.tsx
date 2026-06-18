"use client";

import { useMemo } from "react";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import {
  getDesignInputFieldDefs,
  usesInlineDesignTargetFields,
} from "@/lib/design-workflows/designInputFieldRegistry";
import type { DesignInputFieldDef } from "@/lib/design-workflows/designInputFieldRegistry";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import { fromBase, toBase } from "@/lib/units/conversions";

type Props = {
  moduleId: string;
};

function readFieldValue(
  field: DesignInputFieldDef,
  designTargets: ModuleUserInputs,
  userInputs: ModuleUserInputs,
  units: { length: string; stress: string; power: string }
): number {
  const raw = designTargets[field.inputKey] ?? userInputs[field.inputKey];
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (field.dimension === "length") return fromBase(raw, "length", units.length);
    if (field.dimension === "stress") return fromBase(raw, "stress", units.stress);
    if (field.dimension === "power") {
      const powerUnit = userInputs.powerUnit ?? units.power;
      if (powerUnit === "kW") return raw / 1000;
      if (powerUnit === "hp") return raw / 745.7;
      return raw;
    }
    return raw;
  }
  return field.defaultValue ?? 0;
}

function writeFieldValue(
  field: DesignInputFieldDef,
  value: number,
  units: { length: string; stress: string; power: string },
  powerUnit: string
): ModuleUserInputs[keyof ModuleUserInputs] {
  if (field.dimension === "length") return toBase(value, "length", units.length);
  if (field.dimension === "stress") return toBase(value, "stress", units.stress);
  if (field.dimension === "power") {
    if (powerUnit === "kW") return value * 1000;
    if (powerUnit === "hp") return value * 745.7;
    return value;
  }
  return value;
}

/** Editable design-target fields for Auto-design / Compare workflow modes. */
export default function DesignTargetFields({ moduleId }: Props) {
  const { mode, userInputs, designTargets, patchDesignTarget } = useDesignWorkflow();
  const fields = useMemo(() => getDesignInputFieldDefs(moduleId), [moduleId]);

  const lengthUnit = userInputs.lengthUnit ?? "mm";
  const stressUnit = userInputs.stressUnit ?? "MPa";
  const powerUnit = userInputs.powerUnit ?? "kW";
  const units = useMemo(
    () => ({ length: lengthUnit, stress: stressUnit, power: powerUnit }),
    [lengthUnit, stressUnit, powerUnit]
  );

  if (usesInlineDesignTargetFields(moduleId)) return null;
  if (!fields.length || (mode !== "design" && mode !== "select")) return null;

  const handleChange = (field: DesignInputFieldDef, value: number) => {
    patchDesignTarget(
      field.inputKey,
      writeFieldValue(field, value, units, powerUnit) as ModuleUserInputs[typeof field.inputKey]
    );
    if (field.inputKey === "power") {
      patchDesignTarget("powerUnit", powerUnit);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-300 bg-cyan-50/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-900">
        {mode === "select" ? "Compare — design targets" : "Auto-design — design targets"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Enter the loads, limits, and safety factors you want the sizing run to meet.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <CalculatorUnitField
            key={field.inputKey}
            label={field.label}
            value={readFieldValue(field, designTargets, userInputs, units)}
            onChange={(value) => handleChange(field, value)}
            step={field.step ?? "any"}
            unit={
              field.dimension === "length" ? (
                <ModuleUnitSelect
                  moduleId={moduleId}
                  fieldKey={field.fieldKey ?? "length"}
                  value={lengthUnit}
                  onChange={(unit) => patchDesignTarget("lengthUnit", unit)}
                />
              ) : field.dimension === "stress" ? (
                <ModuleUnitSelect
                  moduleId={moduleId}
                  fieldKey={field.fieldKey ?? "stress"}
                  value={stressUnit}
                  onChange={(unit) => patchDesignTarget("stressUnit", unit)}
                />
              ) : field.dimension === "power" ? (
                <ModuleUnitSelect
                  moduleId={moduleId}
                  fieldKey={field.fieldKey ?? "power"}
                  value={powerUnit}
                  onChange={(unit) => patchDesignTarget("powerUnit", unit)}
                />
              ) : (
                <span className="text-sm text-slate-500">{field.unitLabel ?? "—"}</span>
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
