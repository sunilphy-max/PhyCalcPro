"use client";

import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
  loadUnit: string;
};

/** Duplex / locating+floating station breakdown. */
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
          : stations.some((s) => s.role === "locating")
            ? "Locating + floating"
            : result.arrangement;

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/40 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
        Bearing pair analysis · {arrangementLabel}
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        System life uses Weibull combination of stations (ISO / SKF). First-failure (min) is also
        reported when available.
      </p>
      {result.weibullSystemLifeHours != null ? (
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-slate-400">Weibull L_sys</dt>
            <dd className="font-bold tabular-nums text-violet-800 dark:text-violet-200">
              {formatDisplayNumber(result.weibullSystemLifeHours)} h
            </dd>
          </div>
          {result.systemMinLifeHours != null ? (
            <div>
              <dt className="text-slate-400">Min station Lnm</dt>
              <dd className="font-semibold tabular-nums">
                {formatDisplayNumber(result.systemMinLifeHours)} h
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-slate-400">Governing</dt>
            <dd className="font-semibold">
              {stations.reduce((a, b) =>
                a.modifiedLifeHours <= b.modifiedLifeHours ? a : b
              ).label ?? "weakest station"}
            </dd>
          </div>
        </dl>
      ) : null}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {stations.map((station) => (
          <div
            key={station.index}
            className="rounded-lg border border-slate-200/80 bg-white/90 p-2.5 text-xs dark:border-slate-700/60 dark:bg-slate-950/50"
          >
            <p className="font-semibold text-slate-900 dark:text-white">
              {station.label ?? `Station ${station.index + 1}`}
              {station.designation ? (
                <span className="ml-1.5 font-bold text-cyan-700 dark:text-cyan-300">
                  {station.designation}
                </span>
              ) : null}
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
              {station.dynamicUtilization != null ? (
                <div>
                  <dt className="text-slate-400">P/C</dt>
                  <dd className="font-medium tabular-nums">
                    {formatDisplayNumber(station.dynamicUtilization)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
