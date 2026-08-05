"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { findBearing, filterCatalog, bearingCatalog } from "@/data/catalogs/bearingCatalog";
import { calculatorTextInputClass } from "@/components/calculator/styles";

type Props = {
  designation: string;
  onSelect: (designation: string) => void;
  /** Optional: jump UI to size / identify stage after load */
  onLoaded?: () => void;
};

/**
 * Product Select–style designation search at the top of the calculator.
 */
export default function BearingDesignationSearchBar({ designation, onSelect, onLoaded }: Props) {
  const [query, setQuery] = useState(designation);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(designation);
  }, [designation]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const fromFilter = filterCatalog(bearingCatalog, {}).filter((e) =>
      e.designation.toLowerCase().includes(q)
    );
    return fromFilter.slice(0, 8);
  }, [query]);

  const load = (d: string) => {
    const entry = findBearing(d);
    const next = entry?.designation ?? d.trim();
    if (!next) return;
    setQuery(next);
    onSelect(next);
    setOpen(false);
    onLoaded?.();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40 p-4 dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800 dark:text-cyan-300">
        Single bearing search
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        Enter a designation (e.g. 6205, 22220 E) — same starting move as Product Select catalog search.
      </p>
      <div className="relative mt-3">
        <label className="sr-only" htmlFor="bearing-designation-search">
          Bearing designation
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="bearing-designation-search"
              className={`${calculatorTextInputClass} pl-9`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  load(query);
                }
              }}
              placeholder="Search designation…"
              autoComplete="off"
            />
            {open && matches.length > 0 ? (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-900">
                {matches.map((entry) => (
                  <li key={`${entry.manufacturer}-${entry.designation}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
                      onClick={() => load(entry.designation)}
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {entry.designation}
                      </span>
                      <span className="text-xs text-slate-500">
                        {entry.manufacturer} · C {(entry.dynamicRatingN / 1000).toFixed(1)} kN
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => load(query)}
            className="shrink-0 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
}
