"use client";

import type { ReactNode } from "react";
import type { ShaftLoadKind } from "@/lib/machine/shafts/types";
import { SHAFT_LOAD_KINDS, shaftLoadKindLabel } from "@/lib/machine/shafts/loadKind";

export const SHAFT_LOAD_DRAG_MIME = "application/x-phycalc-shaft-load";

type Tile = {
  id: ShaftLoadKind;
  label: string;
  hint: string;
  icon: ReactNode;
};

type Props = {
  onAdd: (kind: ShaftLoadKind) => void;
  className?: string;
};

function GearIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <circle cx="16" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {[0, 45, 90, 135].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={16 + Math.cos(a) * 5}
            y1={14 + Math.sin(a) * 5}
            x2={16 + Math.cos(a) * 10}
            y2={14 + Math.sin(a) * 10}
            stroke="currentColor"
            strokeWidth="1.6"
          />
        );
      })}
      <line x1="16" y1="21" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PulleyIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <ellipse cx="16" cy="14" rx="10" ry="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="16" cy="14" rx="4" ry="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="21" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TorqueIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <path d="M10 14 a8 8 0 1 1 8 8" fill="none" stroke="currentColor" strokeWidth="2" />
      <polygon points="18,22 14,18 22,17" fill="currentColor" />
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BendingIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <path
        d="M4 22 Q16 6 28 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line x1="16" y1="4" x2="16" y2="14" stroke="currentColor" strokeWidth="2" />
      <polygon points="16,16 12,10 20,10" fill="currentColor" />
    </svg>
  );
}

function ForceIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <line x1="16" y1="4" x2="16" y2="22" stroke="currentColor" strokeWidth="2" />
      <polygon points="16,26 12,18 20,18" fill="currentColor" />
      <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const ICONS: Record<ShaftLoadKind, ReactNode> = {
  gear: <GearIcon />,
  pulley: <PulleyIcon />,
  torque: <TorqueIcon />,
  bending: <BendingIcon />,
  force: <ForceIcon />,
};

const HINTS: Record<ShaftLoadKind, string> = {
  gear: "Torque + radial mesh force",
  pulley: "Belt / chain pull",
  torque: "Applied torsion only",
  bending: "Applied couple",
  force: "Transverse force",
};

export default function ShaftLoadLibrary({ onAdd, className = "" }: Props) {
  const tiles: Tile[] = SHAFT_LOAD_KINDS.map((id) => ({
    id,
    label: shaftLoadKindLabel(id),
    hint: HINTS[id],
    icon: ICONS[id],
  }));

  return (
    <div className={className}>
      <p className="mb-2 text-xs text-slate-500">
        Click to place at midspan, or drag a tile onto the loading diagram.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(SHAFT_LOAD_DRAG_MIME, tile.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(tile.id)}
            className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-left text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="text-slate-700">{tile.icon}</span>
            <span className="text-xs font-semibold leading-tight">{tile.label}</span>
            <span className="text-[10px] leading-snug text-slate-500">{tile.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
