"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  materials,
  materialCategoryLabels,
  type Material,
  type MaterialCategory,
} from "@/data/materials";
import { materialDatasheetHref } from "@/lib/materials/materialPage";

type Props = {
  selectedName?: string;
  onApply?: (material: Material) => void;
  calculatorHref?: string;
};

/**
 * Compact materials browser for WorkspaceChrome (EDP-3).
 */
export default function WorkspaceMaterialsPanel({
  selectedName,
  onApply,
  calculatorHref = "/products/materials/database",
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MaterialCategory | "all">("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const results = useMemo(
    () =>
      materials.filter((m) => {
        if (category !== "all" && m.category !== category) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          (m.standard ?? "").toLowerCase().includes(q) ||
          m.id.includes(q)
        );
      }),
    [query, category]
  );

  const compared = materials.filter((m) => compareIds.includes(m.id));
  const selected = materials.find((m) => m.name === selectedName);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Material library</h3>
        <div className="flex flex-wrap gap-3">
          {selected ? (
            <Link
              href={materialDatasheetHref(selected.id)}
              className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
            >
              View datasheet
            </Link>
          ) : null}
          <Link
            href={calculatorHref}
            className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
          >
            Open full database
          </Link>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ASTM, EN, name…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MaterialCategory | "all")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="all">All categories</option>
          {Object.entries(materialCategoryLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {compared.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80">
              <tr>
                <th className="px-2 py-1.5">Property</th>
                {compared.map((m) => (
                  <th key={m.id} className="px-2 py-1.5 font-semibold">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["E (GPa)", (m: Material) => (m.E / 1e9).toFixed(0)],
                ["Fy (MPa)", (m: Material) => Math.round(m.yieldStress / 1e6)],
                ["Fu (MPa)", (m: Material) => Math.round(m.ultimateStrength / 1e6)],
                ["ρ (kg/m³)", (m: Material) => m.density],
                ["Cost", (m: Material) => m.costBand ?? "—"],
                ["Corrosion", (m: Material) => m.corrosionClass ?? "—"],
                ["Machinability", (m: Material) => m.machinabilityIndex?.toFixed(1) ?? "—"],
              ].map(([label, fn]) => (
                <tr key={String(label)} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-1 text-slate-500">{label as string}</td>
                  {compared.map((m) => (
                    <td key={m.id} className="px-2 py-1 tabular-nums">
                      {(fn as (m: Material) => string | number)(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
        {results.slice(0, 80).map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              selectedName === m.name
                ? "border-emerald-300 bg-emerald-50/80 dark:border-emerald-700 dark:bg-emerald-950/30"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  <Link href={materialDatasheetHref(m.id)} className="hover:underline">
                    {m.name}
                  </Link>
                </p>
                <p className="text-[11px] text-slate-500">
                  {m.standard ?? "—"} · Fy {Math.round(m.yieldStress / 1e6)} MPa
                  {m.costBand ? ` · ${m.costBand}` : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => toggleCompare(m.id)}
                  className="rounded border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-600"
                >
                  {compareIds.includes(m.id) ? "Compared" : "Compare"}
                </button>
                {onApply ? (
                  <button
                    type="button"
                    onClick={() => onApply(m)}
                    className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Use
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-500">
        {results.length} matches · catalog {materials.length}
      </p>
    </div>
  );
}
