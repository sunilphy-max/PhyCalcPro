"use client";

import { useCallback, useId, useState, type ReactNode } from "react";

export type DiagramPoint = { id: string; x: number; label?: string };

type Props = {
  /** Domain length in engineering units */
  length: number;
  points: DiagramPoint[];
  onPointDrag?: (id: string, x: number) => void;
  /** Optional SVG overlay (beam, loads, etc.) rendered in same viewBox */
  children?: ReactNode;
  height?: number;
  width?: number;
  snap?: number;
  className?: string;
};

/**
 * Shared 2D interaction kit (EDP-4) — drag handles along a 1D span.
 */
export default function InteractiveDiagramKit({
  length,
  points,
  onPointDrag,
  children,
  height = 160,
  width = 640,
  snap = 0,
  className = "",
}: Props) {
  const margin = 48;
  const [dragging, setDragging] = useState<string | null>(null);
  const clipId = useId();

  const scaleX = useCallback(
    (x: number) => (x / Math.max(length, 1e-9)) * (width - 2 * margin) + margin,
    [length, width]
  );

  const unscaleX = useCallback(
    (px: number, svgWidth: number) => {
      const raw = ((px / svgWidth) * length);
      const clamped = Math.max(0, Math.min(length, raw));
      if (snap > 0) return Math.round(clamped / snap) * snap;
      return clamped;
    },
    [length, snap]
  );

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !onPointDrag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onPointDrag(dragging, unscaleX(x, rect.width));
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full touch-none select-none ${className}`}
      onMouseMove={onMove}
      onMouseUp={() => setDragging(null)}
      onMouseLeave={() => setDragging(null)}
      role="img"
      aria-label="Interactive engineering diagram"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <line
          x1={margin}
          x2={width - margin}
          y1={height - 36}
          y2={height - 36}
          stroke="currentColor"
          className="text-slate-400"
          strokeWidth={2}
        />
        {children}
        {points.map((p) => (
          <g key={p.id}>
            <circle
              cx={scaleX(p.x)}
              cy={height - 36}
              r={dragging === p.id ? 9 : 7}
              className="fill-sky-600 stroke-white"
              strokeWidth={2}
              style={{ cursor: onPointDrag ? "ew-resize" : "default" }}
              onMouseDown={(e) => {
                e.preventDefault();
                setDragging(p.id);
              }}
            />
            {p.label ? (
              <text
                x={scaleX(p.x)}
                y={height - 18}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Build a simple SVG string for schematic export (EDP-4 CAD Phase A). */
export function exportDiagramSvgString(opts: {
  length: number;
  labels: string[];
  width?: number;
  height?: number;
}): string {
  const width = opts.width ?? 640;
  const height = opts.height ?? 200;
  const lines = opts.labels.map((l, i) => `<text x="24" y="${40 + i * 18}" font-size="12">${escapeXml(l)}</text>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fff"/>
  <text x="24" y="24" font-size="14" font-weight="bold">PhyCalcPro schematic (span ${opts.length})</text>
  <line x1="48" y1="160" x2="${width - 48}" y2="160" stroke="#334155" stroke-width="3"/>
  ${lines}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Minimal DXF LINE + TEXT schematic (EDP-4). */
export function exportDiagramDxf(opts: { length: number; title: string }): string {
  const L = opts.length;
  return `0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
30
0.0
11
${L}
21
0.0
31
0.0
0
TEXT
8
0
10
0.0
20
0.5
30
0.0
40
0.2
1
${opts.title}
0
ENDSEC
0
EOF
`;
}
