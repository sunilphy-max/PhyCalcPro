"use client";

import type { TrussResult } from "@/lib/structural/trusses/types";

type Props = {
  result: TrussResult;
};

export default function TrussDiagram({ result }: Props) {
  const width = 520;
  const height = 280;
  const padding = 40;
  const maxX = Math.max(...result.nodes.map((n) => n.x));
  const maxY = Math.max(...result.nodes.map((n) => n.y));
  const scaleX = (width - padding * 2) / maxX;
  const scaleY = (height - padding * 2) / maxY;
  const displacementScale = Math.min(scaleX, scaleY) * 2;

  const normalized = result.nodes.map((node, index) => ({
    x: padding + node.x * scaleX,
    y: height - padding - node.y * scaleY,
    dx: node.x + result.displacements[index].dx * displacementScale,
    dy: node.y + result.displacements[index].dy * displacementScale,
  }));

  const map = (x: number, y: number) => ({
    x: padding + x * scaleX,
    y: height - padding - y * scaleY,
  });

  const maxForce = Math.max(...result.memberForces.map((m) => Math.abs(m.force)), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-semibold text-sm mb-3">Truss geometry & deformation</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {result.elements.map((element) => {
          const start = normalized[element.start];
          const end = normalized[element.end];
          const force = result.memberForces.find((m) => m.id === element.id)?.force ?? 0;
          const intensity = Math.min(1, Math.abs(force) / maxForce);
          const color = force >= 0 ? `rgba(34, 197, 94, ${0.4 + intensity * 0.6})` : `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`;

          return (
            <g key={element.id}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#d1d5db"
                strokeWidth={3}
                opacity={0.45}
              />
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={color}
                strokeWidth={Math.max(2, 1 + intensity * 4)}
              />
            </g>
          );
        })}

        {result.nodes.map((node, index) => {
          const start = normalized[index];
          return (
            <g key={`node-${index}`}>
              <circle cx={start.x} cy={start.y} r={4} fill="#111827" stroke="#f8fafc" strokeWidth={1} />
              <text x={start.x + 6} y={start.y - 6} fontSize="10" fill="#475569">
                {index}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wider text-slate-500">Tension members</div>
          <div className="mt-2 text-sm text-slate-900">
            {result.memberForces.filter((m) => m.type === "tension").length} members
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs uppercase tracking-wider text-slate-500">Compression members</div>
          <div className="mt-2 text-sm text-slate-900">
            {result.memberForces.filter((m) => m.type === "compression").length} members
          </div>
        </div>
      </div>
    </div>
  );
}
