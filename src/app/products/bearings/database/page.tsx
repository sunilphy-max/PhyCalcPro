"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BearingSuiteChrome from "@/components/machine/bearings-shared/BearingSuiteChrome";
import {
  bearingCatalog,
  findBearing,
  type BearingCatalogEntry,
  type BearingManufacturer,
  type CatalogBearingType,
} from "@/data/catalogs/bearingCatalog";
import { constructionForType, provenanceLabel } from "@/data/bearings/constructionDefaults";
import { filterCatalog } from "@/data/catalogs/bearing/application";

const MANUFACTURERS: Array<BearingManufacturer | "all"> = [
  "all",
  "SKF",
  "FAG",
  "NSK",
  "TIMKEN",
  "NTN",
];

function provenanceFor(entry: BearingCatalogEntry): string {
  if (entry.fatigueLoadLimitFromDatasheet || entry.puSource === "datasheet") {
    return provenanceLabel("datasheet");
  }
  if (entry.puSource === "c_ratio" || entry.puSource === "c0_ratio") {
    return provenanceLabel("estimated");
  }
  return provenanceLabel("oem_scaled");
}

export default function BearingDatabasePage() {
  const [query, setQuery] = useState("");
  const [manufacturer, setManufacturer] = useState<BearingManufacturer | "all">("all");
  const [type, setType] = useState<CatalogBearingType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    let list = filterCatalog(bearingCatalog, {
      manufacturer: manufacturer === "all" ? undefined : manufacturer,
      type: type === "all" ? undefined : type,
    });
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.designation.toLowerCase().includes(q) ||
          b.manufacturer.toLowerCase().includes(q) ||
          (b.isoSize ?? "").toLowerCase().includes(q) ||
          b.series.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 80);
  }, [query, manufacturer, type]);

  const selected = selectedId ? findBearing(selectedId) : null;
  const construction = selected ? constructionForType(selected.type, selected.sealType, selected.cageType) : null;

  return (
    <BearingSuiteChrome>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Bearing database</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search designations across SKF, FAG, NSK, Timken, and NTN. Selecting a grade loads C, C₀,
            geometry, and speed limits into Life or Selection.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_160px_180px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 6205, 30208, SKF…"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value as BearingManufacturer | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "All OEMs" : m}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CatalogBearingType | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">All types</option>
            <option value="deep_groove">Deep groove</option>
            <option value="angular_contact">Angular contact</option>
            <option value="cylindrical_roller">Cylindrical</option>
            <option value="tapered_roller">Tapered</option>
            <option value="spherical_roller">Spherical</option>
            <option value="needle_roller">Needle</option>
            <option value="thrust_ball">Thrust ball</option>
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ul className="space-y-2">
            {results.map((entry) => (
              <li key={`${entry.manufacturer}-${entry.designation}`}>
                <button
                  type="button"
                  onClick={() => setSelectedId(entry.designation)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    selectedId === entry.designation
                      ? "border-cyan-400 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-950/30"
                      : "border-slate-200 bg-white hover:border-cyan-200 dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {entry.designation}
                    </span>
                    <span className="text-xs text-slate-500">
                      {entry.manufacturer} · {entry.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-4">
                    <span>
                      Ø {entry.boreMm}×{entry.outerDiameterMm}×{entry.widthMm} mm
                    </span>
                    <span>C = {(entry.dynamicRatingN / 1e3).toFixed(1)} kN</span>
                    <span>C₀ = {(entry.staticRatingN / 1e3).toFixed(1)} kN</span>
                    <span>n_lim = {Math.round(entry.limitingSpeedRpm)} rpm</span>
                  </div>
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                No matching designations.
              </li>
            ) : null}
          </ul>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            {selected && construction ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h2 className="font-semibold text-slate-900 dark:text-white">{selected.designation}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Ratings provenance: {provenanceFor(selected)}
                  {selected.massKg != null ? ` · ~${selected.massKg.toFixed(2)} kg` : ""}
                </p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Ring</dt>
                    <dd className="text-right text-slate-800 dark:text-slate-200">{construction.ringMaterial}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Rolling element</dt>
                    <dd className="text-right text-slate-800 dark:text-slate-200">{construction.rollingElement}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Cage</dt>
                    <dd className="text-right text-slate-800 dark:text-slate-200">{construction.cage}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Seal</dt>
                    <dd className="text-right text-slate-800 dark:text-slate-200">{selected.sealType}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Temp</dt>
                    <dd className="text-right text-slate-800 dark:text-slate-200">{construction.operatingTemperature}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                  Apps: {construction.typicalApplications.join(", ")}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={`/products/bearings/designer?intent=service&designation=${encodeURIComponent(selected.designation)}&panel=duty`}
                    className="rounded-lg bg-cyan-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-cyan-700"
                  >
                    Use in life calculator
                  </Link>
                  <Link
                    href={`/products/bearings/designer?intent=design&designation=${encodeURIComponent(selected.designation)}&type=${selected.type}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold dark:border-slate-600"
                  >
                    Use in selection
                  </Link>
                  <Link
                    href={`/products/bearings/designer?intent=design&designation=${encodeURIComponent(selected.designation)}&panel=verify`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold dark:border-slate-600"
                  >
                    Check speed limits
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">
                Select a designation to view construction details and hand off to Life or Selection.
              </div>
            )}
          </aside>
        </div>
      </div>
    </BearingSuiteChrome>
  );
}
