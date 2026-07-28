"use client";

import Link from "next/link";
import { materialCategoryLabels, CUSTOM_MATERIAL, findMaterial } from "@/data/materials";
import {
  getMaterialsForProfile,
  profileAllowsCustom,
  type MaterialProfile,
} from "@/lib/materials/materialProfiles";
import { materialDatasheetHref } from "@/lib/materials/materialPage";
import { calculatorFieldLabelClass, calculatorSelectClass } from "@/components/calculator/styles";
import { useEffect, useMemo } from "react";
import { subscribeMaterialApply } from "@/lib/workspace/materialEvents";

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
  const selected = value && value !== CUSTOM_MATERIAL ? findMaterial(value) : undefined;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof materialsForProfile>();
    for (const m of materialsForProfile) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return map;
  }, [materialsForProfile]);

  // Centralized materials bus — workspace / DB / URL apply flows through here
  useEffect(() => {
    return subscribeMaterialApply((detail) => {
      const inProfile = materialsForProfile.some((m) => m.name === detail.material.name);
      if (!inProfile) return;
      if (detail.profile && detail.profile !== profile && !inProfile) return;
      onChange(detail.material.name);
    });
  }, [profile, onChange, materialsForProfile]);

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
            <optgroup
              key={category}
              label={materialCategoryLabels[category as keyof typeof materialCategoryLabels]}
            >
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
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {selected ? (
            <Link href={materialDatasheetHref(selected.id)} className="text-blue-600 hover:underline">
              View datasheet →
            </Link>
          ) : null}
          <Link
            href={`/products/materials/database${value && value !== CUSTOM_MATERIAL ? `?material=${encodeURIComponent(value)}` : ""}`}
            className="text-blue-600 hover:underline"
          >
            Browse all materials →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
