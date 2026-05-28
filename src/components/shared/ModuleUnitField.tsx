"use client";

import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import { toBaseUnit, fromBaseUnit, type PhysicsDimension } from "@/lib/physics/units";
import UnitSelector from "@/components/shared/UnitSelector";

type Props = {
  moduleId: string;
  fieldKey: string;
  value: number;
  unit: string;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: string) => void;
  min?: number;
  step?: number | string;
  className?: string;
};

export function normalizeFieldValue(
  moduleId: string,
  fieldKey: string,
  value: number,
  unit: string
): number {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  if (!profile) return value;
  return toBaseUnit(value, profile.dimension, unit);
}

export function displayFieldValue(
  moduleId: string,
  fieldKey: string,
  baseValue: number,
  unit: string
): number {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  if (!profile) return baseValue;
  return fromBaseUnit(baseValue, profile.dimension, unit);
}

export default function ModuleUnitField({
  moduleId,
  fieldKey,
  value,
  unit,
  onValueChange,
  onUnitChange,
  min,
  step,
  className = "",
}: Props) {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  if (!profile) {
    return (
      <label className={`block text-sm text-slate-700 ${className}`}>
        {fieldKey}
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
        />
      </label>
    );
  }

  return (
    <label className={`block text-sm text-slate-700 ${className}`}>
      {profile.label}
      <div className="mt-2 flex gap-2">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
        />
        <UnitSelector
          dimension={profile.dimension as PhysicsDimension}
          value={unit}
          onChange={onUnitChange}
          allowedUnits={profile.units}
        />
      </div>
    </label>
  );
}
