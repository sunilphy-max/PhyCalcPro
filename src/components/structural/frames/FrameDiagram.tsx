"use client";

import type { FrameResult } from "@/lib/structural/frames/types";

type Props = {
  result: FrameResult;
};

export default function FrameDiagram({ result }: Props) {
  const width = 560;
  const height = 300;
  const padding = 40;
  const maxX = Math.max(...result.nodes.map((n) => n.x));
  const maxY = Math.max(...result.nodes.map((n) => n.y));
  const scaleX = (width - padding * 2) / maxX;
  const scaleY = (height - padding * 2) / maxY;
  const dispScale = Math.min(scaleX, scaleY) * 4;

  const nodes = result.nodes.map((node, index) => ({
    x: padding + node.x * scaleX,
    y: height - padding - node.y * scaleY,
    dx: padding + (node.x + result.displacements[index].dx * dispScale) * scaleX,
    dy: height - padding - (node.y + result.displacements[index].dy * dispScale) * scaleY,
  }));

  const maxAxial = Math.max(...result.memberAxial.map((v) => Math.abs(v)), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-semibold text-sm mb-3">Frame deformation & axial force</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {result.elements.map((element, index) => {
          const start = nodes[element.start];
          const end = nodes[element.end];
          const stress = Math.abs(result.memberAxial[index]) / maxAxial;
          const color = result.memberAxial[index] >= 0 ? `rgba(16, 185, 129, ${0.3 + stress * 0.7})` : `rgba(239, 68, 68, ${0.3 + stress * 0.7})`;

          return (
            <g key={element.id}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#cbd5e1" strokeWidth={3} opacity={0.45} />
              <line x1={start.dx} y1={start.dy} x2={end.dx} y2={end.dy} stroke={color} strokeWidth={Math.max(2, 1 + stress * 4)} />
            </g>
          );
        })}

        {nodes.map((point, index) => (
          <g key={`node-${index}`}>
            <circle cx={point.x} cy={point.y} r={4} fill="#0f172a" stroke="#f8fafc" strokeWidth={1} />
          </g>
        ))}
      </svg>
    </div>
  );
}
