"use client";

import { useMemo } from "react";
import type { Dimension } from "@/lib/units/types";
import { conversionFactors } from "@/lib/units/conversions";

type Props = {
  dimension: Dimension;
  value: string;
  onChange: (unit: string) => void;
  system?: string;
  label?: string;
};

export default function UnitSelector({
  dimension,
  value,
  onChange,
  system = "si",
  label,
}: Props) {
  const units = useMemo(() => {
    const map = (conversionFactors as any)[dimension] || {};
    return Object.keys(map).map((k) => ({ key: k, label: k }));
  }, [dimension, system]);

  return (
    <div className="flex flex-col">
      {label && <label className="text-sm text-slate-300">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 rounded bg-slate-800 text-slate-200"
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
