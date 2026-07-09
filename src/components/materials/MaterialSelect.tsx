"use client";

import Link from "next/link";
import { materialCategoryLabels, CUSTOM_MATERIAL } from "@/data/materials";
import {
  getMaterialsForProfile,
  profileAllowsCustom,
  type MaterialProfile,
} from "@/lib/materials/materialProfiles";
import { calculatorFieldLabelClass, calculatorSelectClass } from "@/components/calculator/styles";
import { useMemo } from "react";

type Props = {
  profile: MaterialProfile;
  value: string;
  onChange: (name: string) => void;
  allowCustom?: boolean;
  label?: string;
  className?: string;
  showBrowseLink?: boolean;
};

export default function MaterialSelect({
  profile,
  value,
  onChange,
  allowCustom,
  label = "Material",
  className,
  showBrowseLink = true,
}: Props) {
  const materialsForProfile = useMemo(() => getMaterialsForProfile(profile), [profile]);
  const showCustom = allowCustom ?? profileAllowsCustom(profile);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof materialsForProfile>();
    for (const m of materialsForProfile) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return map;
  }, [materialsForProfile]);

  return (
    <div className={className}>
      <label className={calculatorFieldLabelClass}>
        {label}
        <select
          className={`${calculatorSelectClass} mt-2`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {Array.from(grouped.entries()).map(([category, items]) => (
            <optgroup key={category} label={materialCategoryLabels[category as keyof typeof materialCategoryLabels]}>
              {items.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </optgroup>
          ))}
          {showCustom ? <option value={CUSTOM_MATERIAL}>{CUSTOM_MATERIAL}</option> : null}
        </select>
      </label>
      {showBrowseLink ? (
        <Link
          href={`/products/materials/database${value && value !== CUSTOM_MATERIAL ? `?material=${encodeURIComponent(value)}` : ""}`}
          className="mt-1 inline-block text-xs text-blue-600 hover:underline"
        >
          Browse all materials →
        </Link>
      ) : null}
    </div>
  );
}
