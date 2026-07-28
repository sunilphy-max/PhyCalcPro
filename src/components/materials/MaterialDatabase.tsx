"use client";

import Link from "next/link";
import { materials, materialCategoryLabels, type MaterialCategory } from "@/data/materials";
import { hasMaterialDatasheet } from "@/data/materialDatasheets";
import { materialDatasheetHref } from "@/lib/materials/materialPage";
import { modulesAcceptingCatalogMaterial } from "@/lib/workspace/workspaceRegistry";
import { useMemo, useState } from "react";

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
  const [datasheetOnly, setDatasheetOnly] = useState(false);
  const targets = useMemo(() => modulesAcceptingCatalogMaterial(), []);

  const results = useMemo(
    () =>
      materials.filter((material) => {
        if (category !== "all" && material.category !== category) return false;
        if (datasheetOnly && !hasMaterialDatasheet(material.id)) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          material.name.toLowerCase().includes(q) ||
          (material.standard ?? "").toLowerCase().includes(q) ||
          material.id.includes(q)
        );
      }),
    [query, category, datasheetOnly]
  );

  const datasheetCount = useMemo(
    () => materials.filter((m) => hasMaterialDatasheet(m.id)).length,
    []
  );

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold">Material Encyclopedia</h3>
        <p className="mt-1 text-sm text-slate-500">
          {materials.length} graded materials · {datasheetCount} full datasheets. Open a grade for
          mechanical, thermal, electrical, composition, and selection guidance, then push properties
          into any of {targets.length} calculators with{" "}
          <code className="text-xs">?material=</code>.
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

      <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={datasheetOnly}
          onChange={(e) => setDatasheetOnly(e.target.checked)}
          className="rounded border-slate-300"
        />
        Full datasheets only
      </label>

      <div className="grid gap-3">
        {results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            No matching materials found.
          </div>
        ) : (
          results.map((material) => {
            const datasheet = hasMaterialDatasheet(material.id);
            return (
              <div
                key={material.id}
                className={`rounded-xl border p-4 ${
                  highlightMaterial === material.name
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={materialDatasheetHref(material.id)}
                      className="font-semibold text-slate-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                    >
                      {material.name}
                    </Link>
                    {datasheet ? (
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                        Datasheet
                      </span>
                    ) : null}
                  </div>
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
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={materialDatasheetHref(material.id)}
                    className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Open datasheet
                  </Link>
                  {targets.slice(0, 8).map((mod) => (
                    <Link
                      key={mod.id}
                      href={`${mod.route}?material=${encodeURIComponent(material.name)}`}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs text-blue-600 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      Use in {mod.title}
                    </Link>
                  ))}
                  {targets.length > 8 ? (
                    <span className="self-center text-[11px] text-slate-400">
                      +{targets.length - 8} more via datasheet
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
