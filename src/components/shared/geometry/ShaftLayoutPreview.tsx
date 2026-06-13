"use client";

import type { LoadCase } from "@/lib/machine/shafts/types";

/**
 * Shaft layout schematic: shaft body between two bearing supports with
 * load positions (torque / bending moment / axial force) marked. Pure SVG.
 */
type Props = {
  /** Shaft length in display units */
  length: number;
  /** Shaft diameter in the same units (for proportion only) */
  diameter: number;
  loads: LoadCase[];
  lengthUnit?: string;
};

export default function ShaftLayoutPreview({ length, diameter, loads, lengthUnit = "m" }: Props) {
  const width = 600;
  const height = 170;
  const pad = 50;
  const cy = height / 2;

  const drawW = width - 2 * pad;
  const shaftH = Math.max(10, Math.min(34, (diameter / Math.max(length, 1e-9)) * drawW));
  const scaleX = (x: number) => pad + (x / Math.max(length, 1e-9)) * drawW;

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-export-diagram="true"
      data-export-caption={`Shaft layout — L = ${length} ${lengthUnit}, ${loads.length} load case(s)`}
    >
      <div className="mb-2 text-sm font-semibold text-slate-900">Shaft layout</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Shaft layout schematic">
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
        {/* Centerline */}
        <line x1={pad - 12} y1={cy} x2={pad + drawW + 12} y2={cy} stroke="#94a3b8" strokeWidth={1} strokeDasharray="8 4 2 4" />
        {/* Bearings at both ends */}
        {[pad, pad + drawW].map((x) => (
          <g key={x}>
            <rect x={x - 7} y={cy - shaftH / 2 - 11} width={14} height={8} fill="#475569" rx={1.5} />
            <rect x={x - 7} y={cy + shaftH / 2 + 3} width={14} height={8} fill="#475569" rx={1.5} />
            <polygon
              points={`${x - 9},${cy + shaftH / 2 + 13} ${x + 9},${cy + shaftH / 2 + 13} ${x},${cy + shaftH / 2 + 22}`}
              fill="#94a3b8"
            />
          </g>
        ))}
        {/* Loads */}
        {loads.map((load, idx) => {
          const x = scaleX(load.position);
          const parts: string[] = [];
          if (load.torque) parts.push(`T = ${load.torque}`);
          if (load.bendingMoment) parts.push(`M = ${load.bendingMoment}`);
          if (load.axialForce) parts.push(`Fa = ${load.axialForce}`);
          return (
            <g key={idx}>
              <line x1={x} y1={cy - shaftH / 2 - 26} x2={x} y2={cy - shaftH / 2 - 2} stroke="#dc2626" strokeWidth={2} />
              <polygon
                points={`${x - 4},${cy - shaftH / 2 - 8} ${x + 4},${cy - shaftH / 2 - 8} ${x},${cy - shaftH / 2 - 1}`}
                fill="#dc2626"
              />
              {load.torque ? (
                <path
                  d={`M ${x - 13} ${cy} a 13 13 0 1 1 6 11`}
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth={1.8}
                />
              ) : null}
              <text x={x} y={cy - shaftH / 2 - 32} textAnchor="middle" className="fill-slate-700" fontSize={10}>
                {parts.join(", ") || `Load ${idx + 1}`}
              </text>
            </g>
          );
        })}
        {/* Length dimension */}
        <line x1={pad} y1={height - 14} x2={pad + drawW} y2={height - 14} stroke="#64748b" strokeWidth={1} />
        <text x={width / 2} y={height - 3} textAnchor="middle" className="fill-slate-600" fontSize={11}>
          L = {length} {lengthUnit}
        </text>
      </svg>
    </div>
  );
}
