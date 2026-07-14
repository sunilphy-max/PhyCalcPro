"use client";

import { useId } from "react";
import type { PlainBearingType } from "@/lib/machine/plain-bearings/types";

const TYPE_LABELS: Record<PlainBearingType, string> = {
  journal: "Journal bearing",
  thrust_pad: "Thrust pad bearing",
  tilting_pad: "Tilting-pad thrust bearing",
};

type Props = {
  type: PlainBearingType;
  width?: number;
  height?: number;
  className?: string;
};

/** Indicative plain-bearing cross-section (ISO 7902 / 12130 / 12131 style). */
export default function PlainBearingCrossSectionSvg({
  type,
  width = 140,
  height = 100,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const arrowId = `pb-arrow-${uid}`;
  const oilId = `pb-oil-${uid}`;
  const w = 140;
  const h = 100;
  const cx = w / 2;
  const cy = h / 2;

  const renderBody = () => {
    switch (type) {
      case "thrust_pad":
        return (
          <>
            <rect x={18} y={28} width={104} height={10} fill="#475569" rx={2} />
            <rect x={18} y={62} width={104} height={10} fill="#475569" rx={2} />
            {[30, 48, 66, 84, 102].map((x) => (
              <rect
                key={x}
                x={x - 6}
                y={cy - 10}
                width={12}
                height={20}
                rx={2}
                fill={`url(#${oilId})`}
                stroke="#0f766e"
                strokeWidth={1.2}
              />
            ))}
            <path
              d="M70 8 L70 24 M64 8 L76 8"
              stroke="#dc2626"
              strokeWidth={2.5}
              markerEnd={`url(#${arrowId})`}
            />
            <text x={78} y={18} fontSize={10} fontWeight="600" fill="#dc2626">
              Fa
            </text>
          </>
        );
      case "tilting_pad":
        return (
          <>
            <rect x={20} y={26} width={100} height={8} fill="#475569" rx={2} />
            <rect x={20} y={66} width={100} height={8} fill="#475569" rx={2} />
            {[32, 54, 76, 98].map((x, i) => {
              const tilt = i % 2 === 0 ? -8 : 8;
              return (
                <g key={x} transform={`rotate(${tilt} ${x} ${cy})`}>
                  <path
                    d={`M${x - 10} ${cy + 8} L${x - 8} ${cy - 10} L${x + 8} ${cy - 10} L${x + 10} ${cy + 8} Z`}
                    fill={`url(#${oilId})`}
                    stroke="#0f766e"
                    strokeWidth={1.2}
                  />
                  <circle cx={x} cy={cy + 6} r={2.5} fill="#334155" />
                </g>
              );
            })}
            <path
              d="M70 8 L70 22 M64 8 L76 8"
              stroke="#dc2626"
              strokeWidth={2.5}
              markerEnd={`url(#${arrowId})`}
            />
            <text x={78} y={18} fontSize={10} fontWeight="600" fill="#dc2626">
              Fa
            </text>
          </>
        );
      default:
        return (
          <>
            <circle cx={cx} cy={cy} r={38} fill="#cbd5e1" stroke="#475569" strokeWidth={2.5} />
            <circle cx={cx} cy={cy} r={28} fill={`url(#${oilId})`} stroke="#0f766e" strokeWidth={1.5} />
            <circle cx={cx + 4} cy={cy + 2} r={18} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={cx} y1={6} x2={cx} y2={28} stroke="#1e293b" strokeWidth={4} />
            <path
              d="M118 50 L132 50"
              stroke="#dc2626"
              strokeWidth={2}
              strokeDasharray="4 3"
              markerEnd={`url(#${arrowId})`}
            />
            <text x={118} y={44} fontSize={10} fontWeight="600" fill="#dc2626">
              Fr
            </text>
            <text x={cx - 6} y={cy + 4} fontSize={9} fontWeight="600" fill="#0f766e">
              oil
            </text>
          </>
        );
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-label={`${TYPE_LABELS[type]} cross-section`}
      role="img"
    >
      <defs>
        <linearGradient id={oilId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <marker id={arrowId} markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
        </marker>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill="#f8fafc" rx={8} className="dark:fill-slate-900" />
      {renderBody()}
    </svg>
  );
}
