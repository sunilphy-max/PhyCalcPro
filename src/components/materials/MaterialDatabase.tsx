"use client";

import Link from "next/link";
import { materials, materialCategoryLabels, findMaterialById, type MaterialCategory } from "@/data/materials";
import { materialUseCases, type MaterialUseCase } from "@/data/materialUseCases";
import { materialCompareHref, materialDatasheetHref } from "@/lib/materials/materialPage";
import { modulesAcceptingCatalogMaterial } from "@/lib/workspace/workspaceRegistry";
import { useMemo, useState } from "react";

type Props = {
  highlightMaterial?: string | null;
  querySeed?: string;
};

const MAX_COMPARE = 4;

function mpa(value: number): string {
  return `${Math.round(value / 1e6)} MPa`;
}

export default function MaterialDatabase({ highlightMaterial, querySeed }: Props) {
  const [query, setQuery] = useState(querySeed ?? "");
  const [category, setCategory] = useState<MaterialCategory | "all">("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(null);
  const targets = useMemo(() => modulesAcceptingCatalogMaterial(), []);

  const activeUseCase: MaterialUseCase | undefined = useMemo(
    () => materialUseCases.find((u) => u.id === activeUseCaseId),
    [activeUseCaseId]
  );

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

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const useCaseModule = activeUseCase?.moduleId
    ? targets.find((t) => t.id === activeUseCase.moduleId)
    : undefined;

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold">Material Encyclopedia</h3>
        <p className="mt-1 text-sm text-slate-500">
          {materials.length} graded materials with full datasheets. Browse, compare candidates, or
          follow use-case recommendations — then push properties into any of {targets.length}{" "}
          calculators with <code className="text-xs">?material=</code>.
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recommended for
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {materialUseCases.map((uc) => (
            <button
              key={uc.id}
              type="button"
              onClick={() => setActiveUseCaseId((prev) => (prev === uc.id ? null : uc.id))}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                activeUseCaseId === uc.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {uc.label}
            </button>
          ))}
        </div>
      </div>

      {activeUseCase ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900 dark:bg-sky-950/30">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Recommended — {activeUseCase.label}
              </h4>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {activeUseCase.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveUseCaseId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {activeUseCase.recommendations.map((rec, index) => {
              const material = findMaterialById(rec.materialId);
              if (!material) return null;
              return (
                <div
                  key={rec.materialId}
                  className="rounded-lg border border-sky-100 bg-white p-3 dark:border-sky-900 dark:bg-slate-900"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <Link
                      href={materialDatasheetHref(material.id)}
                      className="font-semibold text-slate-900 hover:text-blue-700 dark:text-white"
                    >
                      {material.name}
                    </Link>
                    {index === 0 ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        Top pick
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
                    {rec.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Link
                      href={materialDatasheetHref(material.id)}
                      className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                    >
                      Open datasheet
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(material.id)}
                      className="rounded-md border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-600"
                    >
                      {compareIds.includes(material.id) ? "In compare" : "Compare"}
                    </button>
                    {useCaseModule ? (
                      <Link
                        href={`${useCaseModule.route}?material=${encodeURIComponent(material.name)}`}
                        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-blue-600 dark:border-slate-600"
                      >
                        Use in {useCaseModule.title}
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

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

      {compareIds.length > 0 ? (
        <div className="sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:border-slate-600">
          <span>
            {compareIds.length} selected for compare
            {compareIds.length < 2 ? " (pick at least 2)" : ""}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="rounded-md border border-slate-500 px-2.5 py-1 text-xs"
            >
              Clear
            </button>
            {compareIds.length >= 2 ? (
              <Link
                href={materialCompareHref(compareIds)}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-900"
              >
                Compare {compareIds.length} materials →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            No matching materials found.
          </div>
        ) : (
          results.map((material) => {
            const selected = compareIds.includes(material.id);
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
                  <button
                    type="button"
                    onClick={() => toggleCompare(material.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs ${
                      selected
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-slate-200 text-slate-700 dark:border-slate-600 dark:text-slate-200"
                    }`}
                  >
                    {selected ? "Compared" : "Compare"}
                  </button>
                  {targets.slice(0, 6).map((mod) => (
                    <Link
                      key={mod.id}
                      href={`${mod.route}?material=${encodeURIComponent(material.name)}`}
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs text-blue-600 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                      Use in {mod.title}
                    </Link>
                  ))}
                  {targets.length > 6 ? (
                    <span className="self-center text-[11px] text-slate-400">
                      +{targets.length - 6} more via datasheet
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
