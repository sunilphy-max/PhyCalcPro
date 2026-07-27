"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { materials, materialCategoryLabels, type MaterialCategory } from "@/data/materials";
import { modulesAcceptingCatalogMaterial } from "@/lib/workspace/workspaceRegistry";

type Props = {
  highlightMaterial?: string | null;
  querySeed?: string;
};

function mpa(value: number): string {
  return `${Math.round(value / 1e6)} MPa`;
}

export default function MaterialDatabase({ highlightMaterial, querySeed }: Props) {
  const [query, setQuery] = useState(querySeed ?? "");
  const [category, setCategory] = useState<MaterialCategory | "all">("all");
  const targets = useMemo(() => modulesAcceptingCatalogMaterial(), []);

  const results = useMemo(
    () =>
      materials.filter((material) => {
        if (category !== "all" && material.category !== category) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          material.name.toLowerCase().includes(q) ||
          (material.standard ?? "").toLowerCase().includes(q) ||
          material.id.includes(q)
        );
      }),
    [query, category]
  );

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold">Material Database</h3>
        <p className="mt-1 text-sm text-slate-500">
          {materials.length} graded engineering materials — centralized catalog usable from any
          calculator that binds materials ({targets.length} modules). Open a module with{" "}
          <code className="text-xs">?material=</code> or use the Materials workspace tab.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <input
          type="text"
          placeholder="Search by name or standard (e.g. S355, EN 10083)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MaterialCategory | "all")}
          className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
        >
          <option value="all">All categories</option>
          {Object.entries(materialCategoryLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            No matching materials found.
          </div>
        ) : (
          results.map((material) => (
            <div
              key={material.id}
              className={`rounded-xl border p-4 ${
                highlightMaterial === material.name
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900 dark:text-white">{material.name}</div>
                <div className="text-xs text-slate-500">
                  {materialCategoryLabels[material.category]}
                  {material.standard ? ` · ${material.standard}` : ""}
                </div>
              </div>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                <span>E = {(material.E / 1e9).toFixed(0)} GPa</span>
                <span>Re = {mpa(material.yieldStress)}</span>
                <span>Rm = {mpa(material.ultimateStrength)}</span>
                <span>ρ = {material.density} kg/m³</span>
                <span>ν = {material.poisson}</span>
                {material.enduranceLimit ? <span>Se = {mpa(material.enduranceLimit)}</span> : null}
                {material.hardnessHB ? <span>{material.hardnessHB} HB</span> : null}
                {material.costBand ? <span>Cost: {material.costBand}</span> : null}
                {material.corrosionClass ? <span>Corrosion: {material.corrosionClass}</span> : null}
                {material.machinabilityIndex != null ? (
                  <span>Machinability: {material.machinabilityIndex}</span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {targets.slice(0, 12).map((mod) => (
                  <Link
                    key={mod.id}
                    href={`${mod.route}?material=${encodeURIComponent(material.name)}`}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-blue-600 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    Use in {mod.title}
                  </Link>
                ))}
                {targets.length > 12 ? (
                  <span className="self-center text-[11px] text-slate-400">
                    +{targets.length - 12} more modules via Materials tab
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
