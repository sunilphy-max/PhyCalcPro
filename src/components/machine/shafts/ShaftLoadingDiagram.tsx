"use client";

import { useState } from "react";
import type {
  BearingSupport,
  BearingReaction,
  LoadCase,
  ShaftLoadKind,
} from "@/lib/machine/shafts/types";
import { inferShaftLoadKind, shaftLoadKindLabel } from "@/lib/machine/shafts/loadKind";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";
import { SHAFT_LOAD_DRAG_MIME } from "@/components/machine/shafts/ShaftLoadLibrary";

type Props = {
  length: number;
  diameter: number;
  loads: LoadCase[];
  supports?: BearingSupport[];
  /** Optional FEM reactions for reaction arrows */
  reactions?: BearingReaction[];
  /** Optional bending envelope under the shaft */
  bendingX?: number[];
  bendingMoment?: number[];
  lengthUnit?: string;
  /** Compact mode for input panel */
  compact?: boolean;
  /** Drop a load-library tile onto the shaft at position x (display units) */
  onDropLoad?: (kind: ShaftLoadKind, x: number) => void;
};

const KIND_COLOR: Record<ShaftLoadKind, string> = {
  gear: "#0f766e",
  pulley: "#b45309",
  torque: "#7c3aed",
  bending: "#dc2626",
  force: "#2563eb",
};

function StationIcon({
  kind,
  x,
  cy,
  shaftH,
}: {
  kind: ShaftLoadKind;
  x: number;
  cy: number;
  shaftH: number;
}) {
  const top = cy - shaftH / 2 - 28;
  const color = KIND_COLOR[kind];

  if (kind === "gear") {
    return (
      <g>
        <circle cx={x} cy={top} r={11} fill="none" stroke={color} strokeWidth={1.8} />
        {[0, 45, 90, 135].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={x + Math.cos(a) * 7}
              y1={top + Math.sin(a) * 7}
              x2={x + Math.cos(a) * 13}
              y2={top + Math.sin(a) * 13}
              stroke={color}
              strokeWidth={1.6}
            />
          );
        })}
        <line x1={x} y1={top + 11} x2={x} y2={cy - shaftH / 2} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }

  if (kind === "pulley") {
    return (
      <g>
        <ellipse cx={x} cy={top} rx={12} ry={8} fill="none" stroke={color} strokeWidth={1.8} />
        <ellipse cx={x} cy={top} rx={6} ry={4} fill="none" stroke={color} strokeWidth={1.2} />
        <line x1={x} y1={top + 8} x2={x} y2={cy - shaftH / 2} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }

  if (kind === "torque") {
    return (
      <g>
        <path
          d={`M ${x - 12} ${cy} a 12 12 0 1 1 8 10`}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
        />
        <polygon
          points={`${x + 8},${cy + 8} ${x + 14},${cy + 4} ${x + 6},${cy + 2}`}
          fill={color}
        />
      </g>
    );
  }

  // bending / force — downward arrow
  return (
    <g>
      <line x1={x} y1={top - 4} x2={x} y2={cy - shaftH / 2 - 2} stroke={color} strokeWidth={2} />
      <polygon
        points={`${x - 5},${cy - shaftH / 2 - 10} ${x + 5},${cy - shaftH / 2 - 10} ${x},${cy - shaftH / 2 - 1}`}
        fill={color}
      />
    </g>
  );
}

export default function ShaftLoadingDiagram({
  length,
  diameter,
  loads,
  supports,
  reactions,
  bendingX,
  bendingMoment,
  lengthUnit = "m",
  compact = false,
  onDropLoad,
}: Props) {
  const width = 640;
  const hasReactions = (reactions?.length ?? 0) > 0;
  const height = compact ? (hasReactions ? 200 : 168) : hasReactions ? 236 : 200;
  const pad = 48;
  const cy = compact ? 68 : 72;
  const drawW = width - 2 * pad;
  const shaftH = Math.max(10, Math.min(36, (diameter / Math.max(length, 1e-9)) * drawW * 0.35));
  const scaleX = (x: number) => pad + (x / Math.max(length, 1e-9)) * drawW;
  const [dropHover, setDropHover] = useState(false);

  const clientXToShaftX = (svg: SVGSVGElement, clientX: number) => {
    const rect = svg.getBoundingClientRect();
    const raw = ((clientX - rect.left) / Math.max(rect.width, 1e-9)) * length;
    return Math.max(0, Math.min(length, raw));
  };

  const displaySupports: BearingSupport[] =
    supports && supports.length > 0
      ? supports
      : [
          { position: 0, type: "fixed" },
          { position: length, type: "pin" },
        ];

  const maxMoment = Math.max(...(bendingMoment ?? [0]), 1e-12);
  const momentBaseline = cy + shaftH / 2 + 18;
  const momentAmp = compact ? 28 : 36;

  const reactionByPos = (pos: number) =>
    reactions?.find((r) => Math.abs(r.position - pos) < Math.max(length * 0.02, 1e-6));

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        dropHover ? "border-teal-400 ring-1 ring-teal-300" : "border-slate-200"
      }`}
      data-export-diagram="true"
      data-export-caption={`Shaft loading — L = ${length} ${lengthUnit}`}
    >
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">Loading diagram</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wide text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-slate-600" /> Bearing
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: KIND_COLOR.gear }} /> Gear
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: KIND_COLOR.pulley }} /> Pulley
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: KIND_COLOR.torque }} /> Torque
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-sky-600" /> Reaction
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-rose-500/70" /> Bending
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Shaft loading diagram with bearings, loads, reactions, and bending"
        onDragOver={
          onDropLoad
            ? (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDropHover(true);
              }
            : undefined
        }
        onDragLeave={onDropLoad ? () => setDropHover(false) : undefined}
        onDrop={
          onDropLoad
            ? (e) => {
                e.preventDefault();
                setDropHover(false);
                const kind = e.dataTransfer.getData(SHAFT_LOAD_DRAG_MIME) as ShaftLoadKind;
                if (!kind) return;
                const svg = e.currentTarget;
                onDropLoad(kind, clientXToShaftX(svg, e.clientX));
              }
            : undefined
        }
      >
        {/* Bending envelope (behind shaft) */}
        {bendingX &&
          bendingMoment &&
          bendingX.length > 1 &&
          bendingMoment.length === bendingX.length && (
            <path
              d={
                `M ${scaleX(bendingX[0]!)} ${momentBaseline} ` +
                bendingX
                  .map((xi, i) => {
                    const m = Math.abs(bendingMoment[i] ?? 0);
                    const y = momentBaseline + (m / maxMoment) * momentAmp;
                    return `L ${scaleX(xi)} ${y}`;
                  })
                  .join(" ") +
                ` L ${scaleX(bendingX[bendingX.length - 1]!)} ${momentBaseline} Z`
              }
              fill="rgba(244,63,94,0.18)"
              stroke="#e11d48"
              strokeWidth={1.2}
            />
          )}

        {/* Shaft body */}
        <rect
          x={pad}
          y={cy - shaftH / 2}
          width={drawW}
          height={shaftH}
          rx={3}
          fill="rgba(29,78,216,0.08)"
          stroke="#1d4ed8"
          strokeWidth={1.5}
        />
        <line
          x1={pad - 10}
          y1={cy}
          x2={pad + drawW + 10}
          y2={cy}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="8 4 2 4"
        />

        {/* Bearings + reactions */}
        {displaySupports.map((s, i) => {
          const x = scaleX(s.position);
          const rxn = reactionByPos(s.position);
          const fr = rxn ? Math.hypot(rxn.forceY, rxn.forceZ) : 0;
          return (
            <g key={`support-${i}`}>
              <rect
                x={x - 8}
                y={cy - shaftH / 2 - 12}
                width={16}
                height={9}
                fill="#334155"
                rx={1.5}
              />
              <rect
                x={x - 8}
                y={cy + shaftH / 2 + 3}
                width={16}
                height={9}
                fill="#334155"
                rx={1.5}
              />
              {s.type === "fixed" ? (
                <rect x={x - 10} y={cy + shaftH / 2 + 12} width={20} height={5} fill="#64748b" />
              ) : (
                <polygon
                  points={`${x - 9},${cy + shaftH / 2 + 14} ${x + 9},${cy + shaftH / 2 + 14} ${x},${cy + shaftH / 2 + 24}`}
                  fill="#94a3b8"
                />
              )}
              <text
                x={x}
                y={cy + shaftH / 2 + (s.type === "fixed" ? 28 : 36)}
                textAnchor="middle"
                className="fill-slate-600"
                fontSize={9}
              >
                Bearing
              </text>
              {fr > 0 && (
                <g>
                  {/* Reaction arrow upward into the seat */}
                  <line
                    x1={x}
                    y1={cy + shaftH / 2 + 56}
                    x2={x}
                    y2={cy + shaftH / 2 + 28}
                    stroke="#0284c7"
                    strokeWidth={2}
                  />
                  <polygon
                    points={`${x - 5},${cy + shaftH / 2 + 36} ${x + 5},${cy + shaftH / 2 + 36} ${x},${cy + shaftH / 2 + 26}`}
                    fill="#0284c7"
                  />
                  <text
                    x={x}
                    y={cy + shaftH / 2 + 70}
                    textAnchor="middle"
                    className="fill-sky-700"
                    fontSize={9}
                  >
                    R={formatDisplayNumber(fr)} N
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Load stations */}
        {loads.map((load, idx) => {
          const kind = inferShaftLoadKind(load);
          const x = scaleX(load.position);
          const label = shaftLoadKindLabel(kind);
          const parts: string[] = [];
          if (load.torque) parts.push(`T`);
          if (load.bendingMoment) parts.push(`M`);
          if (load.transverseForce) parts.push(`F`);
          if (load.axialForce) parts.push(`Fa`);
          return (
            <g key={`load-${idx}`}>
              <StationIcon kind={kind} x={x} cy={cy} shaftH={shaftH} />
              <text
                x={x}
                y={cy - shaftH / 2 - 42}
                textAnchor="middle"
                className="fill-slate-800"
                fontSize={10}
                fontWeight={600}
              >
                {label}
                {parts.length ? ` (${parts.join("+")})` : ""}
              </text>
            </g>
          );
        })}

        {/* Length dimension */}
        <line
          x1={pad}
          y1={height - 12}
          x2={pad + drawW}
          y2={height - 12}
          stroke="#64748b"
          strokeWidth={1}
        />
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          className="fill-slate-600"
          fontSize={11}
        >
          L = {length} {lengthUnit}
        </text>
      </svg>
    </div>
  );
}
