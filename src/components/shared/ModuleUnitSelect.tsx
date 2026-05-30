"use client";

import UnitSelector from "@/components/shared/UnitSelector";
import { getModuleFieldProfile } from "@/lib/units/moduleProfiles";
import type { PhysicsDimension } from "@/lib/physics/units";

type Props = {
  moduleId: string;
  fieldKey: string;
  value: string;
  onChange: (unit: string) => void;
  /** When true, only units listed on the module profile are shown (legacy). Default: all compatible units. */
  restrictToProfile?: boolean;
};

export default function ModuleUnitSelect({
  moduleId,
  fieldKey,
  value,
  onChange,
  restrictToProfile = false,
}: Props) {
  const profile = getModuleFieldProfile(moduleId, fieldKey);
  if (!profile) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
      >
        <option value={value}>{value}</option>
      </select>
    );
  }

  return (
    <UnitSelector
      dimension={profile.dimension as PhysicsDimension}
      value={value}
      onChange={onChange}
      allowedUnits={restrictToProfile ? profile.units : undefined}
    />
  );
}
