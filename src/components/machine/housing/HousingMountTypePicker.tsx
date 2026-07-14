"use client";

import type { HousingMountStyle } from "@/lib/machine/housing/types";
import HousingCrossSectionSvg from "@/components/machine/housing/HousingCrossSectionSvg";

type Card = {
  id: HousingMountStyle;
  label: string;
  description: string;
};

const CARDS: Card[] = [
  {
    id: "pillow_block",
    label: "Pillow block",
    description: "Two-bolt base — SNL / UCP style screening",
  },
  {
    id: "flange",
    label: "Flange",
    description: "Face-mounted — FY / square flange style",
  },
  {
    id: "foot",
    label: "Foot mount",
    description: "Integral feet — SAF / heavy base style",
  },
];

type Props = {
  value: HousingMountStyle;
  onChange: (style: HousingMountStyle) => void;
  compact?: boolean;
};

export default function HousingMountTypePicker({ value, onChange, compact = false }: Props) {
  return (
    <div
      className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}
    >
      {CARDS.map((card) => {
        const active = card.id === value;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onChange(card.id)}
            className={`flex flex-col overflow-hidden rounded-xl border text-left transition ${
              active
                ? "border-cyan-500/80 bg-cyan-50/90 shadow-sm ring-2 ring-cyan-500/20 dark:border-cyan-600/60 dark:bg-cyan-950/30"
                : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-2 dark:from-slate-900 dark:to-slate-950">
              <HousingCrossSectionSvg
                mountStyle={card.id}
                width={compact ? 120 : 130}
                height={compact ? 86 : 92}
              />
            </div>
            <div className="border-t border-slate-200/70 px-2.5 py-2 dark:border-slate-700/60">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                {card.label}
              </p>
              {!compact ? (
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
