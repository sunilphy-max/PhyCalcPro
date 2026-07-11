"use client";

import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
  loadUnit: string;
};

/** Duplex / paired station breakdown (O, X, T). */
export default function BearingPairedStationsCard({ result, loadUnit }: Props) {
  const stations = result.pairedStations;
  if (!stations?.length) return null;

  const arrangementLabel =
    result.arrangement === "back_to_back"
      ? "Back-to-back (O)"
      : result.arrangement === "face_to_face"
        ? "Face-to-face (X)"
        : result.arrangement === "tandem"
          ? "Tandem (T)"
          : result.pairedStations?.length === 2 && result.arrangement === "single"
            ? "Locating + floating"
            : result.arrangement;

  const stationLabel = (index: number) => {
    if (result.arrangement === "single" && result.pairedStations?.length === 2) {
      return index === 0 ? "Locating" : "Floating";
    }
    return `Station ${index + 1}`;
  };

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
        Paired stations · {arrangementLabel}
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        System life is governed by the weaker station (first failure).
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {stations.map((station) => (
          <div
            key={station.index}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-2.5 text-xs dark:border-slate-700/60 dark:bg-slate-950/50"
          >
            <p className="font-semibold text-slate-900 dark:text-white">
              {stationLabel(station.index)}
            </p>
            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div>
                <dt className="text-slate-400">Fr</dt>
                <dd className="font-medium tabular-nums">
                  {formatDisplayNumber(fromBase(station.radialLoad, "force", loadUnit))} {loadUnit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Fa</dt>
                <dd className="font-medium tabular-nums">
                  {formatDisplayNumber(fromBase(station.axialLoad, "force", loadUnit))} {loadUnit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">P</dt>
                <dd className="font-medium tabular-nums">
                  {formatDisplayNumber(fromBase(station.equivalentLoad, "force", loadUnit))}{" "}
                  {loadUnit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Lnm</dt>
                <dd className="font-medium tabular-nums">
                  {formatDisplayNumber(station.modifiedLifeHours)} h
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
