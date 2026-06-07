"use client";

import { ROLLED_SECTIONS, ROLLED_SECTION_FAMILIES, sectionsByFamily } from "@/lib/materials/rolled-sections/data";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";

type Props = {
  designation: string;
  onDesignationChange: (designation: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  familyFilter?: string;
  className?: string;
};

export default function RolledSectionPicker({
  designation,
  onDesignationChange,
  onSectionApplied,
  familyFilter,
  className = "",
}: Props) {
  const families = familyFilter ? [familyFilter] : [...ROLLED_SECTION_FAMILIES];
  const options = families.flatMap((family) => sectionsByFamily(family));

  const handleChange = (next: string) => {
    onDesignationChange(next);
    const section = ROLLED_SECTIONS[next];
    if (section) onSectionApplied(next, section);
  };

  const selected = designation ? ROLLED_SECTIONS[designation] : undefined;

  return (
    <div className={`space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Rolled section catalog
      </label>
      <select
        className="w-full rounded border border-slate-300 bg-white p-2 text-sm"
        value={designation}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">Manual section properties</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {selected ? (
        <p className="text-xs leading-5 text-slate-600">
          I<sub>x</sub> {(selected.ix * 1e6).toFixed(2)}×10⁻⁶ m⁴ · S<sub>x</sub>{" "}
          {(selected.sx * 1e6).toFixed(2)}×10⁻⁶ m³ · A {(selected.area * 1e4).toFixed(2)} cm² ·{" "}
          {selected.weight.toFixed(1)} kg/m
        </p>
      ) : null}
    </div>
  );
}
