"use client";

import { useMemo } from "react";
import type { Dimension } from "@/lib/units/types";
import { getUnitsForDimension, unitFactors } from "@/lib/physics/units";

type Props = {
  dimension: Dimension;
  value: string;
  onChange: (unit: string) => void;
  allowedUnits?: string[];
  label?: string;
};

export default function UnitSelector({
  dimension,
  value,
  onChange,
  allowedUnits,
  label,
}: Props) {
  const units = useMemo(() => {
    const dim = dimension as keyof typeof unitFactors;
    if (!(dim in unitFactors)) return [{ key: value, label: value }];
    const keys = getUnitsForDimension(dim, allowedUnits);
    return keys.map((k) => ({ key: k, label: k }));
  }, [dimension, allowedUnits, value]);

  return (
    <div className="flex flex-col min-w-[5.5rem]">
      {label ? <label className="text-sm text-slate-600">{label}</label> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800"
      >
        {units.map((u) => (
          <option key={u.key} value={u.key}>
            {u.label}
          </option>
        ))}
      </select>
    </div>
  );
}
