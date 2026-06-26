"use client";

import { useMemo } from "react";
import CalculatorUnitField from "@/components/calculator/CalculatorUnitField";
import ModuleUnitSelect from "@/components/shared/ModuleUnitSelect";
import UnitSelector from "@/components/shared/UnitSelector";
import { calculatorInputGridClass } from "@/components/calculator/styles";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import {
  getDesignInputFieldDefs,
  usesInlineDesignTargetFields,
} from "@/lib/design-workflows/designInputFieldRegistry";
import type { DesignInputFieldDef } from "@/lib/design-workflows/designInputFieldRegistry";
import {
  getDesignTargetFieldKey,
  getDesignTargetUnitKey,
  readDesignTargetValue,
  resolveDesignTargetUnit,
  writeDesignTargetValue,
} from "@/lib/design-workflows/designTargetUnits";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import type { PhysicsDimension } from "@/lib/physics/units";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

type Props = {
  moduleId: string;
};

function DesignTargetUnitControl({
  moduleId,
  field,
  inputs,
  onUnitChange,
}: {
  moduleId: string;
  field: DesignInputFieldDef;
  inputs: ModuleUserInputs;
  onUnitChange: (unit: string) => void;
}) {
  if (!field.dimension || field.dimension === "ratio" || field.dimension === "count") {
    return <span className="text-sm text-slate-500">{field.unitLabel ?? "—"}</span>;
  }

  const unit = resolveDesignTargetUnit(field, moduleId, inputs);
  const fieldKey = getDesignTargetFieldKey(field);
  const profile = fieldKey ? getModuleFieldProfile(moduleId, fieldKey) : undefined;

  if (profile && fieldKey) {
    return (
      <ModuleUnitSelect
        moduleId={moduleId}
        fieldKey={fieldKey}
        value={unit}
        onChange={onUnitChange}
      />
    );
  }

  return (
    <UnitSelector
      dimension={field.dimension as PhysicsDimension}
      value={unit}
      onChange={onUnitChange}
    />
  );
}

/** Editable design-target fields for Auto-design / Compare workflow modes. */
export default function DesignTargetFields({ moduleId }: Props) {
  const { mode, userInputs, designTargets, patchDesignTarget } = useDesignWorkflow();
  const fields = useMemo(() => getDesignInputFieldDefs(moduleId), [moduleId]);
  const mergedInputs = useMemo(
    () => ({ ...userInputs, ...designTargets }),
    [userInputs, designTargets]
  );

  if (usesInlineDesignTargetFields(moduleId)) return null;
  if (!fields.length || (mode !== "design" && mode !== "select")) return null;

  const handleChange = (field: DesignInputFieldDef, value: number) => {
    patchDesignTarget(
      field.inputKey,
      writeDesignTargetValue(field, moduleId, value, mergedInputs) as ModuleUserInputs[typeof field.inputKey]
    );
  };

  const handleUnitChange = (field: DesignInputFieldDef, unit: string) => {
    if (!field.dimension) return;
    const unitKey = getDesignTargetUnitKey(field.dimension);
    if (unitKey) {
      patchDesignTarget(unitKey, unit);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-300 bg-cyan-50/80 p-4 shadow-sm dark:border-cyan-800 dark:bg-cyan-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-900 dark:text-cyan-200">
        {mode === "select" ? "Compare — design targets" : "Auto-design — design targets"}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Enter the loads, limits, and safety factors you want the sizing run to meet.
      </p>
      <div className={`mt-4 ${calculatorInputGridClass}`}>
        {fields.map((field) => (
          <CalculatorUnitField
            key={String(field.inputKey)}
            label={field.label}
            value={readDesignTargetValue(field, moduleId, designTargets, userInputs)}
            onChange={(value) => handleChange(field, value)}
            step={field.step ?? "any"}
            unit={
              <DesignTargetUnitControl
                moduleId={moduleId}
                field={field}
                inputs={mergedInputs}
                onUnitChange={(unit) => handleUnitChange(field, unit)}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
