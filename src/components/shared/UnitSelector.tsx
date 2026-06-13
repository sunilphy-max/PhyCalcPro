"use client";

import { useMemo } from "react";
import { calculatorUnitSelectClass } from "@/components/calculator/styles";
import type { Dimension } from "@/lib/units/types";
import { getUnitsForDimension, unitFactors } from "@/lib/physics/units";

type Props = {
  dimension: Dimension;
  value: string;
  onChange: (unit: string) => void;
  /** If set, limits the dropdown; omit to show every unit supported for this dimension. */
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
    if (value && !keys.includes(value)) {
      keys.push(value);
    }
    return keys.sort().map((k) => ({ key: k, label: k }));
  }, [dimension, allowedUnits, value]);

  return (
    <div className="flex min-w-[5.5rem] flex-col shrink-0">
      {label ? <label className="text-sm text-slate-600">{label}</label> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={calculatorUnitSelectClass}
        aria-label={label ?? `Unit for ${dimension}`}
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
