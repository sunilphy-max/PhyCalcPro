"use client";

import { useMemo, useState } from "react";
import { materials } from "@/data/materials";

type Props = {
  highlightMaterial?: string | null;
  querySeed?: string;
};

export default function MaterialDatabase({ highlightMaterial, querySeed }: Props) {
  const [query, setQuery] = useState(querySeed ?? "");

  const results = useMemo(
    () =>
      materials.filter((material) =>
        material.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Material Database</h3>
        <p className="text-sm text-slate-500 mt-1">
          Search common engineering materials and view their elastic modulus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <input
          type="text"
          placeholder="Search materials..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded border border-slate-200 px-3 py-2"
        />
      </div>

      <div className="grid gap-4">
        {results.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
            No matching materials found.
          </div>
        ) : (
          results.map((material) => (
            <div
              key={material.name}
              className={`rounded-xl border p-4 ${
                highlightMaterial === material.name
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="font-semibold text-slate-900">{material.name}</div>
              <div className="text-sm text-slate-500">E = {material.E.toExponential(2)} Pa</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
