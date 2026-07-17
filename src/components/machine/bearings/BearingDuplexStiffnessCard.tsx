"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** First-class duplex arrangement analysis: preload · Ka/Kr/Km · δa · thermal · O/X/T compare. */
export default function BearingDuplexStiffnessCard({ result }: Props) {
  const a = result.arrangementAnalysis ?? null;
  const d = result.duplexStiffness;
  if (!a && !d) return null;

  const label = a?.arrangementLabel ?? d!.arrangementLabel;
  const preloadForceN = a?.preloadForceN ?? d!.preloadForceN;
  const preloadClass = a?.preloadClass ?? d!.preloadClass;
  const ka = a?.axialStiffnessNPerUm ?? d!.axialStiffnessNPerUm;
  const kr = a?.radialStiffnessNPerUm ?? d!.radialStiffnessNPerUm;
  const km = a?.momentStiffnessNmPerMrad ?? d!.momentStiffnessNmPerMrad;
  const deltaUm = a?.axialDisplacementUm ?? d?.axialDisplacementUm;
  const deltaStatus = a?.axialDisplacementStatus ?? d?.axialDisplacementStatus;
  const thermalGrowthUm = a?.thermalGrowthUm ?? d?.thermalGrowthUm ?? null;
  const thermalPreloadChangeN =
    a?.thermalPreloadChangeN ?? d?.thermalPreloadChangeN ?? null;
  const rigidity = a?.rigidityComparison ?? d?.rigidityComparison ?? [];
  const comparisonNote = a?.comparisonNote ?? d!.comparisonNote;
  const note = a?.note ?? comparisonNote;
  const status = a?.status ?? (deltaStatus === "critical" ? "critical" : deltaStatus === "warning" ? "warning" : "ok");

  const statusColor =
    status === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "warning"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/40 p-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
          Arrangement analysis · {label}
        </p>
        <span className={`text-xs font-bold uppercase ${statusColor}`}>{status}</span>
      </div>

      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Preload · stiffness · axial displacement · thermal · rigidity comparison (screening).
      </p>

      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <dt className="text-slate-400">Preload</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(preloadForceN / 1000)} kN
            <span className="ml-1 font-normal text-slate-400">({preloadClass})</span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Axial Ka</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(ka)} N/µm</dd>
        </div>
        <div>
          <dt className="text-slate-400">Radial Kr</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(kr)} N/µm</dd>
        </div>
        <div>
          <dt className="text-slate-400">Moment Km</dt>
          <dd className="font-semibold tabular-nums">{formatDisplayNumber(km)} N·m/mrad</dd>
        </div>
        {deltaUm != null ? (
          <div>
            <dt className="text-slate-400">δa (Fa/Ka)</dt>
            <dd className="font-semibold tabular-nums">
              {formatDisplayNumber(deltaUm)} µm
              {deltaStatus && deltaStatus !== "ok" ? (
                <span className="ml-1 font-normal text-amber-600">({deltaStatus})</span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {thermalGrowthUm != null ? (
          <div>
            <dt className="text-slate-400">Thermal ΔL</dt>
            <dd className="font-semibold tabular-nums">
              {formatDisplayNumber(thermalGrowthUm)} µm
              {thermalPreloadChangeN != null ? (
                <span className="ml-1 font-normal text-slate-400">
                  → {formatDisplayNumber(thermalPreloadChangeN / 1000)} kN
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>

      {rigidity.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rigidity comparison (O / X / T)
          </p>
          <table className="w-full min-w-[28rem] border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-cyan-200/60 text-left text-slate-500 dark:border-cyan-900/40">
                <th className="py-1 pr-2 font-medium">Arrangement</th>
                <th className="py-1 pr-2 font-medium">Ka N/µm</th>
                <th className="py-1 pr-2 font-medium">Km N·m/mrad</th>
                <th className="py-1 pr-2 font-medium">δa µm</th>
                <th className="py-1 font-medium">Km vs O</th>
              </tr>
            </thead>
            <tbody>
              {rigidity.map((row) => (
                <tr
                  key={row.arrangement}
                  className={
                    row.isSelected
                      ? "bg-cyan-100/70 font-semibold text-cyan-950 dark:bg-cyan-900/30 dark:text-cyan-100"
                      : "text-slate-700 dark:text-slate-300"
                  }
                >
                  <td className="py-1 pr-2">
                    {row.arrangementLabel}
                    {row.isSelected ? (
                      <span className="ml-1 text-[10px] font-normal text-cyan-600 dark:text-cyan-400">
                        selected
                      </span>
                    ) : null}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {formatDisplayNumber(row.axialStiffnessNPerUm)}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {formatDisplayNumber(row.momentStiffnessNmPerMrad)}
                  </td>
                  <td className="py-1 pr-2 tabular-nums">
                    {formatDisplayNumber(row.axialDisplacementUm)}
                  </td>
                  <td className="py-1 tabular-nums">
                    {formatDisplayNumber(100 * row.momentStiffnessRatioVsO)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{note}</p>
    </div>
  );
}
