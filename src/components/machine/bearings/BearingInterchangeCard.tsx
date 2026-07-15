"use client";

import { useMemo } from "react";
import { buildInterchangeCandidates } from "@/lib/machine/bearings/interchangeTable";
import { findBearing, BEARING_MANUFACTURER_LABELS } from "@/data/catalogs/bearingCatalog";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  designation: string;
  onSelectDesignation?: (designation: string) => void;
};

export default function BearingInterchangeCard({ designation, onSelectDesignation }: Props) {
  const source = findBearing(designation);
  const candidates = useMemo(
    () => (source ? buildInterchangeCandidates(source, { limit: 8 }) : []),
    [source]
  );

  if (!source || candidates.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Cross-OEM interchange ({source.designation})
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Same bore and type within ±25% dynamic capacity — screening only.
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700/60">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-2.5 py-2 font-semibold">Designation</th>
              <th className="px-2.5 py-2 font-semibold">OEM</th>
              <th className="px-2.5 py-2 font-semibold">ΔC%</th>
              <th className="px-2.5 py-2 font-semibold">ΔC₀%</th>
              <th className="px-2.5 py-2 font-semibold">Notes</th>
              {onSelectDesignation ? <th className="px-2.5 py-2 font-semibold">Apply</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidates.map((row) => (
              <tr key={row.entry.designation}>
                <td className="px-2.5 py-2 font-medium text-slate-900 dark:text-white">
                  {row.entry.designation}
                </td>
                <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300">
                  {BEARING_MANUFACTURER_LABELS[row.entry.manufacturer]}
                </td>
                <td className="px-2.5 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                  {formatDisplayNumber(row.deltaCPercent, { digits: 1 })}
                </td>
                <td className="px-2.5 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                  {formatDisplayNumber(row.deltaC0Percent, { digits: 1 })}
                </td>
                <td className="max-w-[12rem] px-2.5 py-2 text-slate-500 dark:text-slate-400">
                  {row.notes.length > 0 ? row.notes.join(" · ") : "—"}
                </td>
                {onSelectDesignation ? (
                  <td className="px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => onSelectDesignation(row.entry.designation)}
                      className="rounded-md bg-cyan-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-cyan-500"
                    >
                      Apply
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
