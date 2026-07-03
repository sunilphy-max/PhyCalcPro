"use client";

import type { Dispatch, SetStateAction } from "react";
import CalculatorSelectField from "@/components/calculator/CalculatorSelectField";
import { springWiresByGrade } from "@/data/catalogs/springWireCatalog";
import type { SpringWireType } from "@/lib/springs/shared/wireStrength";

type Props = {
  wireType: SpringWireType;
  catalogDesignation: string;
  setCatalogDesignation: Dispatch<SetStateAction<string>>;
  onPick: (entry: { diameterMm: number; tensileStrengthPa: number; shearModulusPa: number; elasticModulusPa: number }) => void;
};

export default function SpringWireCatalogPicker({
  wireType,
  catalogDesignation,
  setCatalogDesignation,
  onPick,
}: Props) {
  const entries = wireType === "custom" ? [] : springWiresByGrade(wireType);

  if (entries.length === 0) return null;

  return (
    <CalculatorSelectField
      label="Wire stock (EN 10270 / ASTM catalog)"
      value={catalogDesignation}
      onChange={(value) => {
        setCatalogDesignation(value);
        const entry = entries.find((e) => e.designation === value);
        if (entry) {
          onPick({
            diameterMm: entry.diameterMm,
            tensileStrengthPa: entry.tensileStrengthPa,
            shearModulusPa: entry.shearModulusPa,
            elasticModulusPa: entry.elasticModulusPa,
          });
        }
      }}
    >
      <option value="">Manual entry</option>
      {entries.map((e) => (
        <option key={e.designation} value={e.designation}>
          {e.designation} — Rm ≈ {(e.tensileStrengthPa / 1e6).toFixed(0)} MPa
        </option>
      ))}
    </CalculatorSelectField>
  );
}
