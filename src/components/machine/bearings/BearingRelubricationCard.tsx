"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Grease / oil relubrication interval. */
export default function BearingRelubricationCard({ result }: Props) {
  const r = result.relubrication;
  if (!r) return null;

  const statusColor =
    r.status === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : r.status === "frequent"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-200">
          Relubrication interval
        </p>
        <span className={`text-xs font-bold uppercase ${statusColor}`}>{r.status}</span>
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
        {r.intervalHours > 0 ? `${formatDisplayNumber(r.intervalHours)} h` : "—"}
      </p>
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
