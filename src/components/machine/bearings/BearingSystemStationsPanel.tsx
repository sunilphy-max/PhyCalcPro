"use client";

import {
  mountingFromTopology,
  stationsFromMountingSystem,
  topologyFromMounting,
  type BearingMountingSystemId,
  type SystemTopologyPreset,
} from "@/lib/machine/bearings/bearingProject";
import type { BearingArrangement, BearingType } from "@/lib/machine/bearings/types";
import { calculatorFieldLabelClass, calculatorSelectClass } from "@/components/calculator/styles";

type Props = {
  mountingSystem: BearingMountingSystemId;
  onMountingSystemChange: (id: BearingMountingSystemId) => void;
  arrangement: BearingArrangement;
  onArrangementChange?: (a: BearingArrangement) => void;
  designation?: string;
  floatingDesignation?: string;
  bearingType?: BearingType;
  stationRadialLoadsN?: number[];
  stationSlopesMrad?: number[];
  onSwapStations?: () => void;
  hasShaftHandoff?: boolean;
};

export default function BearingSystemStationsPanel({
  mountingSystem,
  onMountingSystemChange,
  arrangement,
  onArrangementChange,
  designation,
  floatingDesignation,
  bearingType,
  stationRadialLoadsN,
  stationSlopesMrad,
  onSwapStations,
  hasShaftHandoff = false,
}: Props) {
  const topology = topologyFromMounting(mountingSystem);
  const stations = stationsFromMountingSystem(mountingSystem, arrangement, {
    designation,
    floatingDesignation,
    bearingType,
    stationRadialLoadsN,
    stationSlopesMrad,
  });

  const setTopology = (next: SystemTopologyPreset) => {
    const mounting = mountingFromTopology(next, mountingSystem);
    onMountingSystemChange(mounting);
    if (next === "duplex" && onArrangementChange && arrangement === "single") {
      onArrangementChange("back_to_back");
    }
    if (next === "single" && onArrangementChange && arrangement !== "single") {
      onArrangementChange("single");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">System stations</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Dynamic topology — start with one bearing or expand to locating/floating or duplex.
          </p>
        </div>
        {hasShaftHandoff ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            Shaft handoff
          </span>
        ) : null}
      </div>

      <label className={calculatorFieldLabelClass}>
        Topology
        <select
          className={`${calculatorSelectClass} mt-1`}
          value={topology}
          onChange={(e) => setTopology(e.target.value as SystemTopologyPreset)}
        >
          <option value="single">Single bearing</option>
          <option value="locating_floating">Locating + floating</option>
          <option value="duplex">Duplex pair (O / X / T)</option>
        </select>
      </label>

      {topology === "locating_floating" ? (
        <label className={calculatorFieldLabelClass}>
          Locating family
          <select
            className={`${calculatorSelectClass} mt-1`}
            value={mountingSystem}
            onChange={(e) => onMountingSystemChange(e.target.value as BearingMountingSystemId)}
          >
            <option value="locating_dg_floating_nu">Deep groove + NU float</option>
            <option value="locating_ac_floating_nu">Angular contact + NU float</option>
          </select>
        </label>
      ) : null}

      {topology === "duplex" && onArrangementChange ? (
        <label className={calculatorFieldLabelClass}>
          Duplex layout
          <select
            className={`${calculatorSelectClass} mt-1`}
            value={arrangement === "single" ? "back_to_back" : arrangement}
            onChange={(e) => onArrangementChange(e.target.value as BearingArrangement)}
          >
            <option value="back_to_back">Back-to-back (O)</option>
            <option value="face_to_face">Face-to-face (X)</option>
            <option value="tandem">Tandem (T)</option>
          </select>
        </label>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80">
              <th className="px-3 py-2 font-semibold">Station</th>
              <th className="px-3 py-2 font-semibold">Role</th>
              <th className="px-3 py-2 font-semibold">Designation</th>
              <th className="px-3 py-2 font-semibold">Fr</th>
              <th className="px-3 py-2 font-semibold">Slope</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((st) => (
              <tr
                key={st.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                  {st.label}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{st.role}</td>
                <td className="px-3 py-2 tabular-nums text-slate-700 dark:text-slate-200">
                  {st.designation || "—"}
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700 dark:text-slate-200">
                  {st.radialLoadN != null ? `${(st.radialLoadN / 1000).toFixed(2)} kN` : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700 dark:text-slate-200">
                  {st.slopeMrad != null ? `${st.slopeMrad.toFixed(2)} mrad` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {topology !== "single" && onSwapStations ? (
          <button
            type="button"
            onClick={onSwapStations}
            className="rounded-lg border border-violet-300/80 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-100"
          >
            Swap station roles
          </button>
        ) : null}
        {!hasShaftHandoff ? (
          <p className="text-[11px] text-slate-500">
            Optional: import reactions from Shaft Analysis for true station loads.
          </p>
        ) : null}
      </div>
    </div>
  );
}
