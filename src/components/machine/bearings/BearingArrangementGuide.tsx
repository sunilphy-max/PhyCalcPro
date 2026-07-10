"use client";

import type { BearingArrangement } from "@/lib/machine/bearings/types";
import BearingReferenceVisual from "@/components/machine/bearings/BearingReferenceVisual";

const ARRANGEMENTS: {
  id: BearingArrangement;
  label: string;
  short: string;
  description: string;
}[] = [
  {
    id: "back_to_back",
    label: "Back-to-back (O)",
    short: "O",
    description: "Stiff moment support; resists shaft tilt. Common on ball screws and machine tool spindles.",
  },
  {
    id: "face_to_face",
    label: "Face-to-face (X)",
    short: "X",
    description: "Accommodates misalignment; lower moment stiffness than O.",
  },
  {
    id: "tandem",
    label: "Tandem (T)",
    short: "T",
    description: "Shares axial load in one direction; use second pair or thrust bearing for reverse axial.",
  },
  {
    id: "single",
    label: "Single bearing",
    short: "—",
    description: "One angular contact or deep groove — combined load in one row.",
  },
];

type Props = {
  arrangement: BearingArrangement;
  onChange: (arrangement: BearingArrangement) => void;
  bearingType: import("@/lib/machine/bearings/types").BearingType;
};

export default function BearingArrangementGuide({ arrangement, onChange, bearingType }: Props) {
  const showDuplex =
    bearingType === "angular_contact" || bearingType === "tapered_roller";

  if (!showDuplex) return null;

  return (
    <div className="space-y-3 rounded-xl border border-cyan-200/70 bg-cyan-50/40 p-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Duplex arrangement (O / X / T)</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Required for paired angular contact or tapered roller sets in precision drives.
      </p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {ARRANGEMENTS.map((item) => {
          const active = arrangement === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                active
                  ? "border-cyan-600 bg-cyan-600 font-semibold text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <span className="text-sm font-bold">{item.short}</span>
              <span className="mt-0.5 block leading-snug opacity-90">{item.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {ARRANGEMENTS.find((a) => a.id === arrangement)?.description}
      </p>
      {arrangement !== "single" ? (
        <BearingReferenceVisual
          bearingType={bearingType}
          arrangement={arrangement}
          compact
        />
      ) : null}
    </div>
  );
}
