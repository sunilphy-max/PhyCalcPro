"use client";

import { useMemo, useState } from "react";
import {
  ROLLED_SECTIONS,
  ROLLED_SECTION_FAMILIES,
  sectionsByFamily,
} from "@/lib/materials/rolled-sections/data";
import type { RolledSectionProps } from "@/lib/materials/rolled-sections/data";
import BeamSectionPreview from "@/components/structural/beams/BeamSectionPreview";

type Props = {
  designation: string;
  onDesignationChange: (designation: string) => void;
  onSectionApplied: (designation: string, section: RolledSectionProps) => void;
  familyFilter?: string;
  className?: string;
};

const BEAM_FAMILIES = ["W", "S", "C", "L", "RHS", "SHS", "Pipe", "IPE", "UPN"] as const;

export default function RolledSectionPicker({
  designation,
  onDesignationChange,
  onSectionApplied,
  familyFilter,
  className = "",
}: Props) {
  const [family, setFamily] = useState<string>(familyFilter ?? "W");
  const [query, setQuery] = useState("");

  const families = familyFilter
    ? [familyFilter]
    : BEAM_FAMILIES.filter((f) =>
        (ROLLED_SECTION_FAMILIES as readonly string[]).includes(f)
      );

  const options = useMemo(() => {
    const base =
      family === "Custom"
        ? []
        : sectionsByFamily(family.length ? family : families[0] ?? "W");
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((d) => d.toLowerCase().includes(q));
  }, [family, families, query]);

  const handleChange = (next: string) => {
    onDesignationChange(next);
    if (!next) return;
    const section = ROLLED_SECTIONS[next];
    if (section) onSectionApplied(next, section);
  };

  const selected = designation ? ROLLED_SECTIONS[designation] : undefined;

  return (
    <div className={`space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        Beam section library
      </label>

      <div className="flex flex-wrap gap-1">
        {[...families, "Custom"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFamily(f);
              if (f === "Custom") {
                onDesignationChange("");
              }
            }}
            className={`rounded-md px-2 py-1 text-[11px] font-medium ${
              family === f
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {family !== "Custom" ? (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${family} shapes…`}
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <select
            className="w-full rounded border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            value={designation}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">Select section…</option>
            {options.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </>
      ) : (
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Custom: enter I and c manually in Geometry.
        </p>
      )}

      {selected ? (
        <BeamSectionPreview designation={designation} section={selected} />
      ) : null}
    </div>
  );
}
