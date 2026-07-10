"use client";

import type { BearingMountingRole } from "@/data/catalogs/bearingCatalog";
import { BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import type { BearingType } from "@/lib/machine/bearings/types";

export type BearingMountingSystemId =
  | "single"
  | "locating_dg_floating_nu"
  | "locating_ac_floating_nu"
  | "duplex_angular";

const SYSTEMS: {
  id: BearingMountingSystemId;
  label: string;
  description: string;
  locating?: { type: BearingType; role: BearingMountingRole };
  floating?: { type: BearingType; role: BearingMountingRole };
}[] = [
  {
    id: "single",
    label: "Single bearing",
    description: "One bearing carries combined loads (screening).",
  },
  {
    id: "locating_dg_floating_nu",
    label: "Locating + floating (DG + NU)",
    description: "Deep groove locates shaft axially; NU cylindrical roller floats (MITCalc classic).",
    locating: { type: "deep_groove", role: "locating" },
    floating: { type: "cylindrical_roller", role: "non_locating" },
  },
  {
    id: "locating_ac_floating_nu",
    label: "Locating + floating (AC + NU)",
    description: "Angular contact pair or single AC locates; NU roller accommodates thermal expansion.",
    locating: { type: "angular_contact", role: "locating" },
    floating: { type: "cylindrical_roller", role: "non_locating" },
  },
  {
    id: "duplex_angular",
    label: "Duplex angular contact",
    description: "Use O / X / T arrangement in Operating step for ball screws and precision spindles.",
    locating: { type: "angular_contact", role: "locating" },
  },
];

type Props = {
  value: BearingMountingSystemId;
  onChange: (id: BearingMountingSystemId) => void;
  onSuggestType?: (type: BearingType) => void;
};

export default function BearingMountingSystem({ value, onChange, onSuggestType }: Props) {
  const active = SYSTEMS.find((s) => s.id === value) ?? SYSTEMS[0]!;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SYSTEMS.map((system) => {
          const selected = system.id === value;
          return (
            <button
              key={system.id}
              type="button"
              onClick={() => {
                onChange(system.id);
                if (system.locating && onSuggestType) onSuggestType(system.locating.type);
              }}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-cyan-500/80 bg-cyan-50/80 ring-2 ring-cyan-500/20 dark:border-cyan-600/60 dark:bg-cyan-950/30"
                  : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-900/50"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{system.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {system.description}
              </p>
            </button>
          );
        })}
      </div>

      {active.locating && active.floating ? (
        <div className="rounded-xl border border-violet-200/80 bg-violet-50/50 p-3 text-xs dark:border-violet-900/40 dark:bg-violet-950/20">
          <p className="font-semibold text-violet-900 dark:text-violet-100">Suggested two-bearing layout</p>
          <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
            <li>
              <span className="font-medium">Locating:</span> {BEARING_TYPE_LABELS[active.locating.type]} (
              {active.locating.role})
            </li>
            <li>
              <span className="font-medium">Floating:</span> {BEARING_TYPE_LABELS[active.floating.type]} (
              {active.floating.role})
            </li>
          </ul>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Size each station separately; floating NU carries radial load only and allows axial displacement.
          </p>
        </div>
      ) : active.id === "duplex_angular" ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set duplex arrangement (O / X / T) under Operating → Mounting arrangement.
        </p>
      ) : null}
    </div>
  );
}

export { SYSTEMS as BEARING_MOUNTING_SYSTEMS };
