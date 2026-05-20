"use client";

import type { SupportType } from "@/lib/dynamics/vibrations/types";

type Props = {
  support: SupportType;
  x: number[];
};

const supportLabels: Record<SupportType, string> = {
  simply_supported: "Simply Supported",
  cantilever: "Cantilever",
  fixed_fixed: "Fixed-Fixed",
};

export default function VibrationDiagram({ support, x }: Props) {
  const width = 560;
  const height = 180;
  const padding = 40;
  const beamY = height / 2;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-semibold text-sm mb-3">Beam support layout</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line
          x1={padding}
          y1={beamY}
          x2={width - padding}
          y2={beamY}
          stroke="#0f172a"
          strokeWidth={6}
          strokeLinecap="round"
        />

        <polygon
          points={
            support === "cantilever"
              ? `${padding - 16},${beamY + 20} ${padding - 16},${beamY - 20} ${padding + 8},${beamY}`
              : `${padding - 20},${beamY + 24} ${padding + 8},${beamY + 24} ${padding + 8},${beamY}`
          }
          fill="#2563eb"
        />

        {support !== "cantilever" && (
          <polygon
            points={`${width - padding + 20},${beamY + 24} ${width - padding - 8},${beamY + 24} ${width - padding - 8},${beamY}`}
            fill="#2563eb"
          />
        )}

        {x.map((position, index) => {
          const xPos = padding + (position / x[x.length - 1]) * (width - padding * 2);
          return (
            <g key={index}>
              <circle cx={xPos} cy={beamY} r={3} fill="#0f172a" />
            </g>
          );
        })}
      </svg>
      <div className="text-sm text-slate-500 mt-3">Support type: {supportLabels[support]}</div>
    </div>
  );
}
