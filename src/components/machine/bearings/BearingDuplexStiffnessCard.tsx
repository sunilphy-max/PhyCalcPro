"use client";

import type { BearingResult } from "@/lib/machine/bearings/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: BearingResult;
};

/** Duplex preload + stiffness (O / X / T). */
export default function BearingDuplexStiffnessCard({ result }: Props) {
  const d = result.duplexStiffness;
  if (!d) return null;

  return (
    <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/40 p-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
        Duplex stiffness · {d.arrangementLabel}
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-slate-400">Preload</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(d.preloadForceN / 1000)} kN
            <span className="ml-1 font-normal text-slate-400">({d.preloadClass})</span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Axial Ka</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(d.axialStiffnessNPerUm)} N/µm
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Radial Kr</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(d.radialStiffnessNPerUm)} N/µm
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Moment Km</dt>
          <dd className="font-semibold tabular-nums">
            {formatDisplayNumber(d.momentStiffnessNmPerMrad)} N·m/mrad
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
        {d.comparisonNote}
      </p>
    </div>
  );
}
