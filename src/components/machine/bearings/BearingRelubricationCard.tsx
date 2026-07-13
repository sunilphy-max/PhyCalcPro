"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Grease life L10h and/or relubrication interval tf. */
export default function BearingRelubricationCard({ result }: Props) {
  const r = result.relubrication;
  if (!r) return null;

  const statusColor =
    r.status === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : r.status === "frequent"
        ? "text-amber-600"
        : "text-red-600";

  const title =
    r.mode === "grease_life"
      ? "Grease life (sealed)"
      : r.mode === "oil_service"
        ? "Oil service interval"
        : "Relubrication / grease life";

  return (
    <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-200">
          {title}
        </p>
        <span className={`text-xs font-bold uppercase ${statusColor}`}>{r.status}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-slate-500">Governing interval</p>
          <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {r.intervalHours > 0 ? `${formatDisplayNumber(r.intervalHours)} h` : "—"}
          </p>
        </div>
        {r.greaseLifeHours != null ? (
          <div>
            <p className="text-[10px] text-slate-500">Grease life L₁₀h</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDisplayNumber(r.greaseLifeHours)} h
            </p>
          </div>
        ) : null}
        {r.relubricationIntervalHours != null ? (
          <div>
            <p className="text-[10px] text-slate-500">Relub interval tf</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDisplayNumber(r.relubricationIntervalHours)} h
            </p>
          </div>
        ) : null}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">n·dm</dt>
          <dd className="font-medium tabular-nums">{formatDisplayNumber(r.speedFactorNdm)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Temp factor</dt>
          <dd className="font-medium tabular-nums">{formatDisplayNumber(r.temperatureFactor)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Load factor</dt>
          <dd className="font-medium tabular-nums">{formatDisplayNumber(r.loadFactor)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Cleanliness</dt>
          <dd className="font-medium tabular-nums">{formatDisplayNumber(r.contaminationFactor)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{r.note}</p>
    </div>
  );
}
