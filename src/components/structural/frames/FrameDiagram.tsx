"use client";

import { computeDeformationExaggeration } from "@/lib/display/deformationScale";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import type { FrameResult } from "@/lib/structural/frames/types";

type Props = {
  result: FrameResult;
};

export default function FrameDiagram({ result }: Props) {
  const width = 560;
  const height = 300;
  const padding = 40;
  const drawableW = width - padding * 2;
  const drawableH = height - padding * 2;

  const maxX = Math.max(...result.nodes.map((n) => n.x), 1e-6);
  const maxY = Math.max(...result.nodes.map((n) => n.y), 1e-6);
  const scaleX = drawableW / maxX;
  const scaleY = drawableH / maxY;

  const exaggeration = computeDeformationExaggeration({
    displacements: result.displacements,
    bboxWidthM: maxX,
    bboxHeightM: maxY,
    drawableWidthPx: drawableW,
    drawableHeightPx: drawableH,
    targetFraction: 0.12,
  });

  const toScreen = (xM: number, yM: number) => ({
    x: padding + xM * scaleX,
    y: height - padding - yM * scaleY,
  });

  const nodes = result.nodes.map((node, index) => {
    const disp = result.displacements[index];
    const ref = toScreen(node.x, node.y);
    const def = toScreen(
      node.x + disp.dx * exaggeration,
      node.y + disp.dy * exaggeration
    );
    return { ...ref, dx: def.x, dy: def.y };
  });

  const maxAxial = Math.max(...result.memberAxial.map((v) => Math.abs(v)), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">
          Frame deformation &amp; axial force
        </div>
        <span className="text-xs text-slate-500">
          Deformed shape ×{exaggeration.toFixed(0)} (visualization only)
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
        {result.elements.map((element, index) => {
          const start = nodes[element.start];
          const end = nodes[element.end];
          const axial = result.memberAxial[index];
          const stress = Math.abs(axial) / maxAxial;
          const color =
            axial >= 0
              ? `rgba(16, 185, 129, ${0.35 + stress * 0.65})`
              : `rgba(239, 68, 68, ${0.35 + stress * 0.65})`;

          return (
            <g key={element.id}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#cbd5e1"
                strokeWidth={2.5}
                strokeDasharray="6 4"
              />
              <line
                x1={start.dx}
                y1={start.dy}
                x2={end.dx}
                y2={end.dy}
                stroke={color}
                strokeWidth={Math.max(2, 1.5 + stress * 3)}
              />
            </g>
          );
        })}

        {nodes.map((point, index) => (
          <g key={`node-${index}`}>
            <circle cx={point.x} cy={point.y} r={3.5} fill="#94a3b8" />
            <circle cx={point.dx} cy={point.dy} r={4} fill="#0f172a" stroke="#f8fafc" strokeWidth={1} />
          </g>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-slate-300" />
          Undeformed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-6 rounded bg-emerald-500" />
          Tension (axial)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-6 rounded bg-red-500" />
          Compression (axial)
        </span>
        <span>
          Peak |u| ={" "}
          {formatEngineeringValue(result.maxDisplacement, "m", { useExponential: true })}
        </span>
      </div>
    </div>
  );
}
