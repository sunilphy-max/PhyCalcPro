"use client";

import type { ReactNode } from "react";

export type BeamLoadLibraryType =
  | "point"
  | "udl"
  | "partial-udl"
  | "triangular"
  | "moment"
  | "self-weight";

export const BEAM_LOAD_DRAG_MIME = "application/x-phycalc-beam-load";

type Tile = {
  id: BeamLoadLibraryType;
  label: string;
  hint: string;
  icon: ReactNode;
  active?: boolean;
};

type Props = {
  includeSelfWeight: boolean;
  onAdd: (type: BeamLoadLibraryType) => void;
  className?: string;
};

function PointIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <line x1="16" y1="4" x2="16" y2="24" stroke="currentColor" strokeWidth="2" />
      <polygon points="16,26 12,18 20,18" fill="currentColor" />
    </svg>
  );
}

function UdlIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      {[8, 14, 20, 26].map((x) => (
        <g key={x}>
          <line x1={x} y1="6" x2={x} y2="22" stroke="currentColor" strokeWidth="1.5" />
          <polygon points={`${x},24 ${x - 3},18 ${x + 3},18`} fill="currentColor" />
        </g>
      ))}
      <line x1="6" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PartialUdlIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      {[12, 16, 20].map((x) => (
        <g key={x}>
          <line x1={x} y1="8" x2={x} y2="20" stroke="currentColor" strokeWidth="1.5" />
          <polygon points={`${x},22 ${x - 2.5},17 ${x + 2.5},17`} fill="currentColor" />
        </g>
      ))}
      <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <line x1="10" y1="26" x2="22" y2="26" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

function TriIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <polygon
        points="6,24 6,18 26,6 26,24"
        fill="currentColor"
        opacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MomentIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <path
        d="M10 12 a8 8 0 1 1 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon points="22,12 18,8 26,9" fill="currentColor" />
      <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SelfWeightIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <rect x="8" y="10" width="16" height="10" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" />
      <text x="16" y="18" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="700">
        ρg
      </text>
      <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function BeamLoadLibrary({
  includeSelfWeight,
  onAdd,
  className = "",
}: Props) {
  const tiles: Tile[] = [
    {
      id: "point",
      label: "Point load",
      hint: "Concentrated force",
      icon: <PointIcon />,
    },
    {
      id: "udl",
      label: "UDL",
      hint: "Full-span distributed",
      icon: <UdlIcon />,
    },
    {
      id: "partial-udl",
      label: "Partial UDL",
      hint: "Distributed on a segment",
      icon: <PartialUdlIcon />,
    },
    {
      id: "triangular",
      label: "Triangular",
      hint: "Linear variable load",
      icon: <TriIcon />,
    },
    {
      id: "moment",
      label: "Moment",
      hint: "Applied couple",
      icon: <MomentIcon />,
    },
    {
      id: "self-weight",
      label: "Self weight",
      hint: includeSelfWeight ? "Enabled" : "A · ρ · g as UDL",
      icon: <SelfWeightIcon />,
      active: includeSelfWeight,
    },
  ];

  return (
    <div className={className}>
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Click to add, or drag a tile onto the beam diagram.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            draggable={tile.id !== "self-weight"}
            onDragStart={(e) => {
              if (tile.id === "self-weight") return;
              e.dataTransfer.setData(BEAM_LOAD_DRAG_MIME, tile.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAdd(tile.id)}
            className={`flex flex-col items-start gap-1 rounded-xl border px-2.5 py-2.5 text-left transition ${
              tile.active
                ? "border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-400 dark:border-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-100"
                : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <span className="text-slate-700 dark:text-slate-200">{tile.icon}</span>
            <span className="text-xs font-semibold leading-tight">{tile.label}</span>
            <span className="text-[10px] leading-snug text-slate-500 dark:text-slate-400">
              {tile.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
